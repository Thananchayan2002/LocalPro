import React, { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";

import PhoneAuth from "./PhoneAuth";
import { useAnimations } from "../users/components/animations/animations";
import { useAuth } from "../worker/context/AuthContext";
import { useTypewriter } from "../hooks/useTypewriter";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 32,
    },
  },
};

const hintVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const MobileLogin = () => {
  const navigate = useNavigate();
  const { fadeInUp } = useAnimations();
  const y = useMotionValue(0);

  const { displayText } = useTypewriter("Welcome to", 80, 300);
  const { displayText: subtitleText } = useTypewriter(
    "To continue, enter your phone number",
    50,
    1500
  );

  const { setAuthData } = useAuth();

  // --- Alignment with Login page behavior ---
  const mountedRef = useRef(true);

  // Dedupe: prevent double onVerified calls + double toasts
  const handlingRef = useRef(false);
  const lastHandledKeyRef = useRef("");
  const successToastRef = useRef(false);

  const showLoginSuccessOnce = useCallback((msg = "Login successful!") => {
    if (successToastRef.current) return;
    successToastRef.current = true;
    toast.success(msg);
  }, []);

  // Login existing user (returns { user } or null) - same behavior as Login page
  const loginExistingUser = useCallback(
    async (phoneE164, showToast = true) => {
      try {
        const controller = new AbortController();

        const res = await fetch(`${API_BASE_URL}/api/auth/login-with-phone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: phoneE164 }),
          credentials: "include",
          signal: controller.signal,
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (mountedRef.current) {
            setAuthData(data.user);
            localStorage.setItem("userPhone", phoneE164);
            localStorage.setItem("phone_verified", "true");
          }
          return { user: data.user };
        } else {
          if (showToast && mountedRef.current) {
            toast.error(data.message || "Login failed");
          }
          return null;
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Login error:", error);
          if (showToast && mountedRef.current) {
            toast.error("Network error. Please try again.");
          }
        }
        return null;
      }
    },
    [setAuthData]
  );

  // Fully aligned onVerified handler (logic mirrors Login page)
  const handlePhoneVerified = useCallback(
    async ({ phoneE164, userExists, user }) => {
      const key = `${phoneE164 || "no-phone"}:${String(userExists)}:${
        user?._id || "no-user"
      }`;

      if (handlingRef.current && lastHandledKeyRef.current === key) return;
      handlingRef.current = true;
      lastHandledKeyRef.current = key;

      try {
        if (!userExists) {
          // Fallback: attempt login API once before redirecting to signup
          const fallback = await loginExistingUser(phoneE164, false);

          if (fallback) {
            const existingUser = fallback.user;

            if (existingUser?.role === "professional") {
              if (existingUser?.status === "active") {
                if (mountedRef.current) {
                  showLoginSuccessOnce();
                  navigate("/worker/dashboard", { replace: true });
                }
                return;
              } else {
                if (mountedRef.current) {
                  toast.error(
                    existingUser?.status
                      ? `Account status: ${existingUser.status}`
                      : "Account not active."
                  );
                }
                return;
              }
            }

            if (mountedRef.current) {
              showLoginSuccessOnce();
              navigate("/app", { replace: true });
            }
            return;
          }

          if (mountedRef.current) {
            toast.success("Phone verified! Please complete your profile.");
            navigate("/signup", {
              state: { phoneNumber: phoneE164, phoneVerified: true },
              replace: true,
            });
          }
          return;
        }

        // userExists true
        let existingUser = user || null;

        if (!existingUser) {
          const res = await loginExistingUser(phoneE164, false);
          if (!res) return;
          existingUser = res.user;
        }

        if (mountedRef.current) {
          setAuthData(existingUser);
          localStorage.setItem("userPhone", phoneE164);
          localStorage.setItem("phone_verified", "true");
        }

        if (existingUser?.role === "professional") {
          if (existingUser?.status === "active") {
            if (mountedRef.current) {
              showLoginSuccessOnce();
              navigate("/worker/dashboard", { replace: true });
            }
            return;
          } else {
            if (mountedRef.current) {
              toast.error(
                existingUser?.status
                  ? `Account status: ${existingUser.status}`
                  : "Account not active."
              );
            }
            return;
          }
        }

        if (mountedRef.current) {
          showLoginSuccessOnce();
          navigate("/app", { replace: true });
        }
      } finally {
        // small release so accidental rapid double events don’t fire twice
        setTimeout(() => {
          handlingRef.current = false;
        }, 600);
      }
    },
    [loginExistingUser, navigate, setAuthData, showLoginSuccessOnce]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: 40 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.12}
        style={{
          y,
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120) navigate(-1);
        }}
        transition={{ type: "spring", damping: 30 }}
        className="fixed inset-0 z-50 bg-white flex flex-col"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col justify-center px-6 py-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {displayText}{" "}
              <span>
                <span style={{ color: "#0f64c8" }}>Help</span>
                <span style={{ color: "#1fa34a" }}>Go</span>
              </span>
            </h1>
            <p className="text-gray-600 text-base">{subtitleText}</p>
          </motion.div>

          {/* Phone Auth */}
          <motion.div
            variants={itemVariants}
            whileTap={{ scale: 0.985 }}
            className="w-full"
          >
            <PhoneAuth
              initialCountryDial="+94"
              onVerified={handlePhoneVerified}
              variant="login"
              suppressVerifiedToast={true}
            />
          </motion.div>

          {/* OTP hint */}
          <motion.p
            variants={hintVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 text-sm text-gray-500 text-center"
          >
            Waiting for SMS… OTP will be filled automatically if supported
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileLogin;
