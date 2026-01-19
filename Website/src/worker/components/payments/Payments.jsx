import React, { useState, useEffect } from "react";
import { colors } from "../../../styles/colors";
import {
  CreditCard,
  Calendar,
  User,
  Phone,
  CheckCircle,
  Search,
  AlertCircle,
  X,
} from "lucide-react";
import AppLoader from "../common/AppLoader";
import { authFetch } from "../../../utils/authFetch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const statusConfig = {
  completed: {
    label: "Pending Payment",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
  },
  paid: {
    label: "Paid",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  verified: {
    label: "Verified",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
};

export const Payments = () => {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      setLoading(true);

      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/professional-bookings`,
      );

      const data = await response.json();

      if (data.success) {
        // Filter completed, paid, and verified bookings
        const completed = data.bookings.filter(
          (booking) =>
            booking.status === "completed" ||
            booking.status === "paid" ||
            booking.status === "verified",
        );
        setCompletedBookings(completed);
      }
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = completedBookings.filter((booking) => {
    const matchesSearch =
      booking.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.issueType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerId?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalToPay = () => {
    const total = filteredBookings
      .filter((booking) => booking.status === "completed")
      .reduce((total, booking) => {
        const payment = booking.payment?.paymentByWorker || 0;
        return total + Number(payment);
      }, 0);
    return total * 0.1; // 10% of total payment
  };

  const calculateTotalReceived = () => {
    return filteredBookings
      .filter(
        (booking) => booking.status === "paid" || booking.status === "verified",
      )
      .reduce((total, booking) => {
        const payment = booking.payment?.paymentByWorker || 0;
        return total + Number(payment);
      }, 0);
  };

  const handlePayNow = (booking = null) => {
    if (booking) {
      setPaymentBooking(booking);
    } else {
      // Handle all completed bookings
      const allCompleted = filteredBookings.filter(
        (b) => b.status === "completed",
      );
      setPaymentBooking(allCompleted);
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!paymentBooking) return;

    try {
      setProcessingPayment(true);

      // Check if it's a bulk payment (array) or single payment (object)
      const isBulk = Array.isArray(paymentBooking);

      if (isBulk) {
        // Handle multiple bookings
        const updatePromises = paymentBooking.map((booking) =>
          authFetch(
            `${API_BASE_URL}/api/bookings/update-status/${booking._id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "paid" }),
            },
          ).then((res) => res.json()),
        );

        const results = await Promise.all(updatePromises);
        const allSuccess = results.every((data) => data.success);

        if (allSuccess) {
          setSuccessMessage(
            `${paymentBooking.length} payment(s) confirmed successfully!`,
          );
          setShowSuccessModal(true);
          setShowPaymentModal(false);
          setPaymentBooking(null);
          fetchCompletedBookings();
          setTimeout(() => setShowSuccessModal(false), 3000);
        } else {
          alert("Some payments failed to confirm. Please try again.");
        }
      } else {
        // Handle single booking
        const response = await authFetch(
          `${API_BASE_URL}/api/bookings/update-status/${paymentBooking._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "paid" }),
          },
        );

        const data = await response.json();

        if (data.success) {
          setSuccessMessage("Payment confirmed successfully!");
          setShowSuccessModal(true);
          setShowPaymentModal(false);
          setPaymentBooking(null);
          fetchCompletedBookings();
          setTimeout(() => setShowSuccessModal(false), 3000);
        } else {
          alert(data.message || "Failed to confirm payment");
        }
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to confirm payment. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <AppLoader
        title="Loading your payments..."
        subtitle="Fetching your payment and commission records"
      />
    );
  }

  const pendingCount = filteredBookings.filter(
    (b) => b.status === "completed",
  ).length;

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-10 space-y-6">
        {/* Header */}
        <div
          className="mt-18 sm:mt-20 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 relative overflow-hidden motion-safe:transition-all motion-safe:duration-300"
          style={{ background: colors.background.primary }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/5 blur-3xl" />
          </div>

          <div className="relative flex items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-2xl shadow-lg"
                style={{
                  background: colors.primary.gradient,
                }}
              >
                <CreditCard size={22} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                  style={{ color: colors.primary.dark }}
                >
                  My Payments
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Header with Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Pending Payments (To Pay) */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.08)] ring-1 ring-black/5 p-5 sm:p-6
                       motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.10)]"
            style={{
              background: "#f59e0b",
              color: colors.text.inverse,
            }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1">
                    Pending Commission
                  </h2>
                  <p className="text-sm" style={{ color: colors.warning.bg }}>
                    Commission Due (10%)
                  </p>
                </div>

                <div className="text-right">
                  <p
                    style={{ color: colors.warning.bg }}
                    className="text-xs sm:text-sm mb-1"
                  >
                    Total Amount Due
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {calculateTotalToPay().toLocaleString()}/=
                  </p>
                </div>
              </div>

              {calculateTotalToPay() > 0 && (
                <button
                  onClick={() => handlePayNow()}
                  className="cursor-pointer w-full px-6 py-3 rounded-2xl transition-all font-bold flex items-center justify-center gap-2
                             shadow-sm hover:shadow-md active:scale-[0.99]
                             motion-safe:duration-200"
                  style={{
                    background: colors.background.primary,
                    color: colors.warning.DEFAULT,
                  }}
                >
                  <CreditCard className="w-5 h-5" />
                  Pay Pending Commission ({pendingCount})
                </button>
              )}
            </div>
          </div>

          {/* Received Payments */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.08)] ring-1 ring-black/5 p-5 sm:p-6
                       motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.10)]"
            style={{
              background: `linear-gradient(90deg, ${colors.success.DEFAULT})`,
              color: colors.text.inverse,
            }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1">
                    Payments Received
                  </h2>
                  <p className="text-sm" style={{ color: colors.success.bg }}>
                    {filteredBookings.length} Payment Records
                    {filteredBookings.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    style={{ color: colors.success.bg }}
                    className="text-xs sm:text-sm mb-1"
                  >
                    Total Amount Received
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {calculateTotalReceived().toLocaleString()}/=
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-4 sm:p-6 bg-white dark:bg-gray-800">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by service, customer, or location..."
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-2xl border border-gray-300 dark:border-gray-600
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           shadow-sm hover:shadow-md motion-safe:transition-all motion-safe:duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative md:w-[220px]">
              <select
                className="cursor-pointer w-full px-4 py-3 sm:py-2.5 rounded-2xl border border-gray-300 dark:border-gray-600
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none
                           shadow-sm hover:shadow-md motion-safe:transition-all motion-safe:duration-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Pending Payment</option>
                <option value="paid">Paid</option>
                <option value="verified">Verified</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-10 sm:p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-black/5 shadow-sm">
              <CreditCard className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-4">
              No completed payments found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Complete bookings to see payment records here"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredBookings.map((booking) => {
                const StatusIcon =
                  statusConfig[booking.status]?.icon || CheckCircle;

                const fullAmount = Number(
                  booking.payment?.paymentByWorker || 0,
                );
                const commissionAmount = fullAmount * 0.1;

                return (
                  <div
                    key={booking._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-4
                               motion-safe:transition-all motion-safe:duration-200
                               hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                          {booking.service}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {booking.issueType}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusConfig[booking.status]?.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[booking.status]?.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-black/5 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                        </span>
                        <span className="truncate text-gray-900 dark:text-white font-semibold">
                          {booking.customerId?.name || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-black/5 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                        </span>
                        <span className="truncate text-gray-900 dark:text-white font-semibold">
                          {booking.customerId?.phone || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 col-span-2">
                        <span className="h-7 w-7 rounded-xl bg-black/5 flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        </span>
                        <span className="truncate text-gray-900 dark:text-white font-semibold">
                          {formatDate(booking.scheduledTime)} •{" "}
                          {formatTime(booking.scheduledTime)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/40 ring-1 ring-black/5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Amount
                        </span>
                        <span
                          className="text-sm font-extrabold"
                          style={{
                            color:
                              booking.status === "completed"
                                ? colors.warning.DEFAULT
                                : colors.success.DEFAULT,
                          }}
                        >
                          {booking.status === "completed"
                            ? `${commissionAmount.toLocaleString()}/=`
                            : `${fullAmount.toLocaleString()}/=`}
                        </span>
                      </div>

                      {booking.status === "completed" && (
                        <div
                          className="text-[11px] font-semibold mt-1"
                          style={{ color: colors.text.primary }}
                        >
                          Full amount: {fullAmount.toLocaleString()}/=
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setDetailsBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="cursor-pointer w-full px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm
                                   motion-safe:transition-all motion-safe:duration-200
                                   hover:shadow-md active:scale-[0.99]"
                        style={{
                          background: colors.primary.DEFAULT,
                          color: colors.text.inverse,
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Service / Issue
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Scheduled On
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Payment Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredBookings.map((booking) => {
                      const fullAmount = Number(
                        booking.payment?.paymentByWorker || 0,
                      );
                      const commissionAmount = fullAmount * 0.1;

                      return (
                        <tr
                          key={booking._id}
                          className="motion-safe:transition-colors motion-safe:duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {booking.service}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.issueType}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {booking.customerId?.name || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {booking.customerId?.phone || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {formatDate(booking.scheduledTime)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTime(booking.scheduledTime)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusConfig[booking.status]?.color}`}
                            >
                              {React.createElement(
                                statusConfig[booking.status]?.icon ||
                                  CheckCircle,
                                { className: "w-3 h-3" },
                              )}
                              {statusConfig[booking.status]?.label}
                            </span>

                            {(booking.status === "paid" ||
                              booking.status === "verified") &&
                              booking.paidAt && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Paid: {formatDate(booking.paidAt)}
                                </div>
                              )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <span
                                className="text-sm font-extrabold"
                                style={{
                                  color:
                                    booking.status === "completed"
                                      ? colors.warning.DEFAULT
                                      : colors.success.DEFAULT,
                                }}
                              >
                                {booking.status === "completed"
                                  ? `${commissionAmount.toLocaleString()}/=`
                                  : `${fullAmount.toLocaleString()}/=`}
                              </span>

                              {booking.status === "completed" && (
                                <div
                                  className="text-xs font-semibold mt-1"
                                  style={{ color: colors.text.primary }}
                                >
                                  Full amount: {fullAmount.toLocaleString()}/=
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setDetailsBooking(booking);
                                setShowDetailsModal(true);
                              }}
                              className="cursor-pointer px-3.5 py-2 rounded-xl transition-all text-sm font-bold shadow-sm
                                         hover:shadow-md active:scale-[0.99]"
                              style={{
                                background: colors.primary.DEFAULT,
                                color: colors.text.inverse,
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Booking Details Modal */}
        {showDetailsModal && detailsBooking && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm
                         motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
              onClick={() => {
                setShowDetailsModal(false);
                setDetailsBooking(null);
              }}
            />

            <div
              className="relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden
                         bg-white dark:bg-gray-800
                         rounded-t-3xl sm:rounded-3xl shadow-2xl
                         motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-300"
            >
              {/* Modal Header */}
              <div
                className="p-5 sm:p-6"
                style={{
                  background: `linear-gradient(90deg, ${colors.success.DEFAULT}, ${colors.category.emerald.bg})`,
                  color: colors.text.inverse,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                      Payment Details
                    </h2>
                    <p
                      className="text-sm truncate"
                      style={{ color: colors.success.bg }}
                    >
                      {detailsBooking.service} - {detailsBooking.issueType}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setDetailsBooking(null);
                    }}
                    className="cursor-pointer p-2 hover:bg-white/10 rounded-2xl transition-colors active:scale-[0.98]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-96px)] sm:max-h-[calc(90vh-104px)]">
                {/* Booking ID - Copyable */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl ring-1 ring-black/5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Booking ID
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono text-gray-900 dark:text-white overflow-hidden">
                      {detailsBooking._id}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(detailsBooking._id);
                        alert("Booking ID copied to clipboard!");
                      }}
                      className="cursor-pointer px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.99]"
                      style={{
                        background: colors.primary.DEFAULT,
                        color: colors.text.inverse,
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Customer & Service Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">
                      Customer Name
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">
                        {detailsBooking.customerId?.name || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">
                        {detailsBooking.customerId?.phone || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">
                      Scheduled Date & Time
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">
                        {formatDate(detailsBooking.scheduledTime)} at{" "}
                        {formatTime(detailsBooking.scheduledTime)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusConfig[detailsBooking.status]?.color}`}
                    >
                      {React.createElement(
                        statusConfig[detailsBooking.status]?.icon ||
                          CheckCircle,
                        { className: "w-3 h-3" },
                      )}
                      {statusConfig[detailsBooking.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl ring-1 ring-black/5">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm leading-relaxed">
                      {detailsBooking.description}
                    </p>
                  </div>
                </div>

                {/* Worker Review */}
                {detailsBooking.workerReview && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Your Review
                    </label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl ring-1 ring-black/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Rating:
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= detailsBooking.workerReview.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-bold text-gray-900 dark:text-white">
                            {detailsBooking.workerReview.rating}/5
                          </span>
                        </div>
                      </div>

                      {detailsBooking.workerReview.comment && (
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Comment:
                          </span>
                          <p className="mt-1 text-gray-900 dark:text-white text-sm leading-relaxed">
                            {detailsBooking.workerReview.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Amount
                  </label>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5">
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: colors.success.DEFAULT }}
                    >
                      {detailsBooking.payment?.paymentByWorker !== null &&
                      detailsBooking.payment?.paymentByWorker !== undefined
                        ? `${Number(
                            detailsBooking.payment.paymentByWorker,
                          ).toLocaleString()}/=`
                        : "Not paid"}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsBooking(null);
                  }}
                  className="cursor-pointer w-full px-6 py-3 rounded-2xl transition-all font-bold shadow-sm hover:shadow-md active:scale-[0.99]"
                  style={{
                    background: colors.neutral[600],
                    color: colors.text.inverse,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation Modal */}
        {showPaymentModal && paymentBooking && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm
                         motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
              onClick={() => {
                if (!processingPayment) {
                  setShowPaymentModal(false);
                  setPaymentBooking(null);
                }
              }}
            />

            <div
              className="relative w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-hidden
                         bg-white dark:bg-gray-800
                         rounded-t-3xl sm:rounded-3xl shadow-2xl
                         motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-300"
            >
              {/* Modal Header */}
              <div
                className="p-5 sm:p-6"
                style={{
                  background: `linear-gradient(90deg, ${colors.warning.DEFAULT}, ${colors.error.DEFAULT})`,
                  color: colors.text.inverse,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold truncate">
                        Confirm Payment
                      </h2>
                      <p
                        style={{ color: colors.warning.bg }}
                        className="text-sm mt-0.5 truncate"
                      >
                        {Array.isArray(paymentBooking)
                          ? `${paymentBooking.length} pending payment(s)`
                          : "Please verify payment details"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!processingPayment) {
                        setShowPaymentModal(false);
                        setPaymentBooking(null);
                      }
                    }}
                    className="cursor-pointer p-2 hover:bg-white/10 rounded-2xl transition-colors active:scale-[0.98]"
                    disabled={processingPayment}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-96px)] sm:max-h-[calc(90vh-104px)]">
                {Array.isArray(paymentBooking) ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Payment List ({paymentBooking.length} bookings)
                      </h3>

                      <div className="space-y-2">
                        {paymentBooking.map((booking, index) => {
                          const fullAmount = Number(
                            booking.payment?.paymentByWorker || 0,
                          );
                          const commissionAmount = fullAmount * 0.1;

                          return (
                            <div
                              key={booking._id}
                              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5"
                            >
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {index + 1}. {booking.service}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {booking.customerId?.name} •{" "}
                                {commissionAmount.toLocaleString()}/= (10% of{" "}
                                {fullAmount.toLocaleString()}/=)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      className="mb-6 p-4 rounded-2xl border-2 shadow-sm"
                      style={{
                        background: colors.warning.bg,
                        borderColor: colors.warning.DEFAULT,
                      }}
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Commission Amount (10%):
                      </span>
                      <p
                        className="text-3xl font-extrabold tracking-tight"
                        style={{ color: colors.warning.DEFAULT }}
                      >
                        {(
                          paymentBooking.reduce(
                            (sum, b) =>
                              sum + Number(b.payment?.paymentByWorker || 0),
                            0,
                          ) * 0.1
                        ).toLocaleString()}
                        /=
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Total booking amount:{" "}
                        {paymentBooking
                          .reduce(
                            (sum, b) =>
                              sum + Number(b.payment?.paymentByWorker || 0),
                            0,
                          )
                          .toLocaleString()}
                        /=
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5 space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Service:
                      </span>
                      <p className="text-gray-900 dark:text-white font-bold">
                        {paymentBooking.service} - {paymentBooking.issueType}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Customer:
                      </span>
                      <p className="text-gray-900 dark:text-white font-bold">
                        {paymentBooking.customerId?.name}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Commission Amount (10%):
                      </span>
                      <p
                        className="text-2xl font-extrabold tracking-tight"
                        style={{ color: colors.warning.DEFAULT }}
                      >
                        {(
                          Number(paymentBooking.payment?.paymentByWorker || 0) *
                          0.1
                        ).toLocaleString()}
                        /=
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Full booking amount:{" "}
                        {Number(
                          paymentBooking.payment?.paymentByWorker || 0,
                        ).toLocaleString()}
                        /=
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className="rounded-2xl p-4 mb-6 shadow-sm"
                  style={{
                    background: colors.error.bg,
                    border: `2px solid ${colors.error.DEFAULT}`,
                  }}
                >
                  <div className="flex gap-3">
                    <AlertCircle
                      className="w-5 h-5"
                      style={{ color: colors.error.DEFAULT }}
                    />
                    <div>
                      <h4
                        className="text-sm font-extrabold mb-2"
                        style={{ color: colors.error.light }}
                      >
                        ⚠️ Important Confirmation Required
                      </h4>
                      <p
                        className="text-sm mb-2"
                        style={{ color: colors.error.DEFAULT }}
                      >
                        Please confirm that you have{" "}
                        <strong>
                          already transferred the 10% commission through your
                          bank
                        </strong>{" "}
                        for{" "}
                        {Array.isArray(paymentBooking)
                          ? "these bookings"
                          : "this booking"}
                        .
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: colors.error.DEFAULT }}
                      >
                        By clicking "Confirm", you acknowledge that the 10%
                        commission payment has been completed and this action
                        will update the booking status to "Paid".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentBooking(null);
                    }}
                    className="cursor-pointer flex-1 px-6 py-3 rounded-2xl transition-all font-bold shadow-sm hover:shadow-md active:scale-[0.99]"
                    style={{
                      border: `1px solid ${colors.border.DEFAULT}`,
                      color: colors.text.primary,
                      background: colors.background.primary,
                    }}
                    disabled={processingPayment}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmPayment}
                    className="cursor-pointer flex-1 px-6 py-3 rounded-2xl transition-all font-bold shadow-sm hover:shadow-md active:scale-[0.99]
                               flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(90deg, ${colors.warning.DEFAULT}, ${colors.error.DEFAULT})`,
                      color: colors.text.inverse,
                    }}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <span className="w-5 h-5 inline-block align-middle">
                          <AppLoader />
                        </span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirm
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm
                         motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
            />
            <div
              className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full
                         motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-300"
            >
              <div className="p-8 text-center">
                <div
                  className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: colors.success.bg }}
                >
                  <CheckCircle
                    className="w-10 h-10"
                    style={{ color: colors.success.DEFAULT }}
                  />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
