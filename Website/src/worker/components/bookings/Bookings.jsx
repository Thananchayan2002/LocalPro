import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  Star,
  X,
} from "lucide-react";
import AppLoader from "../common/AppLoader";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "../../../utils/authFetch";
import { colors } from "../../../styles/colors";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const statusConfig = {
  requested: {
    label: "Requested",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  assigned: {
    label: "Assigned",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  inspecting: {
    label: "Inspecting",
    color: "bg-purple-100 text-purple-800",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  inProgress: {
    label: "In Progress",
    color: "bg-orange-100 text-orange-800",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  paid: {
    label: "Paid",
    color: "bg-teal-100 text-teal-800",
    icon: CheckCircle,
  },
  verified: {
    label: "Verified",
    color: "bg-indigo-100 text-indigo-800",
    icon: Star,
  },
};

export const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    payment: "",
  });

  useEffect(() => {
    fetchProfessionalBookings();
  }, []);

  const fetchProfessionalBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/professional-bookings`,
      );

      const data = await response.json();

      if (data.success) {
        console.log("Fetched bookings with payments:", data.bookings);
        setBookings(data.bookings || []);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
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

  const handleMarkComplete = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      rating: 5,
      comment: "",
      payment: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setFormData({
      rating: 5,
      comment: "",
      payment: "",
    });
  };

  const handleSubmitComplete = async (e) => {
    e.preventDefault();

    if (!formData.comment.trim()) {
      alert("Please provide a comment");
      return;
    }

    if (!formData.payment || formData.payment <= 0) {
      alert("Please provide a valid payment amount");
      return;
    }

    try {
      setSubmitting(true);

      const response = await authFetch(
        `${API_BASE_URL}/api/bookings/complete-booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: selectedBooking._id,
            rating: formData.rating,
            comment: formData.comment,
            payment: parseFloat(formData.payment),
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Booking completed successfully!");
        handleCloseModal();
        fetchProfessionalBookings(); // Refresh the list
      } else {
        alert(data.message || "Failed to complete booking");
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      alert("Failed to complete booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLoader
        title="Loading your bookings..."
        subtitle="Fetching your latest booking records"
      />
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-10 space-y-6">
        {/* Header */}
        <div
          className="mt-18 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-5 sm:p-6 relative overflow-hidden
                     motion-safe:transition-all motion-safe:duration-300"
          style={{ background: colors.background.primary }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/5 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-start sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-2xl shadow-lg"
                  style={{
                    background: colors.primary.gradient,
                  }}
                >
                  <Calendar size={22} className="text-white" />
                </div>
                <div>
                  <h1
                    className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                    style={{ color: colors.primary.dark }}
                  >
                    My Bookings
                  </h1>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {filteredBookings.length} booking
                    {filteredBookings.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-black/5
                             motion-safe:transition-transform motion-safe:duration-200 hover:scale-[1.02]"
                  style={{ color: colors.text.secondary }}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: colors.text.secondary }}
                />
                <input
                  type="text"
                  placeholder="Search by service, customer, or location..."
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-2xl border outline-none
                             focus:ring-2 focus:ring-black/10 focus:border-transparent
                             shadow-sm hover:shadow-md
                             motion-safe:transition-all motion-safe:duration-200"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    background: colors.background.primary,
                    color: colors.text.primary,
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative md:w-[240px]">
                <Filter
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: colors.text.secondary }}
                />
                <select
                  className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-2xl border outline-none appearance-none cursor-pointer
                             focus:ring-2 focus:ring-black/10 focus:border-transparent
                             shadow-sm hover:shadow-md
                             motion-safe:transition-all motion-safe:duration-200"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    background: colors.background.primary,
                    color: colors.text.primary,
                  }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paid">Paid</option>
                  <option value="verified">Verified</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5"
                  style={{ color: colors.text.secondary }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-2xl p-4 shadow-sm ring-1 ring-black/5
                       motion-safe:transition-all motion-safe:duration-200"
            style={{
              background: colors.error.bg,
              border: `1px solid ${colors.error.DEFAULT}`,
            }}
          >
            <div className="flex items-start gap-3">
              <XCircle
                className="w-5 h-5 mt-0.5"
                style={{ color: colors.error.DEFAULT }}
              />
              <div>
                <p
                  className="font-semibold"
                  style={{ color: colors.error.DEFAULT }}
                >
                  Something went wrong
                </p>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: colors.error.DEFAULT }}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <div
            className="rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-10 sm:p-12 text-center"
            style={{ background: colors.background.primary }}
          >
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-black/5 shadow-sm">
              <Calendar
                className="w-8 h-8"
                style={{ color: colors.text.secondary }}
              />
            </div>
            <h3
              className="text-lg sm:text-xl font-bold mt-4"
              style={{ color: colors.text.primary }}
            >
              No bookings found
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: colors.text.secondary }}
            >
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You don't have any bookings yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredBookings.map((booking) => {
                const StatusIcon =
                  statusConfig[booking.status]?.icon || AlertCircle;

                return (
                  <div
                    key={booking._id}
                    className="rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 p-4
                               motion-safe:transition-all motion-safe:duration-200
                               hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]"
                    style={{ background: colors.background.primary }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-sm font-bold tracking-tight truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {booking.service}
                        </p>
                        <p
                          className="text-xs mt-1 truncate"
                          style={{ color: colors.text.secondary }}
                        >
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
                          <User
                            className="w-3.5 h-3.5"
                            style={{ color: colors.text.secondary }}
                          />
                        </span>
                        <span
                          className="truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {/* Show first and second part of name on separate lines */}
                          {(() => {
                            const name = booking.customerId?.name || "N/A";
                            if (name === "N/A") return name;
                            const [first, ...rest] = name.split(" ");
                            return (
                              <>
                                <span>{first}</span>
                                {rest.length > 0 && (
                                  <span style={{ display: "block" }}>
                                    {rest.join(" ")}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-xl bg-black/5 flex items-center justify-center">
                          <Phone
                            className="w-3.5 h-3.5"
                            style={{ color: colors.text.secondary }}
                          />
                        </span>
                        <span
                          className="truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {booking.customerId?.phone || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 col-span-2">
                        <span className="h-7 w-7 rounded-xl bg-black/5 flex items-center justify-center">
                          <Calendar
                            className="w-3.5 h-3.5"
                            style={{ color: colors.text.secondary }}
                          />
                        </span>
                        <span
                          className="truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {formatDate(booking.scheduledTime)} •{" "}
                          {formatTime(booking.scheduledTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 col-span-2">
                        <span className="h-7 w-7 rounded-xl bg-black/5 flex items-center justify-center">
                          <MapPin
                            className="w-3.5 h-3.5"
                            style={{ color: colors.text.secondary }}
                          />
                        </span>
                        <span
                          className="truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {booking.location?.city || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 col-span-2 pt-1">
                        <span
                          className="text-sm font-bold"
                          style={{ color: colors.text.primary }}
                        >
                          {booking.payment?.paymentByWorker !== null &&
                          booking.payment?.paymentByWorker !== undefined
                            ? `LKR ${Number(
                                booking.payment.paymentByWorker,
                              ).toLocaleString()}`
                            : "Not paid"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setDetailsBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="cursor-pointer flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-sm
                                   motion-safe:transition-all motion-safe:duration-200
                                   hover:shadow-md active:scale-[0.99]"
                        style={{
                          background: colors.primary.DEFAULT,
                          color: colors.neutral[50],
                        }}
                      >
                        View Details
                      </button>

                      {booking.status !== "completed" &&
                        booking.status !== "cancelled" &&
                        booking.status !== "verified" && (
                          <button
                            onClick={() => handleMarkComplete(booking)}
                            className="cursor-pointer flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-sm
                                       motion-safe:transition-all motion-safe:duration-200
                                       hover:shadow-md active:scale-[0.99]"
                            style={{
                              background: colors.success.DEFAULT,
                              color: colors.neutral[50],
                            }}
                          >
                            Mark Complete
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div
              className="hidden md:block rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] ring-1 ring-black/5 overflow-hidden"
              style={{ background: colors.background.primary }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background: colors.background.secondary,
                        borderBottom: `1px solid ${colors.border.DEFAULT}`,
                      }}
                    >
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Service / Issue
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Customer
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Contact
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Scheduled
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Status
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Payment
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text.secondary }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking) => {
                      const StatusIcon =
                        statusConfig[booking.status]?.icon || AlertCircle;

                      return (
                        <tr
                          key={booking._id}
                          className="motion-safe:transition-colors motion-safe:duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="px-6 py-4">
                            <div
                              className="text-sm font-bold"
                              style={{ color: colors.text.primary }}
                            >
                              {booking.service}
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: colors.text.secondary }}
                            >
                              {booking.issueType}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User
                                className="w-4 h-4"
                                style={{ color: colors.text.secondary }}
                              />
                              <span
                                className="text-sm"
                                style={{ color: colors.text.primary }}
                              >
                                {/* Show first and second part of name on separate lines */}
                                {(() => {
                                  const name =
                                    booking.customerId?.name || "N/A";
                                  if (name === "N/A") return name;
                                  const [first, ...rest] = name.split(" ");
                                  return (
                                    <>
                                      <span>{first}</span>
                                      {rest.length > 0 && (
                                        <span style={{ display: "block" }}>
                                          {rest.join(" ")}
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Phone
                                className="w-4 h-4"
                                style={{ color: colors.text.secondary }}
                              />
                              <span
                                className="text-sm"
                                style={{ color: colors.text.primary }}
                              >
                                {booking.customerId?.phone || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar
                                className="w-4 h-4"
                                style={{ color: colors.text.secondary }}
                              />
                              <div>
                                <div
                                  className="text-sm"
                                  style={{ color: colors.text.primary }}
                                >
                                  {formatDate(booking.scheduledTime)}
                                </div>
                                <div
                                  className="text-xs"
                                  style={{ color: colors.text.secondary }}
                                >
                                  {formatTime(booking.scheduledTime)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusConfig[booking.status]?.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[booking.status]?.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-sm font-bold"
                                style={{ color: colors.text.primary }}
                              >
                                {booking.payment?.paymentByWorker !== null &&
                                booking.payment?.paymentByWorker !== undefined
                                  ? `LKR ${Number(
                                      booking.payment.paymentByWorker,
                                    ).toLocaleString()}`
                                  : "Not paid"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setDetailsBooking(booking);
                                  setShowDetailsModal(true);
                                }}
                                className="cursor-pointer px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm
                                           motion-safe:transition-all motion-safe:duration-200
                                           hover:shadow-md active:scale-[0.99]"
                                style={{
                                  background: colors.primary.DEFAULT,
                                  color: colors.neutral[50],
                                }}
                              >
                                View Details
                              </button>

                              {booking.status !== "completed" &&
                                booking.status !== "cancelled" &&
                                booking.status !== "verified" && (
                                  <button
                                    onClick={() => handleMarkComplete(booking)}
                                    className="cursor-pointer px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm
                                               motion-safe:transition-all motion-safe:duration-200
                                               hover:shadow-md active:scale-[0.99]"
                                    style={{
                                      background: colors.success.DEFAULT,
                                      color: colors.neutral[50],
                                    }}
                                  >
                                    Mark Complete
                                  </button>
                                )}
                            </div>
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
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                      Booking Details
                    </h2>
                    <p className="text-blue-100 text-sm truncate">
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
                      className="cursor-pointer px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold active:scale-[0.98]"
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
                          AlertCircle,
                        { className: "w-3 h-3" },
                      )}
                      {statusConfig[detailsBooking.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Location Details */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl ring-1 ring-black/5 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          City:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white font-semibold">
                          {detailsBooking.location?.city || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          District:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white font-semibold">
                          {detailsBooking.location?.district || "N/A"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Area:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white font-semibold">
                          {detailsBooking.location?.area || "N/A"}
                        </span>
                      </div>
                      {detailsBooking.location?.address && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">
                            Address:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white font-semibold">
                            {detailsBooking.location.address}
                          </span>
                        </div>
                      )}
                    </div>
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

                {/* Payment Info */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Status
                  </label>
                  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black/5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-bold">
                        {detailsBooking.payment?.paymentByWorker !== null &&
                        detailsBooking.payment?.paymentByWorker !== undefined
                          ? `LKR ${Number(
                              detailsBooking.payment.paymentByWorker,
                            ).toLocaleString()}`
                          : "Not paid"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsBooking(null);
                  }}
                  className="cursor-pointer w-full px-6 py-3 bg-gray-700 text-white rounded-2xl hover:bg-gray-800 transition-colors font-bold active:scale-[0.99]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Booking Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm
                         motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
              onClick={() => {
                if (!submitting) handleCloseModal();
              }}
            />

            <div
              className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden
                         bg-white dark:bg-gray-800
                         rounded-t-3xl sm:rounded-3xl shadow-2xl
                         motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-300"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                      Complete Booking
                    </h2>
                    <p className="text-green-100 text-sm truncate">
                      {selectedBooking.service} - {selectedBooking.issueType}
                    </p>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="cursor-pointer p-2 hover:bg-white/10 rounded-2xl transition-colors active:scale-[0.98]"
                    disabled={submitting}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleSubmitComplete}
                className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-96px)] sm:max-h-[calc(90vh-104px)]"
              >
                {/* Booking Details */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl ring-1 ring-black/5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Customer:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white font-semibold">
                        {selectedBooking.customerId?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Booking ID:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white font-mono font-semibold">
                        {selectedBooking._id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Rate the Client
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        className="cursor-pointer motion-safe:transition-transform motion-safe:duration-150 hover:scale-110 active:scale-105"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= formData.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {formData.rating} star{formData.rating !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Comment / Feedback
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl
                               focus:ring-2 focus:ring-green-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               shadow-sm hover:shadow-md
                               motion-safe:transition-all motion-safe:duration-200"
                    placeholder="Share your experience with this client..."
                    required
                  />
                </div>

                {/* Payment */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Amount (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.payment}
                      onChange={(e) =>
                        setFormData({ ...formData, payment: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 shadow-sm hover:shadow-md
                                 motion-safe:transition-all motion-safe:duration-200"
                      placeholder="Enter payment amount"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="cursor-pointer flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600
                               text-gray-700 dark:text-gray-300 rounded-2xl
                               hover:bg-gray-50 dark:hover:bg-gray-700
                               motion-safe:transition-all motion-safe:duration-200
                               font-bold active:scale-[0.99]"
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl
                               hover:from-green-700 hover:to-blue-700
                               motion-safe:transition-all motion-safe:duration-200
                               font-bold flex items-center justify-center gap-2
                               disabled:opacity-50 disabled:cursor-not-allowed
                               active:scale-[0.99]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="w-5 h-5 inline-block align-middle">
                          <AppLoader />
                        </span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Complete Booking
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
