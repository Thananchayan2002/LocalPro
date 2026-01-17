import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, MapPin, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion, useMotionValue } from "framer-motion";

import { validateName, validateEmail } from "../utils/validation";
import { useTypewriter } from "../hooks/useTypewriter";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/* -------------------------------------------
   MOTION VARIANTS (MATCH SIGNUP PAGE)
------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 32 },
  },
};

const MobileSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const y = useMotionValue(0);
  const abortRef = React.useRef(null);
  const mountedRef = React.useRef(true);

  const { displayText, isComplete: titleComplete } = useTypewriter(
    "Complete your profile",
    70,
    200
  );
  const { displayText: subtitleText, isComplete: subtitleComplete } =
    useTypewriter("One final step to get started", 50, 1600);

  const showForm = titleComplete && subtitleComplete;

  // Get phone number and verification status from login redirect
  const phoneNumber = location.state?.phoneNumber || "";
  const isPhoneVerified = location.state?.phoneVerified === true;

  // Form state (passwordless authentication)
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect to login if no verified phone
  useEffect(() => {
    if (!isPhoneVerified || !phoneNumber) {
      toast.error("Please verify your phone number first");
      navigate("/login");
    }
  }, [isPhoneVerified, phoneNumber, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Handle form input change
  const handleChange = useCallback(
    (field, value) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  // Validate form (passwordless - no password required)
  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(form.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission - complete profile
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);
      try {
        // Abort any previous request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch(
          `${API_BASE_URL}/api/auth/complete-profile`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber,
              name: form.name,
              email: form.email || undefined,
              location: form.location || undefined,
            }),
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || data?.success === false) {
          throw new Error(data.message || "Profile completion failed");
        }

        toast.success("Account created successfully!");
        navigate("/app");
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Signup error:", error);
          toast.error(error.message || "Failed to create account");
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [form, phoneNumber, navigate]
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.15}
      style={{
        y,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: "var(--color-surface)",
      }}
      onDragEnd={(_, info) => {
        // keep existing dismiss behavior
        if (info.offset.y > 120) navigate(-1);
      }}
      transition={{ type: "spring", damping: 28 }}
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* Scrollable screen content (native mobile feel) */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex items-center justify-center">
        <motion.div variants={itemVariants} className="w-full max-w-md">
          {/* Card container (match desktop Signup styles) */}
          <div
            className="w-full rounded-2xl shadow-xl border p-6 sm:p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Title */}
            <div className="text-center mb-6">
              <h1
                className="text-2xl font-semibold tracking-tight"
                style={{ color: "var(--color-text)" }}
              >
                {displayText}
              </h1>
              <p
                className="mt-1.5 text-sm leading-relaxed"
                style={{ color: "var(--color-text-muted)" }}
              >
                {subtitleText}
              </p>
            </div>

            {/* Verified Badge */}
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6 flex items-start gap-3 rounded-2xl border p-4"
                style={{
                  borderColor: "var(--color-success)",
                  backgroundColor: "var(--color-success-soft)",
                }}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_12px_28px_-18px_rgba(5,150,105,0.65)]"
                  style={{
                    backgroundColor: "var(--color-success)",
                    color: "var(--color-surface)",
                  }}
                >
                  <CheckCircle size={18} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-success-strong)" }}
                  >
                    Your phone number has been successfully verified
                  </p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            {showForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                {/* NAME */}
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    Full Name{" "}
                    <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: errors.name
                          ? "var(--color-danger)"
                          : "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      className={[
                        "w-full rounded-2xl border px-4 py-3.5 text-[15px]",
                        "shadow-[0_10px_26px_-20px_rgba(15,23,42,0.45)]",
                        "outline-none transition",
                        "disabled:cursor-not-allowed disabled:opacity-70",
                        "focus:ring-4",
                      ].join(" ")}
                      onFocus={(e) => {
                        e.target.style.borderColor = errors.name
                          ? "var(--color-danger)"
                          : "var(--color-primary)";
                        e.target.style.boxShadow = errors.name
                          ? "0 0 0 4px var(--color-danger-soft)"
                          : "0 0 0 4px var(--color-primary-soft)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.name
                          ? "var(--color-danger)"
                          : "var(--color-border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {errors.name && (
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--color-danger)" }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    Email{" "}
                    <span style={{ color: "var(--color-text-subtle)" }}>
                      (optional)
                    </span>
                  </label>

                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--color-text-subtle)" }}
                    >
                      <Mail size={18} />
                    </span>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: errors.email
                          ? "var(--color-danger)"
                          : "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      className={[
                        "w-full rounded-2xl border py-3.5 pl-10 pr-4 text-[15px]",
                        "shadow-[0_10px_26px_-20px_rgba(15,23,42,0.45)]",
                        "outline-none transition",
                        "disabled:cursor-not-allowed disabled:opacity-70",
                        "focus:ring-4",
                      ].join(" ")}
                      onFocus={(e) => {
                        e.target.style.borderColor = errors.email
                          ? "var(--color-danger)"
                          : "var(--color-primary)";
                        e.target.style.boxShadow = errors.email
                          ? "0 0 0 4px var(--color-danger-soft)"
                          : "0 0 0 4px var(--color-primary-soft)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.email
                          ? "var(--color-danger)"
                          : "var(--color-border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {errors.email && (
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--color-danger)" }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* LOCATION */}
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    Location{" "}
                    <span style={{ color: "var(--color-text-subtle)" }}>
                      (optional)
                    </span>
                  </label>

                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--color-text-subtle)" }}
                    >
                      <MapPin size={18} />
                    </span>

                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="City / Area"
                      disabled={loading}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      className={[
                        "w-full rounded-2xl border py-3.5 pl-10 pr-4 text-[15px]",
                        "shadow-[0_10px_26px_-20px_rgba(15,23,42,0.45)]",
                        "outline-none transition focus:ring-4",
                        "disabled:cursor-not-allowed disabled:opacity-70",
                      ].join(" ")}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-primary)";
                        e.target.style.boxShadow =
                          "0 0 0 4px var(--color-primary-soft)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--color-border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{
                    background:
                      "var(--color-primary-gradient, linear-gradient(135deg, var(--color-primary), var(--color-primary-strong)))",
                    color: "var(--color-surface)",
                  }}
                  className={[
                    "group relative mt-2 w-full cursor-pointer overflow-hidden rounded-2xl",
                    "px-4 py-3.5 text-[15px] font-semibold",
                    "shadow-[0_18px_40px_-22px_rgba(37,99,235,0.75)]",
                    "transition",
                    "hover:shadow-[0_22px_52px_-26px_rgba(37,99,235,0.9)]",
                    "focus:outline-none focus:ring-4",
                    "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-[0_18px_40px_-22px_rgba(37,99,235,0.75)]",
                  ].join(" ")}
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "0 0 0 4px var(--color-primary-soft)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "0 18px 40px -22px rgba(37,99,235,0.75)";
                  }}
                >
                  {/* Subtle sheen */}
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="absolute -left-24 top-0 h-full w-24 rotate-12 bg-white/20 blur-md" />
                  </span>

                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight
                          size={18}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Footer hint */}
                <motion.p
                  className="pt-2 text-center text-xs leading-relaxed"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  By continuing, you'll finish setting up your profile and enter
                  the app.
                </motion.p>
              </motion.form>
            )}

            {/* Bottom spacing */}
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6 text-center"
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  Secure signup • Fast onboarding • Smooth experience
                </p>
              </motion.div>
            )}
          </div>

          {/* Extra scroll breathing room */}
          <div className="h-10" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileSignup;
