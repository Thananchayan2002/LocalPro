import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, MapPin, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { motion, useMotionValue } from "framer-motion";

import { colors } from "../../../styles/colors";
import { useAnimations } from "../../../animations/animations";
import { validateName, validateEmail } from "../../../utils/validation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fadeInUp, staggerContainer, staggerItem } = useAnimations();

  const phoneNumber = location.state?.phoneNumber;
  const phoneVerified = location.state?.phoneVerified;

  const y = useMotionValue(0);
  const abortRef = React.useRef(null);
  const mountedRef = React.useRef(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phoneVerified) {
      navigate("/login");
    }
  }, [phoneVerified, navigate]);

  // Cleanup on unmount
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validate = () => {
    const e = {};
    const nameError = validateName(form.name);
    if (nameError) e.name = nameError;

    const emailError = validateEmail(form.email);
    if (emailError) e.email = emailError;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Abort any previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API_BASE_URL}/api/auth/complete-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, ...form }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (mountedRef.current) {
        localStorage.setItem("token", data.token);
        toast.success("Account created");
        navigate("/app");
      }
    } catch (error) {
      if (error?.name !== "AbortError" && mountedRef.current) {
        toast.error("Signup failed");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.15}
      style={{ y }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 120) navigate("/login");
      }}
      className="
        fixed inset-0 z-50
        bg-white
        rounded-t-[28px]
        flex flex-col
        shadow-2xl
      "
      transition={{ type: "spring", damping: 28 }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-4">
        <div className="w-10 h-1.5 rounded-full bg-gray-300" />
      </div>

      {/* Header */}
      <div className="px-6 pb-5 border-b border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          You’re almost there
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Just a few details to finish setting up
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Phone verified • {phoneNumber}
        </p>
      </div>

      {/* Form */}
      <motion.form
        variants={staggerContainer}
        onSubmit={handleSubmit}
        className="flex-1 px-6 py-6 space-y-4 overflow-y-auto"
      >
        {/* Name */}
        <motion.div variants={staggerItem}>
          <input
            placeholder="Full name"
            className="w-full px-4 py-3.5 rounded-xl border"
            style={{
              borderColor: errors.name ? colors.error.DEFAULT : "#E5E7EB",
            }}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && (
            <p className="text-xs mt-1" style={{ color: colors.error.DEFAULT }}>
              {errors.name}
            </p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div variants={staggerItem} className="relative">
          <input
            placeholder="Email (optional)"
            className="w-full px-4 py-3.5 rounded-xl border pr-11"
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </motion.div>

        {/* Location */}
        <motion.div variants={staggerItem} className="relative">
          <input
            placeholder="Location (optional)"
            className="w-full px-4 py-3.5 rounded-xl border pr-11"
            onChange={(e) => handleChange("location", e.target.value)}
          />
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </motion.div>

        <div className="h-24" />
      </motion.form>

      {/* CTA */}
      <div className="px-6 pb-6 border-t border-gray-100 bg-white">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: colors.primary.gradient,
            color: colors.text.inverse,
          }}
        >
          {loading ? "Creating..." : "Continue"}
          <ArrowRight />
        </button>
      </div>
    </motion.div>
  );
};

export default Signup;
