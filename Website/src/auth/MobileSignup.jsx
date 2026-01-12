import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, MapPin, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion, useMotionValue } from "framer-motion";

import { useAnimations } from "../users/components/animations/animations";
import { colors } from "../styles/colors";
import { validateName, validateEmail } from "../utils/validation";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const MobileSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fadeInUp } = useAnimations();
    const y = useMotionValue(0);
    const abortRef = React.useRef(null);
    const mountedRef = React.useRef(true);

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

        // Name validation
        const nameError = validateName(form.name);
        if (nameError) newErrors.name = nameError;

        // Email validation (optional)
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
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok || data?.success === false) {
                    throw new Error(data.message || "Profile completion failed");
                }

                // Store token and user
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                toast.success("Account created successfully!");

                // Redirect to dashboard
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
                    Complete Your Profile
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    One final step to get started
                </p>
            </div>

            {/* Body */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
                {/* Phone Verified Badge */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-800 font-medium">
                            Phone verified: {phoneNumber}
                        </span>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label
                            className="text-sm font-medium"
                            style={{ color: colors.text.primary }}
                        >
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="John Doe"
                            className="mt-2 w-full rounded-xl px-4 py-3 border-2 outline-none focus:ring-2 transition"
                            style={{
                                borderColor: errors.name
                                    ? colors.error.DEFAULT
                                    : colors.border.DEFAULT,
                                "--tw-ring-color": colors.primary.DEFAULT,
                            }}
                            disabled={loading}
                        />
                        {errors.name && (
                            <p
                                className="text-xs mt-1"
                                style={{ color: colors.error.DEFAULT }}
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            className="text-sm font-medium"
                            style={{ color: colors.text.primary }}
                        >
                            Email (Optional)
                        </label>
                        <div className="relative mt-2">
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="john@example.com"
                                className="w-full rounded-xl px-4 py-3 pr-10 border-2 outline-none focus:ring-2 transition"
                                style={{
                                    borderColor: errors.email
                                        ? colors.error.DEFAULT
                                        : colors.border.DEFAULT,
                                    "--tw-ring-color": colors.primary.DEFAULT,
                                }}
                                disabled={loading}
                            />
                            <Mail
                                className="absolute right-3 top-3.5"
                                style={{ color: colors.text.tertiary }}
                                size={18}
                            />
                        </div>
                        {errors.email && (
                            <p
                                className="text-xs mt-1"
                                style={{ color: colors.error.DEFAULT }}
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label
                            className="text-sm font-medium"
                            style={{ color: colors.text.primary }}
                        >
                            Location (Optional)
                        </label>
                        <div className="relative mt-2">
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                                placeholder="City, Country"
                                className="w-full rounded-xl px-4 py-3 pr-10 border-2 outline-none focus:ring-2 transition"
                                style={{
                                    borderColor: colors.border.DEFAULT,
                                    "--tw-ring-color": colors.primary.DEFAULT,
                                }}
                                disabled={loading}
                            />
                            <MapPin
                                className="absolute right-3 top-3.5"
                                style={{ color: colors.text.tertiary }}
                                size={18}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 py-3.5 rounded-2xl font-semibold transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                            background: colors.primary.gradient,
                            color: colors.text.inverse,
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="h-24" />
            </div>
        </motion.div>
    );
};

export default MobileSignup;
