import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, MapPin, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { useAnimations } from "../users/components/animations/animations";
import { colors } from "../styles/colors";
import loginBG from "../assets/images/aboutBanner.png";
import MobileSignup from "./MobileSignup";
import { validateName, validateEmail } from "../utils/validation";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fadeInUp, staggerContainer, staggerItem } = useAnimations();
    const abortRef = React.useRef(null);
    const mountedRef = React.useRef(true);

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < 640 : false
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

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

    if (isMobile) {
        return <MobileSignup />;
    }

    /* ============== RENDER ============== */
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(139, 92, 246, 0.1) 100%), url('${loginBG}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Mobile Header */}
            <div className="sm:hidden px-6 pt-10 pb-6">
                <h1
                    className="text-3xl font-extrabold leading-tight"
                    style={{ color: colors.text.primary }}
                >
                    You're almost there
                </h1>
                <p className="mt-2" style={{ color: colors.text.secondary }}>
                    One final step to get started
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    variants={staggerContainer}
                    className="
            w-full max-w-sm
            sm:max-w-2xl
            bg-white
            rounded-3xl
            shadow-xl
            px-6 py-8 sm:px-8 sm:py-10
            lg:px-12
          "
                >
                    {/* Desktop Header */}
                    <motion.div variants={staggerItem} className="hidden sm:block mb-6">
                        <h1
                            className="text-3xl font-bold"
                            style={{ color: colors.text.primary }}
                        >
                            Complete Your Profile
                        </h1>
                        <p className="mt-2" style={{ color: colors.text.secondary }}>
                            One final step to get started
                        </p>
                    </motion.div>

                    {/* Phone Verified Badge */}
                    <motion.div variants={staggerItem} className="mb-6">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                            <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-800 font-medium">
                                Phone verified: {phoneNumber}
                            </span>
                        </div>
                    </motion.div>

                    {/* Profile Form */}
                    <motion.form
                        variants={staggerItem}
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Name and Email Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                    </motion.form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Signup;