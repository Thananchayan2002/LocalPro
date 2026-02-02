import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  User,
  Phone,
  Loader,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

import AppLoader from "../common/AppLoader";
import { colors } from "../../../styles/colors";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "../../../utils/authFetch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/* ----------------------------- helpers ----------------------------- */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// PushManager expects a Uint8Array key (not plain string)
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
};

const shouldShowBooking = (booking, professionalLat, professionalLng) => {
  const createdAt = new Date(booking.createdAt);
  const now = new Date();
  const timeDiffMinutes = (now - createdAt) / (1000 * 60);

  // Older than 30 min -> show to all in district
  if (timeDiffMinutes > 30) return true;

  // No coords -> fall back to district
  if (
    !professionalLat ||
    !professionalLng ||
    !booking.location?.lat ||
    !booking.location?.lng
  ) {
    return true;
  }

  const distance = calculateDistance(
    professionalLat,
    professionalLng,
    booking.location.lat,
    booking.location.lng,
  );

  return distance <= 10;
};

/* ----------------------------- component ----------------------------- */
export const Notifications = () => {
  const { user: contextUser } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userWithService, setUserWithService] = useState(null);

  const [message, setMessage] = useState({ type: "", text: "" });

  const [acceptingBookingId, setAcceptingBookingId] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  /* ----------------------------- animations ----------------------------- */
  const fadeUp = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 380, damping: 30 },
    },
  };

  const cardAnim = {
    hidden: { opacity: 0, y: 12, scale: 0.99 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 420, damping: 34 },
    },
    hover: {
      y: -2,
      transition: { type: "spring", stiffness: 500, damping: 28 },
    },
    tap: { scale: 0.985 },
  };

  const modalBackdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.16 } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  };

  const modalPanel = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 420, damping: 34 },
    },
    exit: { opacity: 0, y: 16, scale: 0.985, transition: { duration: 0.12 } },
  };

  const toastAnim = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 520, damping: 34 },
    },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } },
  };

  /* ----------------------------- derived ----------------------------- */
  const userInfo = useMemo(() => {
    if (!userWithService) return "";
    return `Service: ${userWithService.service || "N/A"}, District: ${
      userWithService.district || "N/A"
    }${userWithService.location ? `, Location: ${userWithService.location}` : ""}`;
  }, [userWithService]);

  const getDeadlineTime = (scheduledTime, duration) => {
    const scheduled = new Date(scheduledTime);
    const deadline = new Date(
      scheduled.getTime() + (duration || 2) * 60 * 60 * 1000,
    );
    return deadline.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ----------------------------- load professional ----------------------------- */
  useEffect(() => {
    if (!contextUser) return;

    const fetchProfessionalData = async () => {
      try {
        if (!contextUser?.professionalId && !contextUser?.phone) {
          setUserWithService(contextUser);
          return;
        }

        let professionalData = null;

        if (contextUser?.professionalId) {
          try {
            const res = await authFetch(
              `${API_BASE_URL}/api/professionals/${contextUser.professionalId}`,
            );
            const data = await res.json();
            if (data.success) professionalData = data.data;
          } catch (e) {
            console.error("Failed to fetch professional by id:", e);
          }
        }

        if (!professionalData && contextUser?.phone) {
          try {
            const res = await authFetch(
              `${API_BASE_URL}/api/professionals?search=${encodeURIComponent(
                contextUser.phone,
              )}`,
            );
            const data = await res.json();
            if (
              data.success &&
              Array.isArray(data.data) &&
              data.data.length > 0
            ) {
              professionalData = data.data[0];
            }
          } catch (e) {
            console.error("Failed to fetch professional by phone:", e);
          }
        }

        if (professionalData) {
          const serviceName =
            professionalData.serviceId?.service || professionalData.service;

          setUserWithService({
            ...contextUser,
            service: serviceName,
            district: professionalData.district,
            location: professionalData.location,
            lat: professionalData.lat,
            lng: professionalData.lng,
          });
        } else {
          setUserWithService(contextUser);
        }
      } catch (err) {
        console.error("Error loading professional data:", err);
        setMessage({ type: "error", text: "Failed to load professional data" });
        setUserWithService(contextUser);
      }
    };

    fetchProfessionalData();
  }, [contextUser]);

  /* ----------------------------- bookings fetch ----------------------------- */
  const fetchBookings = useCallback(async () => {
    if (!userWithService?.service || !userWithService?.district) return;

    try {
      setLoading(true);

      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/all?status=requested`,
      );
      const data = await response.json();

      if (!data.success) {
        setMessage({
          type: "error",
          text: data.message || "Failed to load bookings",
        });
        return;
      }

      const allBookings = Array.isArray(data.bookings)
        ? data.bookings
        : Array.isArray(data.data)
          ? data.data
          : [];

      const filtered = allBookings.filter((booking) => {
        const basicMatch =
          booking.status === "requested" &&
          booking.service === userWithService.service &&
          booking.location?.district === userWithService.district;

        if (!basicMatch) return false;

        return shouldShowBooking(
          booking,
          userWithService.lat,
          userWithService.lng,
        );
      });

      setBookings(filtered);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setMessage({
        type: "error",
        text: "Failed to load bookings. Make sure backend is running.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    userWithService?.service,
    userWithService?.district,
    userWithService?.lat,
    userWithService?.lng,
  ]);

  useEffect(() => {
    if (!userWithService?.service || !userWithService?.district) return;
    fetchBookings();
  }, [fetchBookings, userWithService?.service, userWithService?.district]);

  /* ----------------------------- periodic refresh ----------------------------- */
  useEffect(() => {
    if (!userWithService?.service || !userWithService?.district) return;

    const interval = setInterval(() => {
      fetchBookings();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchBookings, userWithService?.service, userWithService?.district]);

  /* ----------------------------- websocket ----------------------------- */
  useEffect(() => {
    if (!userWithService?.service || !userWithService?.district) return;

    const socket = io(API_BASE_URL);

    socket.on("connect", () => console.log("WebSocket connected:", socket.id));

    socket.on("newBooking", (payload) => {
      const booking = payload?.booking;
      if (!booking) return;

      const basicMatch =
        booking.status === "requested" &&
        booking.service === userWithService.service &&
        booking.location?.district === userWithService.district;

      if (
        basicMatch &&
        shouldShowBooking(booking, userWithService.lat, userWithService.lng)
      ) {
        setBookings((prev) => {
          if (prev.some((b) => b._id === booking._id)) return prev;
          return [booking, ...prev];
        });

        setMessage({
          type: "success",
          text: `New job available: ${booking.issueType}`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    });

    socket.on("bookingStatusUpdate", (data) => {
      if (data?.status !== "assigned") return;

      setBookings((prev) => {
        const next = prev.filter((b) => b._id !== data.bookingId);
        if (next.length < prev.length) {
          setMessage({
            type: "info",
            text: "A job was just accepted by another professional",
          });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
        return next;
      });
    });

    socket.on("disconnect", () => console.log("WebSocket disconnected"));

    return () => socket.disconnect();
  }, [
    userWithService?.service,
    userWithService?.district,
    userWithService?.lat,
    userWithService?.lng,
  ]);

  /* ----------------------------- push notifications ----------------------------- */
  useEffect(() => {
    const setupPush = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        await navigator.serviceWorker.register("/sw.js");

        const permission = await Notification.requestPermission();
        if (permission === "granted") setNotificationsEnabled(true);
      } catch (err) {
        console.error("Service Worker / Permission failed:", err);
      }
    };

    setupPush();
  }, []);

  useEffect(() => {
    if (
      !userWithService?.service ||
      !userWithService?.district ||
      !notificationsEnabled
    )
      return;

    const subscribeToPush = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // If already subscribed, reuse it
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          return; // already subscribed; backend sync optional
        }

        const keyResponse = await fetch(
          `${API_BASE_URL}/api/push/vapid-public-key`,
        );
        const keyData = await keyResponse.json();

        if (!keyData?.success || !keyData?.publicKey) return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        });

        await authFetch(`${API_BASE_URL}/api/push/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            service: userWithService.service,
            district: userWithService.district,
          }),
        });

        setMessage({ type: "success", text: "🔔 Push notifications enabled!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch (err) {
        console.error("Push subscription failed:", err);
      }
    };

    subscribeToPush();
  }, [
    userWithService?.service,
    userWithService?.district,
    notificationsEnabled,
  ]);

  /* ----------------------------- customer details ----------------------------- */
  const fetchCustomerDetails = async (customerId) => {
    setLoadingCustomer(true);
    try {
      const response = await authFetch(
        `${API_BASE_URL}/api/auth/user/${customerId}`,
      );
      const data = await response.json();
      if (data.success) setCustomerDetails(data.data);
    } catch (err) {
      console.error("Error fetching customer details:", err);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleOpenConfirmModal = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);

    if (booking.customerId && typeof booking.customerId === "object") {
      setCustomerDetails(booking.customerId);
      setLoadingCustomer(false);
      return;
    }

    if (booking.customerId) fetchCustomerDetails(booking.customerId);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedBooking(null);
    setCustomerDetails(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessBooking(null);
  };

  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;

    try {
      setAcceptingBookingId(selectedBooking._id);

      const userIdToAssign = contextUser?.id || contextUser?._id;

      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/update-status/${selectedBooking._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "assigned",
            professionalId: userIdToAssign,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        setMessage({
          type: "error",
          text: data.message || "Failed to accept booking",
        });
        return;
      }

      const bookingWithCustomer = {
        ...selectedBooking,
        customerInfo: customerDetails,
      };

      setSuccessBooking(bookingWithCustomer);
      setShowSuccessModal(true);

      setBookings((prev) => prev.filter((b) => b._id !== selectedBooking._id));
      handleCloseConfirmModal();
    } catch (err) {
      console.error("Error accepting booking:", err);
      setMessage({ type: "error", text: "Failed to accept booking" });
    } finally {
      setAcceptingBookingId(null);
    }
  };

  /* ----------------------------- UI ----------------------------- */
  // Only show loader if userWithService is not ready or loading is true, but not both
  if (!userWithService || loading) {
    return (
      <div className="w-full flex justify-center items-center py-24">
        <div className="max-w-md w-full">
          <AppLoader
            title="Loading your notifications..."
            subtitle="Fetching your available jobs and alerts"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-10 space-y-6">
        {/* Header */}
        <div
          className="mt-18 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 relative overflow-hidden"
          style={{ background: colors.background.primary }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-28 h-64 w-64 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10" />
          </div>

          <div className="relative flex items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <motion.div
                className="p-3 rounded-2xl shadow-lg"
                style={{ background: colors.primary.gradient }}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 480, damping: 30 }}
              >
                <Bell size={22} style={{ color: colors.neutral[50] }} />
              </motion.div>

              <div className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                  style={{ color: colors.primary.dark }}
                >
                  Notifications
                </h1>
                <p
                  className="mt-1 text-xs sm:text-sm leading-relaxed line-clamp-2"
                  style={{ color: colors.neutral[500] }}
                >
                  {userInfo} •{" "}
                  <span className="font-semibold">
                    {bookings.length} job{bookings.length !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>
            </div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 bg-white/60 backdrop-blur">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Live
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Message Toast */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              key={message.text}
              variants={toastAnim}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-xl border px-4 py-3 shadow-sm"
              style={{
                background:
                  message.type === "success"
                    ? colors.success.bg
                    : message.type === "info"
                      ? colors.neutral[50]
                      : colors.error.bg,
                borderColor:
                  message.type === "success"
                    ? colors.success.light
                    : message.type === "info"
                      ? colors.neutral[200]
                      : colors.error.light,
                color:
                  message.type === "success"
                    ? colors.success.DEFAULT
                    : message.type === "info"
                      ? colors.neutral[700]
                      : colors.error.DEFAULT,
              }}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : message.type === "info" ? (
                    <Bell className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="text-sm font-medium leading-snug">
                  {message.text}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {bookings.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div
              className="rounded-2xl shadow-md p-8 border bg-white/70 backdrop-blur"
              style={{ borderColor: colors.neutral[100] }}
            >
              <div className="text-center py-4 sm:py-6">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-sm"
                  style={{ background: colors.primary.light }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                  <Bell size={30} style={{ color: colors.primary.DEFAULT }} />
                </motion.div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.primary.dark }}
                >
                  No Available Jobs
                </h3>
                <p className="text-sm" style={{ color: colors.neutral[500] }}>
                  No pending bookings matching your service and district.
                </p>
                <p className="text-xs mt-2 text-gray-400">
                  Keep this page open for real-time alerts
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {bookings.map((booking) => {
                let distance = null;
                if (
                  userWithService.lat &&
                  userWithService.lng &&
                  booking.location?.lat &&
                  booking.location?.lng
                ) {
                  distance = calculateDistance(
                    userWithService.lat,
                    userWithService.lng,
                    booking.location.lat,
                    booking.location.lng,
                  );
                }
                return (
                  <motion.div
                    key={booking._id}
                    variants={cardAnim}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    className="rounded-2xl overflow-hidden border border-black/5 bg-white/80 backdrop-blur shadow-[0_10px_26px_rgba(2,6,23,0.06)]"
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5 border-b border-black/5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {booking.issueType}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {booking.location?.address}
                          </p>
                        </div>
                        {distance && (
                          <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-semibold whitespace-nowrap">
                            {distance < 1 ? "1 km" : `${distance.toFixed(1)} km`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Issue Description */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {booking.description}
                        </p>
                      </div>

                      {/* Scheduled Time */}
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Scheduled
                          </p>
                          <p className="text-sm text-gray-700 font-medium">
                            {new Date(booking.scheduledTime).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Location with District */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Location
                          </p>
                          <p className="text-sm text-gray-700 font-medium">
                            {booking.location?.district}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer - Accept Button */}
                    <div className="p-4 sm:p-5 border-t border-black/5 bg-gray-50/50">
                      <button
                        onClick={() => handleOpenConfirmModal(booking)}
                        disabled={acceptingBookingId === booking._id}
                        className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                          background: colors.primary.gradient,
                          color: colors.neutral[50],
                        }}
                      >
                        {acceptingBookingId === booking._id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          "View & Accept"
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedBooking && (
            <motion.div
              className="fixed inset-0 z-50"
              variants={modalBackdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

              <div className="relative h-full w-full flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div
                  variants={modalPanel}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                  style={{
                    maxHeight: "92vh",
                    borderTopLeftRadius: "1.25rem",
                    borderTopRightRadius: "1.25rem",
                  }}
                >
                  {/* Modal Header */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base sm:text-xl font-bold">
                        Confirm Job Acceptance
                      </h2>
                      <button
                        type="button"
                        onClick={handleCloseConfirmModal}
                        className="cursor-pointer p-2 hover:bg-white/20 rounded-xl transition active:scale-[0.98]"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 mt-1">
                      Review details before accepting
                    </p>
                  </div>

                  {/* Modal Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Customer Name */}
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-purple-600" />
                        <p className="text-[11px] text-purple-700 font-semibold uppercase tracking-wide">
                          Customer Name
                        </p>
                      </div>

                      {loadingCustomer ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-gray-900">
                          {customerDetails?.name || "N/A"}
                        </p>
                      )}
                    </div>

                    {/* Issue */}
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                      <p className="text-[11px] text-blue-700 font-semibold uppercase tracking-wide mb-1">
                        Issue Type
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedBooking.issueType}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-wide mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedBooking.description}
                      </p>
                    </div>

                    {/* Scheduled Time */}
                    <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <p className="text-[11px] text-orange-700 font-semibold uppercase tracking-wide">
                          Scheduled Time
                        </p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedBooking.scheduledTime).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                      {selectedBooking.duration && (
                        <p className="text-xs text-orange-700 mt-1">
                          Duration:{" "}
                          <span className="font-semibold">
                            {selectedBooking.duration}
                          </span>{" "}
                          hours
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <p className="text-[11px] text-green-700 font-semibold uppercase tracking-wide">
                          Location
                        </p>

                        {userWithService?.lat &&
                          userWithService?.lng &&
                          selectedBooking.location?.lat &&
                          selectedBooking.location?.lng && (
                            <span className="ml-auto text-[11px] font-bold text-green-700 bg-green-200 px-2 py-1 rounded-lg">
                              {calculateDistance(
                                userWithService.lat,
                                userWithService.lng,
                                selectedBooking.location.lat,
                                selectedBooking.location.lng,
                              ).toFixed(1)}{" "}
                              km away
                            </span>
                          )}
                      </div>

                      <p className="text-sm text-gray-900 leading-snug">
                        {selectedBooking.location?.address}
                      </p>
                      {selectedBooking.location?.district && (
                        <p className="text-xs text-green-700 mt-1">
                          District:{" "}
                          <span className="font-semibold">
                            {selectedBooking.location.district}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Warning Message */}
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-semibold text-amber-900 mb-1 uppercase tracking-wide">
                            Important Notice
                          </p>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            You must arrive within{" "}
                            <span className="font-semibold">
                              {getDeadlineTime(
                                selectedBooking.scheduledTime,
                                selectedBooking.duration,
                              )}
                            </span>
                            . Confirm only if you can reach within this
                            timeframe.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer - Sticky */}
                  <div className="flex-shrink-0 bg-white border-t p-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseConfirmModal}
                      className="flex-1 cursor-pointer px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition active:scale-[0.99]"
                    >
                      Cancel
                    </button>

                    <motion.button
                      type="button"
                      onClick={handleAcceptBooking}
                      disabled={acceptingBookingId === selectedBooking._id}
                      whileTap={{ scale: 0.99 }}
                      className="flex-1 cursor-pointer px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {acceptingBookingId === selectedBooking._id ? (
                        <>
                          <span
                            className="w-4 h-4 rounded-full border-2 border-white/90 border-t-transparent animate-spin"
                            aria-hidden="true"
                          />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm & Accept
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* iOS safe-area for bottom sheet feel */}
                  <div className="h-[calc(env(safe-area-inset-bottom)+6px)] bg-white" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && successBooking?.customerInfo && (
            <motion.div
              className="fixed inset-0 z-50"
              variants={modalBackdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

              <div className="relative h-full w-full flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div
                  variants={modalPanel}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                  style={{
                    maxHeight: "92vh",
                    borderTopLeftRadius: "1.25rem",
                    borderTopRightRadius: "1.25rem",
                  }}
                >
                  {/* Success Header */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl font-bold mb-1">
                          Booking Accepted!
                        </h2>
                        <p className="text-sm text-green-100">
                          You've successfully accepted this job
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Success Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Issue Type */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                        Issue Type
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        {successBooking.issueType}
                      </p>
                    </div>

                    {/* Customer Name */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-purple-600 font-semibold uppercase">
                          Customer
                        </p>
                      </div>
                      <p className="text-base font-bold text-gray-900">
                        {successBooking.customerInfo.name}
                      </p>
                    </div>

                    {/* Customer Phone */}
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-600 font-semibold uppercase">
                          Phone Number
                        </p>
                      </div>
                      <p className="text-base font-bold text-gray-900">
                        {successBooking.customerInfo.phone}
                      </p>
                    </div>

                    {/* Scheduled Time */}
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-600 font-semibold uppercase">
                          Scheduled Time
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(successBooking.scheduledTime).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">
                          ✓ Successfully accepted!
                        </span>{" "}
                        You will receive updates on this job. Head to the
                        location on time.
                      </p>
                    </div>
                  </div>

                  {/* Success Footer */}
                  <div className="flex-shrink-0 bg-gray-50 px-4 py-3 border-t">
                    <button
                      type="button"
                      onClick={handleCloseSuccessModal}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Done
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
