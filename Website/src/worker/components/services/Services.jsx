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
        <div
          className="mt-18 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 relative overflow-hidden motion-safe:transition-all motion-safe:duration-300"
          style={{ background: colors.background.primary }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/5 blur-3xl" />
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
                    className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                    style={{ color: colors.primary.dark }}
                    title={serviceTitle}
                  >
                    {serviceTitle}
                  </h1>

                  <p
                    className="mt-1 text-sm font-bold"
                    style={{ color: colors.text.secondary }}
                  >
                    Base rates and notes are shown below
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    These amounts are starting estimates and can be adjusted or
                    negotiated based on the situation
                  </p>
                </div>
              </div>

              {loadingProfile ? (
                <div
                  className="shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-white/60 backdrop-blur ring-1 ring-black/5"
                  style={{ color: colors.text.secondary }}
                >
                  <span
                    className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{
                      borderColor: colors.primary.DEFAULT,
                      borderTopColor: "transparent",
                    }}
                  />
                  Loading profile...
                </div>
              ) : (
                <div
                  className="shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-black/5"
                  style={{ color: colors.text.secondary }}
                >
                  Base pricing
                </div>
              )}
            </div>
          </div>
        </div>

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
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="group rounded-2xl p-4 sm:p-5 ring-1 ring-black/5 shadow-sm motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(2,6,23,0.10)] cursor-pointer"
                style={{
                  border: `1px solid ${colors.success.bg}`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-[11px] uppercase tracking-wide"
                      style={{ color: colors.text.tertiary }}
                    >
                      Issue
                    </p>
                    <h3
                      className="mt-1 text-base sm:text-lg font-extrabold truncate"
                      style={{ color: colors.primary.light }}
                      title={issue.issueName}
                    >
                      {issue.issueName}
                    </h3>
                  </div>
                  <div
                    className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-extrabold shadow-sm ring-1 ring-black/5 motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-[1.02]"
                    style={{
                      background: colors.category.emerald.bg,
                      color: colors.category.emerald.text,
                      border: `1px solid ${colors.success.bg}`,
                    }}
                  >
                    LKR {issue.basicCost ?? "—"}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div
                    className="h-1.5 w-20 rounded-full bg-black/10 overflow-hidden"
                    aria-hidden="true"
                  >
                    <div className="h-full w-2/3 rounded-full bg-black/20 motion-safe:animate-pulse" />
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: colors.text.secondary }}
                  >
                    Base amount
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="h-6 sm:hidden" />
      </div>
    </div>
  );
};

export default Services;
