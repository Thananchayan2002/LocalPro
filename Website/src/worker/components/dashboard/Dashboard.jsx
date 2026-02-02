import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  ArrowRight,
  User,
  MapPin,
  TrendingUp,
} from "lucide-react";
import AppLoader from "../common/AppLoader";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { authFetch } from "../../../utils/authFetch";
import { colors } from "../../../styles/colors";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingPayments: 0,
    pendingCommission: 0,
    totalEarnings: 0,
    paidAmount: 0,
    averageRating: 0,
    todayBookings: 0,
  });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [userWithService, setUserWithService] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [tomorrowTasks, setTomorrowTasks] = useState([]);

  // Handle first login refresh
  useEffect(() => {
    const needsRefresh = localStorage.getItem("needsFirstLoginRefresh");
    if (needsRefresh === "true" && user) {
      // Clear flag before refreshing
      localStorage.removeItem("needsFirstLoginRefresh");
      // Refresh page
      window.location.reload();
    }
  }, [user]);

  // Fetch professional details
  useEffect(() => {
    if (!user) return;

    const fetchProfessionalData = async () => {
      try {
        if (!user?.professionalId && !user?.phone) {
          setUserWithService(user);
          return;
        }

        let professionalData = null;

        // Try by professionalId first
        if (user?.professionalId) {
          try {
            const res = await authFetch(
              `${API_BASE_URL}/api/professionals/${user.professionalId}`,
            );
            const data = await res.json();

            if (data.success) {
              professionalData = data.data;
            }
          } catch (error) {
            console.error("Failed to fetch professional by id:", error);
          }
        }

        // Fallback: lookup by phone using search filter
        if (!professionalData && user?.phone) {
          try {
            const res = await authFetch(
              `${API_BASE_URL}/api/professionals?search=${encodeURIComponent(
                user.phone,
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
          } catch (error) {
            console.error("Failed to fetch professional by phone:", error);
          }
        }

        // Merge professional data with user data
        if (professionalData) {
          const serviceName =
            professionalData.serviceId?.service || professionalData.service;
          setUserWithService({
            ...user,
            service: serviceName,
            district: professionalData.district,
          });
        } else {
          setUserWithService(user);
        }
      } catch (err) {
        console.error("Error loading professional data:", err);
        setUserWithService(user);
      }
    };

    fetchProfessionalData();
  }, [user?.professionalId, user?.phone, user]);

  useEffect(() => {
    fetchDashboardData();
    fetchAssignedTasks();
  }, []);

  // Fetch pending bookings (requested status matching service and district)
  useEffect(() => {
    if (
      !userWithService ||
      !userWithService.service ||
      !userWithService.district
    )
      return;

    const fetchPendingBookings = async () => {
      try {
        const response = await authFetch(
          `${API_BASE_URL}/api/bookings/all?status=requested`,
        );

        const data = await response.json();

        if (data.success) {
          const allBookings = Array.isArray(data.bookings)
            ? data.bookings
            : Array.isArray(data.data)
              ? data.data
              : [];
          const filtered = allBookings.filter((booking) => {
            return (
              booking.status === "requested" &&
              booking.service === userWithService.service &&
              booking.location?.district === userWithService.district
            );
          });
          // Show up to 5 pending bookings
          setPendingBookings(filtered.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching pending bookings:", err);
      }
    };

    fetchPendingBookings();
  }, [userWithService?.service, userWithService?.district]);

  // WebSocket connection for real-time bookings
  useEffect(() => {
    if (
      !userWithService ||
      !userWithService.service ||
      !userWithService.district
    )
      return;

    const socket = io(API_BASE_URL);

    socket.on("connect", () => {
      console.log("Dashboard WebSocket connected:", socket.id);
    });

    socket.on("newBooking", (data) => {
      console.log("New booking received via WebSocket:", data);

      // Check if this booking matches professional's service and district
      const booking = data.booking;
      if (
        booking.status === "requested" &&
        booking.service === userWithService.service &&
        booking.location?.district === userWithService.district
      ) {
        console.log("Adding new matching booking to dashboard");
        setPendingBookings((prevBookings) => {
          // Check if booking already exists
          const exists = prevBookings.some((b) => b._id === booking._id);
          if (exists) return prevBookings;
          // Add to beginning and limit to 5
          return [booking, ...prevBookings].slice(0, 5);
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Dashboard WebSocket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [userWithService?.service, userWithService?.district]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/professional-bookings`,
      );

      const data = await response.json();

      if (data.success) {
        const bookings = data.bookings || [];

        // Calculate statistics
        const totalBookings = bookings.length;
        const activeBookings = bookings.filter((b) =>
          ["assigned", "inspecting", "approved", "inProgress"].includes(
            b.status,
          ),
        ).length;
        const completedBookings = bookings.filter((b) =>
          ["completed", "paid", "verified"].includes(b.status),
        ).length;
        const pendingPayments = bookings.filter(
          (b) => b.status === "completed",
        ).length;

        // Calculate pending commission (10% of completed but unpaid bookings)
        const pendingCommission =
          bookings
            .filter((b) => b.status === "completed")
            .reduce(
              (sum, b) => sum + (Number(b.payment?.paymentByWorker) || 0),
              0,
            ) * 0.1;

        // Calculate earnings
        const totalEarnings = bookings
          .filter((b) => ["completed", "paid", "verified"].includes(b.status))
          .reduce(
            (sum, b) => sum + (Number(b.payment?.paymentByWorker) || 0),
            0,
          );

        const paidAmount = bookings
          .filter((b) => ["paid", "verified"].includes(b.status))
          .reduce(
            (sum, b) => sum + (Number(b.payment?.paymentByWorker) || 0),
            0,
          );

        // Calculate average rating
        const ratingsArray = bookings
          .filter((b) => b.workerReview?.rating)
          .map((b) => b.workerReview.rating);
        const averageRating =
          ratingsArray.length > 0
            ? (
                ratingsArray.reduce((sum, r) => sum + r, 0) /
                ratingsArray.length
              ).toFixed(1)
            : 0;

        // Today's bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBookings = bookings.filter((b) => {
          const scheduledDate = new Date(b.scheduledTime);
          scheduledDate.setHours(0, 0, 0, 0);
          return scheduledDate.getTime() === today.getTime();
        }).length;

        setStats({
          totalBookings,
          activeBookings,
          completedBookings,
          pendingPayments,
          pendingCommission,
          totalEarnings,
          paidAmount,
          averageRating,
          todayBookings,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/professional-bookings`,
      );

      const data = await response.json();

      if (data.success) {
        const bookings = data.bookings || [];

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get tomorrow's date at midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get the day after tomorrow for upper bound
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Filter assigned tasks for today
        const todayAssigned = bookings.filter((booking) => {
          const scheduledDate = new Date(booking.scheduledTime);
          scheduledDate.setHours(0, 0, 0, 0);
          return (
            scheduledDate.getTime() === today.getTime() &&
            ["assigned", "inspecting", "approved", "inProgress"].includes(
              booking.status,
            )
          );
        });

        // Filter assigned tasks for tomorrow
        const tomorrowAssigned = bookings.filter((booking) => {
          const scheduledDate = new Date(booking.scheduledTime);
          scheduledDate.setHours(0, 0, 0, 0);
          return (
            scheduledDate.getTime() === tomorrow.getTime() &&
            ["assigned", "inspecting", "approved", "inProgress"].includes(
              booking.status,
            )
          );
        });

        setTodayTasks(todayAssigned);
        setTomorrowTasks(tomorrowAssigned);
      }
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      inspecting: "bg-purple-100 text-purple-800",
      approved: "bg-green-100 text-green-800",
      inProgress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      paid: "bg-teal-100 text-teal-800",
      verified: "bg-indigo-100 text-indigo-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <AppLoader
        title="Loading your dashboard..."
        subtitle="Fetching your latest stats and bookings"
      />
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-10 space-y-6">
        {/* Welcome Header */}
        <div
          className="mt-18 rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 overflow-hidden relative
                     motion-safe:transition-all motion-safe:duration-300"
          style={{
            background: colors.background.primary,
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-black/5 blur-3xl" />
          </div>

          <div className="relative flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1
                className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                style={{ color: colors.primary.dark }}
              >
                Welcome back, {user?.name}
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.secondary }}
              >
                Here’s a quick overview of your recent activity and stats.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {/* Total - Blue */}
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                  <Briefcase className="w-3.5 h-3.5" />
                  {stats.totalBookings} total
                </span>

                {/* Pending/Active - Orange */}
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
                  <Clock className="w-3.5 h-3.5" />
                  {stats.activeBookings} active
                </span>

                {/* Completed - Green */}
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {stats.completedBookings} completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Bookings */}
          <div
            className="rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 bg-white
                       motion-safe:transition-all motion-safe:duration-300
                       hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]
                       active:translate-y-0 active:scale-[0.99]"
            style={{ background: colors.background.primary }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Total Bookings
                </p>
                <p
                  className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                  {stats.totalBookings}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-black/5
                           motion-safe:transition-transform motion-safe:duration-300 hover:scale-105"
                style={{ background: colors.primary.light }}
              >
                <Briefcase
                  className="w-6 h-6"
                  style={{ color: colors.primary.DEFAULT }}
                />
              </div>
            </div>
          </div>

          {/* Active Bookings */}
          <div
            className="rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5
                       motion-safe:transition-all motion-safe:duration-300
                       hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]
                       active:translate-y-0 active:scale-[0.99]"
            style={{ background: colors.background.primary }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Active Bookings
                </p>
                <p
                  className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                  {stats.activeBookings}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-black/5
                           motion-safe:transition-transform motion-safe:duration-300 hover:scale-105"
                style={{ backgroundColor: "#FFF7ED" }} // orange-50
              >
                <Clock className="w-6 h-6" style={{ color: "#F97316" }} />{" "}
                {/* orange-500 */}
              </div>
            </div>
          </div>

          {/* Completed Bookings */}
          <div
            className="rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5
                       motion-safe:transition-all motion-safe:duration-300
                       hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]
                       active:translate-y-0 active:scale-[0.99]"
            style={{ background: colors.background.primary }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Completed
                </p>
                <p
                  className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                  {stats.completedBookings}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-black/5
                           motion-safe:transition-transform motion-safe:duration-300 hover:scale-105"
                style={{ background: colors.success.bg }}
              >
                <CheckCircle
                  className="w-6 h-6"
                  style={{ color: colors.success.DEFAULT }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Total Earnings */}
          <div
            className="rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5
                       motion-safe:transition-all motion-safe:duration-300
                       hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]
                       active:translate-y-0 active:scale-[0.99]"
            style={{
              background: colors.background.primary,
              color: colors.neutral[50],
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: colors.secondary.DEFAULT }}
                >
                  Total Earnings
                </p>
                <p
                  className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight"
                  style={{ color: colors.secondary.DEFAULT }}
                >
                  LKR {stats.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-2xl shadow-sm ring-1 ring-black/5 flex items-center justify-center bg-black/5
                           motion-safe:transition-transform motion-safe:duration-300 hover:scale-105"
              >
                <TrendingUp
                  className="w-6 h-6"
                  style={{ color: colors.secondary.DEFAULT }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
              <span
                className="opacity-80"
                style={{ color: colors.secondary.DEFAULT }}
              >
                Paid amount
              </span>
              <span
                className="font-semibold"
                style={{ color: colors.secondary.DEFAULT }}
              >
                LKR {stats.paidAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pending Commission */}
          <div
            className="rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5
                       motion-safe:transition-all motion-safe:duration-300
                       hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]
                       active:translate-y-0 active:scale-[0.99]"
            style={{
              background: colors.background.primary,
              color: colors.neutral[50],
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5">
                  <AlertCircle
                    className="w-8 h-8"
                    style={{ color: "orange" }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs sm:text-sm font-semibold"
                    style={{ color: "orange" }}
                  >
                    Pending Commission (10%)
                  </p>
                  <p
                    className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight"
                    style={{ color: "orange" }}
                  >
                    LKR {stats.pendingCommission.toLocaleString()}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "orange" }}>
                    {stats.pendingPayments} booking
                    {stats.pendingPayments !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div
                className="h-12 w-12 rounded-2xl shadow-sm ring-1 ring-black/5 flex items-center justify-center bg-black/5
                              motion-safe:transition-transform motion-safe:duration-300 hover:scale-105"
              >
                <Briefcase className="w-6 h-6" style={{ color: "orange" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Open Bookings */}
        <div className="rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Open Bookings
            </h3>

            <button
              onClick={() => navigate("/worker/notifications")}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl
                         text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
                         hover:bg-blue-50 dark:hover:bg-blue-900/20
                         motion-safe:transition-all motion-safe:duration-200
                         active:scale-[0.98]"
            >
              View More
              <ArrowRight className="w-4 h-4 motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingBookings.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No open bookings available
                </p>
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="group flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl
                             bg-yellow-50 dark:bg-yellow-900/20
                             ring-1 ring-yellow-200/60 dark:ring-yellow-800/60
                             hover:bg-yellow-100 dark:hover:bg-yellow-900/30
                             motion-safe:transition-all motion-safe:duration-200
                             hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {booking.service} - {booking.issueType}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {booking.customerId?.name} • {booking.location?.district}{" "}
                      • {formatDate(booking.scheduledTime)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      booking.status,
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today’s Work Schedule */}
        <div className="rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Today’s Work Schedule
            </h3>

            <button
              onClick={() => navigate("/worker/bookings")}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl
                         text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
                         hover:bg-blue-50 dark:hover:bg-blue-900/20
                         motion-safe:transition-all motion-safe:duration-200
                         active:scale-[0.98]"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No work scheduled for today
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todayTasks.map((booking) => (
                  <div
                    key={booking._id}
                    className="group p-4 rounded-2xl bg-green-50 dark:bg-green-900/20
                               border border-green-200 dark:border-green-800
                               shadow-sm hover:shadow-md
                               motion-safe:transition-all motion-safe:duration-200
                               hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {booking.service}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {booking.issueType}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/5">
                          <User className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">
                          {booking.customerId?.name || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/5">
                          <Clock className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">
                          {formatDate(booking.scheduledTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/5">
                          <MapPin className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">
                          {booking.location?.city}, {booking.location?.district}
                        </span>
                      </div>

                      {booking.payment?.paymentByWorker && (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Estimated earning
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            LKR {booking.payment.paymentByWorker}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tomorrow's Work Schedule */}
        <div className="rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Tomorrow’s Work Schedule
            </h3>

            <button
              onClick={() => navigate("/worker/bookings")}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl
                         text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
                         hover:bg-blue-50 dark:hover:bg-blue-900/20
                         motion-safe:transition-all motion-safe:duration-200
                         active:scale-[0.98]"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {tomorrowTasks.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No work scheduled for tomorrow
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tomorrowTasks.map((booking) => (
                  <div
                    key={booking._id}
                    className="group p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20
                               border border-blue-200 dark:border-blue-800
                               shadow-sm hover:shadow-md
                               motion-safe:transition-all motion-safe:duration-200
                               hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {booking.service}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {booking.issueType}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/5">
                          <User className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">
                          {booking.customerId?.name || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/5">
                          <Clock className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">
                          {formatDate(booking.scheduledTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/5">
                          <MapPin className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">
                          {booking.location?.city}, {booking.location?.district}
                        </span>
                      </div>

                      {booking.payment?.paymentByWorker && (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Estimated earning
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            ₹{booking.payment.paymentByWorker}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
