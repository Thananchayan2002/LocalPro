import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, Wrench, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AppLoader from "../common/AppLoader";
import { colors } from "../../../styles/colors";
import { authFetch } from "../../../utils/authFetch";
import { motion } from "framer-motion";

const Services = () => {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [professionalData, setProfessionalData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch professional to derive serviceId when missing
  useEffect(() => {
    const fetchProfessional = async () => {
      if (user?.serviceId || (!user?.professionalId && !user?.phone)) return;

      setLoadingProfile(true);
      try {
        if (user?.professionalId) {
          const res = await authFetch(
            `${apiUrl}/api/professionals/${user.professionalId}`,
          );
          const data = await res.json();
          if (data.success) {
            setProfessionalData(data.data);
            setLoadingProfile(false);
            return;
          }
        }

        const res = await authFetch(
          `${apiUrl}/api/professionals?search=${encodeURIComponent(user.phone)}`,
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProfessionalData(data.data[0]);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch professional for service view:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfessional();
  }, [apiUrl, user?.phone, user?.professionalId, user?.serviceId]);

  const effectiveServiceId = useMemo(() => {
    return (
      user?.serviceId ||
      professionalData?.serviceId?._id ||
      professionalData?.serviceId
    );
  }, [user?.serviceId, professionalData?.serviceId]);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!effectiveServiceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await authFetch(
          `${apiUrl}/api/issues?serviceId=${effectiveServiceId}`,
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load issues");
        }
        setIssues(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [apiUrl, effectiveServiceId]);

  const serviceTitle =
    user?.serviceName || professionalData?.serviceId?.service || "Not Assigned";

  const fadeUp = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 380, damping: 30 },
    },
  };

  // ✅ Cleanest placement for full-screen loader
  if (loading) {
    return (
      <AppLoader
        title="Loading available services..."
        subtitle="Fetching your service list and details"
      />
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="mt-8 rounded-2xl shadow-[0_20px_40px_rgba(2,6,23,0.08)] ring-1 ring-black/5 p-5 sm:p-6 relative overflow-hidden motion-safe:transition-all motion-safe:duration-300 backdrop-blur-sm"
          style={{ 
            background: `linear-gradient(135deg, ${colors.background.primary}cc, ${colors.background.primary}99)`
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/10 to-green-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-green-500/10 to-blue-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />
          </div>

          <div className="h-4 md:h-0">
          </div>

          <div className="relative flex flex-col gap-3">
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-3 rounded-2xl shadow-lg"
                  style={{ background: colors.primary.gradient }}
                >
                  <Briefcase size={22} className="text-white" />
                </div>

                <div className="min-w-0">
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight truncate"
                    style={{ color: colors.primary.dark }}
                    title={serviceTitle}
                  >
                    {serviceTitle}
                  </h1>

                  <p
                    className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider"
                    style={{ color: colors.primary.DEFAULT }}
                  >
                    Service Pricing
                  </p>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: colors.text.secondary }}
                  >
                    Base rates shown below. Adjustable based on job complexity.
                  </p>
                </div>
              </div>

              {loadingProfile ? (
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-white/10 backdrop-blur-md ring-1 ring-white/20"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ background: colors.primary.DEFAULT }}
                  />
                  Loading profile...
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 ring-1 backdrop-blur-sm"
                  style={{ borderColor: colors.success.light, color: colors.success.DEFAULT }}
                >
                  💰 Base Pricing
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {error ? (
          <div
            className="flex items-start gap-3 rounded-2xl p-4 sm:p-5 shadow-sm"
            style={{
              color: colors.error.DEFAULT,
              background: colors.error.bg,
              border: `1px solid ${colors.error.light}`,
            }}
          >
            <div className="mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold">Something went wrong</p>
              <p className="text-sm mt-1 break-words">{error}</p>
            </div>
          </div>
        ) : !user?.serviceId && !professionalData?.serviceId ? (
          <div className="text-center py-12">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-black/5 ring-1 ring-black/5 flex items-center justify-center shadow-sm">
              <Wrench
                className="w-7 h-7"
                style={{ color: colors.text.secondary }}
              />
            </div>
            <p
              className="mt-4 text-sm"
              style={{ color: colors.text.secondary }}
            >
              You currently have no assigned services. New tasks will appear
              here once assigned
            </p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-black/5 ring-1 ring-black/5 flex items-center justify-center shadow-sm">
              <AlertTriangle
                className="w-7 h-7"
                style={{ color: colors.text.secondary }}
              />
            </div>
            <p
              className="mt-4 text-sm"
              style={{ color: colors.text.secondary }}
            >
              No issues found for this service.
            </p>
          </div>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {issues.map((issue, index) => (
              <motion.div
                key={issue._id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: index * 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group rounded-2xl p-4 sm:p-5 ring-1 ring-black/5 shadow-sm motion-safe:transition-all motion-safe:duration-300 hover:shadow-[0_20px_50px_rgba(2,6,23,0.12)] cursor-pointer relative overflow-hidden"
                style={{
                  background: colors.background.alt,
                  borderColor: colors.success.light,
                  borderOpacity: 0.5
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                </div>

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-[10px] uppercase tracking-widest font-semibold"
                      style={{ color: colors.primary.DEFAULT }}
                    >
                      Issue
                    </p>
                    <h3
                      className="mt-2 text-base sm:text-lg font-bold tracking-tight truncate group-hover:text-emerald-600 transition-colors"
                      style={{ color: colors.primary.dark }}
                      title={issue.issueName}
                    >
                      {issue.issueName}
                    </h3>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-bold shadow-sm ring-1 motion-safe:transition-all motion-safe:duration-200"
                    style={{
                      background: colors.success.bg,
                      color: colors.success.DEFAULT,
                      borderColor: colors.success.light,
                    }}
                  >
                    <span>💸</span>
                    <span>LKR {issue.basicCost ?? "—"}</span>
                  </motion.div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div
                    className="h-1.5 flex-1 rounded-full bg-black/8 overflow-hidden"
                    aria-hidden="true"
                  >
                    <motion.div
                      className="h-full rounded-full motion-safe:animate-pulse"
                      style={{
                        background: colors.success.DEFAULT,
                      }}
                      initial={{ width: "66%" }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold ml-3 whitespace-nowrap"
                    style={{ color: colors.text.secondary }}
                  >
                    Base rate
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="h-6 sm:hidden" />
      </div>
    </div>
  );
};

export default Services;
