import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, useMotionValue } from "framer-motion";

import PhoneAuth from "./PhoneAuth";
import { useAnimations } from "../users/components/animations/animations";
import { useAuth } from "../worker/context/AuthContext";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const MobileLogin = () => {
    const navigate = useNavigate();
    const { fadeInUp } = useAnimations();
    const y = useMotionValue(0);
    const abortRef = React.useRef(null);
    const mountedRef = React.useRef(true);

    /* -------------------------------------------
       PHONE VERIFIED HANDLER
       ------------------------------------------- */
    const { setAuthData } = useAuth();
    const handlePhoneVerified = async ({ phoneE164, userExists }) => {
        try {
            // Abort any previous request
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            if (userExists) {
                const res = await fetch(`${API_BASE_URL}/api/auth/login-with-phone`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phoneNumber: phoneE164 }),
                    signal: controller.signal,
                });

                const data = await res.json();

                if (!res.ok || !data?.token) {
                    if (mountedRef.current) {
                        toast.error(data?.message || "Login failed. Please try again.");
                    }
                    return;
                }

                if (mountedRef.current) {
                    // Persist via AuthContext
                    setAuthData(data.token, data.user);
                    localStorage.setItem("userPhone", phoneE164);
                    localStorage.setItem("phone_verified", "true");
                    toast.success("Logged in successfully");

                    // Route based on role and status
                    if (data.user.role === "professional" && data.user.status === "active") {
                        navigate("/worker/dashboard");
                    } else if (data.user.role === "professional") {
                        // Not active / blocked
                        toast.error(data.user.status ? `Account status: ${data.user.status}` : "Account not active.");
                    } else {
                        navigate("/app");
                    }
                }
            } else {
                // Fallback: try login-with-phone once before redirecting to signup
                try {
                    const fallbackRes = await fetch(`${API_BASE_URL}/api/auth/login-with-phone`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phoneNumber: phoneE164 }),
                        signal: controller.signal,
                    });
                    const fallbackData = await fallbackRes.json();

                    if (fallbackRes.ok && fallbackData?.token) {
                        if (mountedRef.current) {
                            setAuthData(fallbackData.token, fallbackData.user);
                            localStorage.setItem("userPhone", phoneE164);
                            localStorage.setItem("phone_verified", "true");
                            toast.success("Logged in successfully");

                            if (fallbackData.user.role === "professional" && fallbackData.user.status === "active") {
                                navigate("/worker/dashboard");
                            } else if (fallbackData.user.role === "professional") {
                                toast.error(fallbackData.user.status ? `Account status: ${fallbackData.user.status}` : "Account not active.");
                            } else {
                                navigate("/app");
                            }
                        }
                        return;
                    }
                } catch (err) {
                    // Ignore and fall through to signup
                }

                if (mountedRef.current) {
                    navigate("/signup", {
                        state: { phoneNumber: phoneE164, phoneVerified: true },
                    });
                }
            }
        } catch (error) {
            if (error?.name !== "AbortError" && mountedRef.current) {
                toast.error("Network error. Please try again.");
            }
        }
    };

    // Cleanup on unmount
    React.useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            style={{
                y,
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
            }}
            onDragEnd={(_, info) => {
                if (info.offset.y > 120) navigate(-1);
            }}
            transition={{ type: "spring", damping: 28 }}
            className="
        fixed inset-0 z-50
        bg-white
        rounded-t-[28px]
        flex flex-col
        shadow-2xl
      "
        >
            {/* Header */}
            <div className="px-6 pb-6 border-b border-gray-100 pt-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome to LocalPro
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    To continue, enter your phone number
                </p>
            </div>

            {/* Body */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
                <PhoneAuth
                    initialCountryDial="+94"
                    variant="login"
                    onVerified={handlePhoneVerified}
                />

                {/* OTP helper */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                    Waiting for SMS… OTP will be filled automatically if supported
                </p>

                <div className="h-24" />
            </div>
        </motion.div>
    );
};

export default MobileLogin;
