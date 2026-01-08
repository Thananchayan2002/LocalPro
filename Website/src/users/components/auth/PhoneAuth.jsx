import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { colors } from "../../../styles/colors";
import {
  toE164FromAny,
  validatePhoneNumber,
  stripCountryDialFromInput,
  normalizeLocalPhone,
  buildE164Phone,
} from "../../../utils/phoneValidation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const LK_COUNTRY = { code: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰" };

const STORAGE = {
  token: "token",
  user: "user",
  userPhone: "userPhone",
  phoneVerified: "phone_verified",
};

const OTP_LENGTH = 6;
const OTP_EXPIRES_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 30; // 30 seconds

async function safeJson(res) {
  // Some servers return empty body or non-JSON on error
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/**
 * Reusable PhoneAuth Component (Sri Lanka +94 only)
 *
 * @param {Object} props
 * @param {string} props.initialCountryDial - Initial dial (accepted only if "+94")
 * @param {Function} props.onVerified - Callback({ phoneE164, user, token })
 * @param {string} props.className - Additional CSS classes
 * @param {"login"|"signup"} props.variant - Layout variant
 */
export default function PhoneAuth({
  initialCountryDial = "+94",
  onVerified,
  className = "",
  variant = "login",
}) {
  const isLoginLayout = variant === "login";
  const purpose = variant === "signup" ? "SIGNUP" : "LOGIN";

  // This component is LK-only in UI; keep dial strict.
  const [countryDial] = useState(initialCountryDial === "+94" ? "+94" : "+94");

  const [rawPhone, setRawPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);

  const [errors, setErrors] = useState({ phone: "", otp: "" });
  const [touched, setTouched] = useState({ phone: false, otp: false });

  const notifiedRef = useRef(false);
  const mountedRef = useRef(true);
  const sendAbortRef = useRef(null);
  const verifyAbortRef = useRef(null);
  const lastVerifiedOtpRef = useRef("");

  const countryDigits = useMemo(
    () => (countryDial || "").replace("+", ""),
    [countryDial]
  );

  const canShowOtpInput = otpSent && !phoneVerified; // ✅ fixed: independent of cooldown

  const setFieldError = useCallback((field, msg) => {
    setErrors((e) => ({ ...e, [field]: msg || "" }));
  }, []);

  const clearFieldError = useCallback(
    (field) => setFieldError(field, ""),
    [setFieldError]
  );

  const triggerHapticSuccess = useCallback(() => {
    if (typeof window === "undefined") return;
    if (navigator?.vibrate) {
      navigator.vibrate([12, 8, 12]);
    }
  }, []);

  const validateOtpCode = useCallback((code) => {
    const v = (code || "").replace(/\D/g, "");
    if (!v) return "OTP is required.";
    if (v.length !== OTP_LENGTH) return "OTP must be exactly 6 digits.";
    return "";
  }, []);

  const buildE164 = useCallback((dial, localDigits) => {
    const local = (localDigits || "").replace(/[^\d]/g, "");
    return `${dial}${local}`;
  }, []);

  const resendProgress = useMemo(() => {
    if (!otpSent) return 0;
    const elapsed = RESEND_COOLDOWN_SECONDS - resendCooldown;
    const pct = (elapsed / RESEND_COOLDOWN_SECONDS) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [otpSent, resendCooldown]);

  // Cooldown timer
  useEffect(() => {
    if (!resendCooldown) return;
    const id = setInterval(
      () => setResendCooldown((s) => Math.max(0, s - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Web OTP API: auto-fill when supported
  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const controller = new AbortController();

    navigator.credentials
      .get({ otp: { transport: ["sms"] }, signal: controller.signal })
      .then((otpCred) => {
        if (!otpCred?.code) return;
        const code = (otpCred.code || "")
          .replace(/\D/g, "")
          .slice(0, OTP_LENGTH);
        if (!code) return;
        setOtp(code);
        setTouched((t) => ({ ...t, otp: true }));
        clearFieldError("otp");
        toast.success("OTP detected automatically");
      })
      .catch(() => {
        /* Silent fail — expected on unsupported devices */
      });

    return () => controller.abort();
  }, [clearFieldError]);

  // Component mount/unmount safety
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (sendAbortRef.current) sendAbortRef.current.abort();
      if (verifyAbortRef.current) verifyAbortRef.current.abort();
    };
  }, []);

  // Bootstrap from localStorage (prefill + session restore)
  useEffect(() => {
    const savedPhone = localStorage.getItem(STORAGE.userPhone) || "";
    if (savedPhone && /^\+\d{6,15}$/.test(savedPhone)) {
      if (savedPhone.startsWith(LK_COUNTRY.dial)) {
        const local = savedPhone.slice(LK_COUNTRY.dial.length);
        setRawPhone(local);
      }
    }

    const verified = localStorage.getItem(STORAGE.phoneVerified) === "true";
    const token = localStorage.getItem(STORAGE.token);
    const userStr = localStorage.getItem(STORAGE.user);

    // Only auto-verify if we still have a session payload
    if (verified && token && userStr && !notifiedRef.current) {
      try {
        const user = JSON.parse(userStr);
        notifiedRef.current = true;
        setPhoneVerified(true);
        const phoneE164 = localStorage.getItem(STORAGE.userPhone) || "";
        onVerified?.({ phoneE164, user, token });
      } catch (e) {
        // If corrupted user json, clear session
        localStorage.removeItem(STORAGE.token);
        localStorage.removeItem(STORAGE.user);
        localStorage.removeItem(STORAGE.userPhone);
        localStorage.removeItem(STORAGE.phoneVerified);
      }
    } else if (!token) {
      // Clear stale verification flag when no token exists
      localStorage.removeItem(STORAGE.phoneVerified);
    }
  }, [onVerified]);

  // If phone changes after OTP sent, reset OTP flow (prevents verifying wrong number)
  useEffect(() => {
    if (!otpSent) return;
    // Any change to the phone should invalidate previously sent OTP UI state
    setOtp("");
    lastVerifiedOtpRef.current = "";
    setOtpSent(false);
    setResendCooldown(0);
    clearFieldError("otp");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPhone]); // intentionally only rawPhone: reset when phone changes

  const handlePhoneChange = (e) => {
    const nextLocal = stripCountryDialFromInput(e.target.value, countryDial);
    setRawPhone(nextLocal);

    // Clear prior errors; full validation runs on Send OTP
    if (errors.phone) clearFieldError("phone");
  };

  const handlePhoneBlur = () => {
    setTouched((t) => ({ ...t, phone: true }));
  };

  const handleOtpChange = (e) => {
    const v = (e.target.value || "").replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(v);

    // Validate immediately on every keystroke
    setFieldError("otp", validateOtpCode(v));
  };

  const handleOtpBlur = () => {
    setTouched((t) => ({ ...t, otp: true }));
    setFieldError("otp", validateOtpCode(otp));
  };

  const PhoneError = () =>
    errors.phone ? (
      <p className="mt-1 text-xs" style={{ color: colors.error.DEFAULT }}>
        {errors.phone}
      </p>
    ) : null;

  const OtpError = () =>
    errors.otp ? (
      <p className="mt-1 text-xs" style={{ color: colors.error.DEFAULT }}>
        {errors.otp}
      </p>
    ) : null;

  const sendOtp = async () => {
    if (phoneVerified) return;

    setTouched((t) => ({ ...t, phone: true }));

    const phoneMsg = validatePhoneNumber(rawPhone, countryDial);
    setFieldError("phone", phoneMsg);
    if (phoneMsg) return;

    const local = normalizeLocalPhone(rawPhone);
    const e164 = buildE164Phone(countryDial, local);

    // Abort any previous send request
    if (sendAbortRef.current) sendAbortRef.current.abort();
    const controller = new AbortController();
    sendAbortRef.current = controller;

    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: e164, purpose }),
        signal: controller.signal,
      });

      const data = await safeJson(res);

      if (res.ok && data?.success) {
        if (!mountedRef.current) return;
        setOtp("");
        lastVerifiedOtpRef.current = "";
        setOtpSent(true);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        clearFieldError("otp");
        toast.success("OTP sent!", { duration: 3000 });
      } else {
        const errorMsg = data?.message || "Failed to send OTP.";
        if (!mountedRef.current) return;
        setFieldError("phone", errorMsg);
        toast.error(errorMsg, { duration: 3000 });
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      const errorMsg = "Failed to send OTP. Please try again.";
      if (!mountedRef.current) return;
      setFieldError("phone", errorMsg);
      toast.error(errorMsg, { duration: 3000 });
    } finally {
      if (mountedRef.current) setSending(false);
    }
  };

  const verifyOtp = useCallback(async () => {
    if (phoneVerified || verifying) return;

    const currentOtp = otp;
    lastVerifiedOtpRef.current = currentOtp;

    setTouched((t) => ({ ...t, otp: true, phone: true }));

    const otpMsg = validateOtpCode(currentOtp);
    setFieldError("otp", otpMsg);
    if (otpMsg) return;

    const phoneMsg = validatePhoneNumber(rawPhone, countryDial);
    setFieldError("phone", phoneMsg);
    if (phoneMsg) return;

    const e164 = buildE164Phone(countryDial, normalizeLocalPhone(rawPhone));

    // Abort any previous verify request
    if (verifyAbortRef.current) verifyAbortRef.current.abort();
    const controller = new AbortController();
    verifyAbortRef.current = controller;

    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: e164, otp: currentOtp, purpose }),
        signal: controller.signal,
      });

      const data = await safeJson(res);

      if (!res.ok || !data?.success) {
        const errorMsg = data?.message || "Invalid OTP.";
        if (!mountedRef.current) return;
        setFieldError("otp", errorMsg);
        toast.error(errorMsg, { duration: 3000 });
        return;
      }

      const token = data?.token || null;
      const user = data?.user || null;
      const userExists = data?.userExists;
      const phoneE164 = data?.phoneNumber || e164;

      // If token+user returned (login existing user), persist session
      if (token && user) {
        localStorage.setItem(STORAGE.token, token);
        localStorage.setItem(STORAGE.user, JSON.stringify(user));
        localStorage.setItem(STORAGE.userPhone, phoneE164);
        localStorage.setItem(STORAGE.phoneVerified, "true");
        if (!mountedRef.current) return;
        setPhoneVerified(true);
        triggerHapticSuccess();
        toast.success("Phone verified!", { duration: 3000 });
        onVerified?.({ phoneE164, user, token, userExists: true });
        return;
      }

      // No token/user returned: treat as verified phone (e.g., signup flow or login with no account)
      if (!mountedRef.current) return;
      setPhoneVerified(true);
      localStorage.setItem(STORAGE.userPhone, phoneE164);
      localStorage.removeItem(STORAGE.token);
      localStorage.removeItem(STORAGE.user);
      localStorage.removeItem(STORAGE.phoneVerified);
      triggerHapticSuccess();
      toast.success("Phone verified!", { duration: 3000 });
      onVerified?.({ phoneE164, user: null, token: null, userExists });
    } catch (err) {
      if (err?.name === "AbortError") return;
      const errorMsg = "Verification failed. Please try again.";
      if (!mountedRef.current) return;
      setFieldError("otp", errorMsg);
      toast.error(errorMsg, { duration: 3000 });
    } finally {
      if (mountedRef.current) setVerifying(false);
    }
  }, [
    phoneVerified,
    verifying,
    otp,
    validateOtpCode,
    rawPhone,
    countryDial,
    purpose,
    triggerHapticSuccess,
    onVerified,
  ]);

  const resendDisabled = sending || resendCooldown > 0 || phoneVerified;

  // Auto-verify when OTP reaches required length
  useEffect(() => {
    if (
      otp.length === OTP_LENGTH &&
      !verifying &&
      !sending &&
      !phoneVerified &&
      otp !== lastVerifiedOtpRef.current
    ) {
      verifyOtp();
    }
  }, [otp, verifying, sending, phoneVerified, verifyOtp]);

  const ResendTimer = () =>
    otpSent && !phoneVerified ? (
      <div
        className="flex items-center gap-3 mt-2 text-xs"
        style={{ color: colors.text.secondary }}
      >
        <span>
          {resendCooldown > 0
            ? `You can resend in ${resendCooldown}s`
            : "Didn't get the SMS? You can resend now."}
        </span>
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.border.light }}
        >
          <div
            className="h-full"
            style={{
              width: `${resendCooldown > 0 ? resendProgress : 100}%`,
              background: colors.primary.gradient,
              transition: "width 1s linear",
            }}
          />
        </div>
      </div>
    ) : null;

  return (
    <div className={className}>
      {isLoginLayout ? (
        <>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            Phone Number
          </label>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="w-20">
                <div
                  className="w-full rounded-lg border bg-white px-3 py-3 text-base flex items-center justify-center font-medium"
                  style={{ borderColor: colors.border.DEFAULT }}
                >
                  {LK_COUNTRY.flag} {LK_COUNTRY.dial}
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full rounded-lg border bg-white pl-10 pr-3 py-3 text-base focus:outline-none focus:ring-2"
                    style={{
                      borderColor:
                        errors.phone && touched.phone
                          ? colors.error.DEFAULT
                          : colors.border.DEFAULT,
                      "--tw-ring-color":
                        errors.phone && touched.phone
                          ? colors.error.light
                          : colors.primary.DEFAULT,
                    }}
                    placeholder="77XXXXXXX (no leading 0)"
                    value={rawPhone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    disabled={phoneVerified || sending || verifying}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-invalid={Boolean(errors.phone && touched.phone)}
                    aria-describedby="phone-error"
                  />
                  <Phone
                    className="absolute left-3 top-3.5"
                    style={{ color: colors.text.tertiary }}
                    size={18}
                  />
                </div>
                <div id="phone-error">
                  <PhoneError />
                </div>
              </div>
            </div>

            {!phoneVerified ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={resendDisabled}
                className="w-full rounded-lg font-semibold py-3 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: colors.primary.gradient,
                  color: colors.text.inverse,
                }}
              >
                {sending && <Loader2 className="animate-spin" size={18} />}
                {sending
                  ? "Sending..."
                  : otpSent && resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : otpSent
                  ? "Resend OTP"
                  : "Send OTP"}
              </button>
            ) : (
              <div
                className="w-full rounded-lg font-semibold py-3 flex items-center justify-center"
                style={{
                  backgroundColor: colors.success.DEFAULT,
                  color: colors.text.inverse,
                }}
              >
                ✓ Verified
              </div>
            )}

            <ResendTimer />
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            Phone Number
          </label>

          <div className="flex gap-2">
            <div className="w-20">
              <div
                className="w-full rounded-xl border-2 bg-white px-3 py-3 text-base flex items-center justify-center font-medium"
                style={{ borderColor: colors.border.DEFAULT }}
              >
                {LK_COUNTRY.flag} {LK_COUNTRY.dial}
              </div>
            </div>

            <div className="flex-1">
              <div className="relative">
                <input
                  type="tel"
                  className="w-full rounded-xl border-2 bg-white pl-10 pr-3 py-3 text-base focus:outline-none focus:ring-2"
                  style={{
                    borderColor:
                      errors.phone && touched.phone
                        ? colors.error.DEFAULT
                        : colors.border.DEFAULT,
                    "--tw-ring-color":
                      errors.phone && touched.phone
                        ? colors.error.light
                        : colors.primary.DEFAULT,
                  }}
                  placeholder="77XXXXXXX (no leading 0)"
                  value={rawPhone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  disabled={phoneVerified || sending || verifying}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  aria-invalid={Boolean(errors.phone && touched.phone)}
                  aria-describedby="phone-error"
                />
                <Phone
                  className="absolute left-3 top-3.5"
                  style={{ color: colors.text.tertiary }}
                  size={18}
                />
              </div>
              <div id="phone-error">
                <PhoneError />
              </div>
            </div>
          </div>

          {!phoneVerified ? (
            <button
              type="button"
              onClick={sendOtp}
              disabled={resendDisabled}
              className="w-full rounded-xl font-semibold py-3 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: colors.primary.gradient,
                color: colors.text.inverse,
              }}
            >
              {sending && <Loader2 className="animate-spin" size={18} />}
              {sending
                ? "Sending..."
                : otpSent && resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : otpSent
                ? "Resend OTP"
                : "Send OTP"}
            </button>
          ) : (
            <div
              className="w-full rounded-xl font-semibold py-3 flex items-center justify-center"
              style={{
                backgroundColor: colors.success.DEFAULT,
                color: colors.text.inverse,
              }}
            >
              ✓ Verified
            </div>
          )}

          <ResendTimer />
        </div>
      )}

      {/* OTP Input Row */}
      {canShowOtpInput && (
        <div className="mt-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                className={[
                  isLoginLayout ? "rounded-lg" : "rounded-xl",
                  "w-full border-2 px-3 py-3 focus:outline-none focus:ring-2",
                ].join(" ")}
                style={{
                  borderColor:
                    errors.otp && touched.otp
                      ? colors.error.DEFAULT
                      : colors.border.DEFAULT,
                  "--tw-ring-color":
                    errors.otp && touched.otp
                      ? colors.error.light
                      : colors.primary.DEFAULT,
                }}
                placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
                value={otp}
                onChange={handleOtpChange}
                onBlur={handleOtpBlur}
                maxLength={OTP_LENGTH}
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-invalid={Boolean(errors.otp && touched.otp)}
                aria-describedby="otp-error"
                disabled={verifying || sending}
              />
              <div id="otp-error">
                <OtpError />
              </div>
            </div>
          </div>

          <div
            className="mt-2 flex items-center justify-between text-xs"
            style={{ color: colors.text.secondary }}
          >
            <span>Masked OTP</span>
            <div className="flex items-center gap-2" aria-hidden="true">
              {Array.from({ length: OTP_LENGTH }).map((_, idx) => {
                const filled = idx < otp.length;
                return (
                  <span
                    key={idx}
                    className="w-3.5 h-3.5 rounded-full inline-block"
                    style={{
                      backgroundColor: filled
                        ? colors.primary.DEFAULT
                        : colors.border.light,
                      transform: filled ? "scale(1.1)" : "scale(1)",
                      opacity: filled ? 1 : 0.55,
                      transition:
                        "transform 160ms ease, opacity 160ms ease, background-color 160ms ease",
                      boxShadow: filled
                        ? `0 0 0 4px ${colors.primary.light}`
                        : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
