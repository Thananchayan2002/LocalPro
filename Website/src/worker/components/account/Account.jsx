import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Briefcase,
  Navigation,
  Star,
  Trophy,
  Layers,
  UserCog,
} from "lucide-react";
import AppLoader from "../common/AppLoader";
import { motion } from "framer-motion";
import { authFetch } from "../../../utils/authFetch";
import { colors } from "../../../styles/colors";

export const Account = () => {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [professionalData, setProfessionalData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [loading, setLoading] = useState(false);

  // Fetch professional details by professionalId
  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!user?.professionalId && !user?.phone) {
        setLoadingProfile(false);
        return;
      }

      // Try by professionalId first
      if (user?.professionalId) {
        try {
          const res = await authFetch(
            `${apiUrl}/api/professionals/${user.professionalId}`,
          );
          const data = await res.json();

          if (data.success) {
            setProfessionalData(data.data);
            setLoadingProfile(false);
            return;
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Failed to fetch professional by id:", error);
        }
      }

      // Fallback: lookup by phone using search filter
      try {
        const res = await authFetch(
          `${apiUrl}/api/professionals?search=${encodeURIComponent(user.phone)}`,
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProfessionalData(data.data[0]);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch professional by phone:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfessionalData();
  }, [user?.professionalId, user?.phone, apiUrl]);

  const safeStatus = professionalData?.status || user?.status || "N/A";

  const fadeUp = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 380, damping: 30 },
    },
  };

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <Toaster position="top-right" />

      {/* Page padding (mobile-first) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-8 pb-10 sm:pb-6">
        {/* HEADER: full width */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="mt-10 relative overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 motion-safe:transition-all motion-safe:duration-300"
          style={{ background: colors.background.primary }}
        >
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-28 h-64 w-64 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10" />
          </div>

          <div className="relative flex items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3 sm:gap-4">
              <motion.div
                className="p-3 rounded-2xl shadow-lg cursor-pointer"
                style={{ background: colors.primary.gradient }}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 32 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserCog size={22} style={{ color: colors.neutral[50] }} />
              </motion.div>

              <div className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                  style={{ color: colors.primary.dark }}
                >
                  Profile
                </h1>
                <p
                  className="mt-1 text-xs sm:text-sm leading-relaxed"
                  style={{ color: colors.text?.secondary }}
                >
                  View and update your personal and service details
                </p>
              </div>
            </div>

            <span
              className="select-none px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm border cursor-default"
              style={{
                background:
                  safeStatus === "accepted"
                    ? colors.success.bg
                    : safeStatus === "pending"
                      ? colors.warning.bg
                      : colors.error.bg,
                color:
                  safeStatus === "accepted"
                    ? colors.success.DEFAULT
                    : safeStatus === "pending"
                      ? colors.warning.DEFAULT
                      : colors.error.DEFAULT,
                borderColor:
                  safeStatus === "accepted"
                    ? colors.success.bg
                    : safeStatus === "pending"
                      ? colors.warning.bg
                      : colors.error.bg,
              }}
            >
              {safeStatus === "accepted"
                ? "Verified"
                : safeStatus === "pending"
                  ? "Pending Approval"
                  : "Not Verified"}
            </span>
          </div>
        </motion.div>

        {/* CONTENT: keep centered max width */}
        <div className="max-w-2xl mx-auto mt-6 sm:mt-7">
          {/* Loading (single block only) */}
          {loadingProfile ? (
            <div className="w-full flex justify-center items-center py-24">
              <div className="max-w-md w-full">
                <AppLoader
                  title="Loading your profile..."
                  subtitle="Getting your details ready"
                />
              </div>
            </div>
          ) : null}

          {!loadingProfile && professionalData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Name */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <User
                    className="w-5 h-5"
                    style={{ color: colors.primary.DEFAULT }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Name
                  </p>
                  <p
                    className="font-semibold truncate"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.name || user?.name || "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <Mail
                    className="w-5 h-5"
                    style={{ color: colors.secondary.DEFAULT }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Email
                  </p>
                  <p
                    className="font-semibold break-all"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.email || user?.email || "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <Phone
                    className="w-5 h-5"
                    style={{ color: colors.primary.dark }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Phone
                  </p>
                  <p
                    className="font-semibold truncate"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.phone || user?.phone || "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* District */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <MapPin
                    className="w-5 h-5"
                    style={{ color: colors.error.DEFAULT }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    District
                  </p>
                  <p
                    className="font-semibold truncate"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.district || "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* Service */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <Briefcase
                    className="w-5 h-5"
                    style={{ color: colors.warning.DEFAULT }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Service
                  </p>
                  <p
                    className="font-semibold break-all"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.serviceId?.service || "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* Rating */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <Star
                    className="w-5 h-5"
                    style={{ color: colors.warning.DEFAULT }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Rating
                  </p>
                  <p
                    className="font-semibold truncate"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.rating ?? "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* Total Jobs Completed */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <Trophy
                    className="w-5 h-5"
                    style={{ color: colors.success.DEFAULT }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Total Jobs Completed
                  </p>
                  <p
                    className="font-semibold truncate"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.totalJobs ?? "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* Registration Method */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex items-start gap-3 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div
                  className="p-2 rounded-xl shadow-sm group-hover:shadow transition-all duration-300 cursor-pointer"
                  style={{ background: colors.background?.secondary }}
                >
                  <Layers
                    className="w-5 h-5"
                    style={{ color: colors.secondary.DEFAULT }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Registration Method
                  </p>
                  <p
                    className="font-semibold capitalize truncate"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.way || "N/A"}
                  </p>
                </div>
              </motion.div>

              {/* Username & Secure login */}
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between w-full min-w-0 gap-2 p-4 border rounded-2xl transition-all duration-300 hover:shadow-md sm:col-span-2"
                style={{
                  background: colors.background?.alt,
                  borderColor: colors.border?.DEFAULT,
                }}
              >
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: colors.text?.secondary }}
                  >
                    Username
                  </p>
                  <p
                    className="font-semibold break-all"
                    style={{ color: colors.text?.primary }}
                  >
                    {professionalData?.username || user?.phone || "N/A"}
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-3 sm:mt-0 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border shadow-sm cursor-pointer select-none"
                  style={{
                    background: colors.background?.secondary,
                    borderColor: colors.border?.DEFAULT,
                    color: colors.text?.secondary,
                  }}
                  title="Secure login enabled"
                >
                  <span
                    className="inline-flex h-2 w-2 rounded-full"
                    style={{ background: colors.success.DEFAULT }}
                  />
                  Secure login enabled
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Bottom spacer for mobile app feel */}
          <div className="h-6 sm:h-8" />
        </div>
      </div>
    </motion.div>
  );
};
