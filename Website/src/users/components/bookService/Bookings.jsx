import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../../styles/colors";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  X,
  Star,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { getMyBookings } from "../../api/booking/booking";
import { canReviewBooking, submitReview } from "../../api/review/review";
import AppLoader from "../common/AppLoader";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    paymentByUser: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewableBookings, setReviewableBookings] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  // Hide/show header when modal opens/closes
  useEffect(() => {
    if (showDetailModal || showReviewModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showDetailModal, showReviewModal]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      console.log("📦 Fetched bookings data:", data);
      const bookingsArray = Array.isArray(data) ? data : [];
      console.log("📋 Bookings array:", bookingsArray);
      setBookings(bookingsArray);
      // Check review status for each booking
      checkReviewableBookings(bookingsArray);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewableBookings = async (bookingsList) => {
    const reviewStatus = {};
    for (const booking of bookingsList) {
      if (booking.status === "assigned") {
        try {
          const canReview = await canReviewBooking(booking._id);
          reviewStatus[booking._id] = canReview;
        } catch (error) {
          console.error("Error checking review status:", error);
        }
      }
    }
    setReviewableBookings(reviewStatus);
  };

  // Use global colors for status - returns proper class names
  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-yellow-200 text-yellow-700 border-yellow-200";
      case "assigned":
        return "bg-blue-200 text-blue-700 border-blue-200";
      case "inspecting":
        return "bg-purple-200 text-purple-700 border-purple-200";
      case "paid":
        return "bg-green-200 text-green-700 border-green-200";
      case "approved":
        return "bg-orange-200 text-orange-700 border-orange-200";
      case "completed":
        return "bg-emerald-200 text-emerald-700 border-emerald-200";
      case "requested":
        return "bg-red-200 text-red-700 border-red-200";
      default:
        return "bg-gray-200 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "requested":
        return <Clock className="w-4 h-4" />;
      case "assigned":
      case "approved":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      requested: "Requested",
      verified: "Verified",
      assigned: "Assigned",
      inspecting: "Inspecting",
      paid: "Paid",
      approved: "Approved",
      inProgress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewData({ rating: 5, comment: "", paymentByUser: "" });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setReviewData({ rating: 5, comment: "", paymentByUser: "" });
  };

  const handleSubmitReview = async () => {
    if (!reviewData.comment.trim() || !reviewData.paymentByUser) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmittingReview(true);
      const data = await submitReview({
        bookingId: selectedBooking._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        paymentByUser: parseFloat(reviewData.paymentByUser),
      });

      if (data.success) {
        alert("Review submitted successfully!");
        handleCloseReviewModal();
        fetchBookings(); // Refresh bookings
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBookings =
    filterStatus === "all"
      ? Array.isArray(bookings)
        ? bookings
        : []
      : Array.isArray(bookings)
        ? bookings.filter((b) => b.status === filterStatus)
        : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {loading && (
        <AppLoader
          title="Loading bookings"
          subtitle="Fetching your latest bookings"
        />
      )}

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-60 h-60 rounded-full bg-green-500/5 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-1 py-2 md:px-6 lg:px-8 md:max-w-11/12">
        {/* Back Button */}
        <div className="mb-6 mt-2 ml-2">
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </button>
        </div>

        {/* Header Section */}
        <div className="mb-8 mx-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-3xl bg-blue-500/10 blur-xl -z-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  My Bookings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track and manage all your bookings
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-xl p-5 md:p-7 border border-gray-200 dark:border-gray-700 mb-6">
            {/* Status Filter */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                Filter by Status
              </label>

              {/* Mobile Dropdown - Hidden on Desktop */}
              <div className="relative md:hidden">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium shadow-sm hover:shadow-md cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="all">🔍 All Statuses</option>
                  <option value="requested">🔴 Requested</option>
                  <option value="verified">✅ Verified</option>
                  <option value="assigned">🔵 Assigned</option>
                  <option value="paid">🟢 Paid</option>
                  <option value="completed">💚 Completed</option>
                  <option value="cancelled">⚫ Cancelled</option>
                </select>
              </div>

              {/* Desktop Buttons - Hidden on Mobile */}
              <div className="hidden md:flex  flex-wrap gap-4">
                {[
                  { value: "all", label: "All", icon: "🔍" },
                  { value: "requested", label: "Requested", icon: "🔴" },
                  { value: "verified", label: "Verified", icon: "✅" },
                  { value: "assigned", label: "Assigned", icon: "🔵" },
                  { value: "paid", label: "Paid", icon: "🟢" },
                  { value: "completed", label: "Completed", icon: "💚" },
                  { value: "cancelled", label: "Cancelled", icon: "⚫" },
                ].map((status) => {
                  const isActive = filterStatus === status.value;
                  const count = bookings.filter(b => status.value === "all" || b.status === status.value).length;
                  return (
                    <button
                      key={status.value}
                      onClick={() => setFilterStatus(status.value)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 border-2 ${isActive
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md'
                        }`}
                    >
                      <span className="text-lg">{status.icon}</span>
                      <span>{status.label}</span>
                      {isActive && (
                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { status: "requested", label: "Requested", icon: "📋", gradient: "from-red-100 to-red-200/50 dark:from-red-900/20 dark:to-red-800/10", border: "border-red-300 dark:border-red-700" },
                { status: "assigned", label: "Assigned", icon: "✓", gradient: "from-blue-100 to-blue-200/50 dark:from-blue-900/20 dark:to-blue-800/10", border: "border-blue-300 dark:border-blue-700" },
                { status: "paid", label: "Paid", icon: "💳", gradient: "from-green-100 to-green-200/50 dark:from-green-900/20 dark:to-green-800/10", border: "border-green-300 dark:border-green-700" },
                { status: "verified", label: "Verified", icon: "✅", gradient: "from-yellow-100 to-yellow-200/50 dark:from-yellow-900/20 dark:to-yellow-800/10", border: "border-yellow-300 dark:border-yellow-700" },
              ].map((item) => {
                const count = bookings.filter(b => b.status === item.status).length;
                return (
                  <div key={item.status} className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-5 border-2 ${item.border} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">{item.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-gradient-to-br from-white via-white to-purple-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Content */}
          <div className="overflow-x-auto">
            {loading ? null : filteredBookings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-6 shadow-lg">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No Bookings Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filterStatus === "all"
                    ? "You haven't made any bookings yet"
                    : `No ${formatStatus(filterStatus).toLowerCase()} bookings found`}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-300 dark:from-gray-700/80 dark:via-gray-800/80 dark:to-gray-900/80 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="py-4 px-6 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Service
                      </span>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Issue Type
                      </span>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Location & Time
                      </span>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </span>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Professional
                      </span>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Payment
                      </span>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 transition-all duration-300 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 group"
                    >
                      {/* Service */}
                      <td className="py-4 px-6">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {booking.service}
                        </p>
                      </td>

                      {/* Issue Type */}
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {booking.issueType}
                        </p>
                      </td>

                      {/* Location & Scheduled Time */}
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          {/* Location */}
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {booking.location?.area || booking.location?.address || "Not specified"}
                            </span>
                          </div>
                          {/* Scheduled Time */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(booking.scheduledTime).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "2-digit"
                              })}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(booking.scheduledTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {formatStatus(booking.status)}
                        </span>
                      </td>

                      {/* Professional */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.professionalId?.name || "Not assigned"}
                          </span>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-6">
                        {booking.payment && booking.payment.paymentByUser ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                              ₹{booking.payment.paymentByUser}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {reviewableBookings[booking._id] && (
                            <button
                              onClick={() => handleOpenReviewModal(booking)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transform animate-slideUp border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg rounded-t-3xl flex items-center justify-between relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Booking Details
                </h2>
                <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded-md font-mono text-xs">
                    #{selectedBooking._id.slice(-8).toUpperCase()}
                  </span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white hover:rotate-90 transform relative z-10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-800 dark:to-gray-900">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border shadow-sm ${getStatusColor(selectedBooking.status)}`}>
                  {getStatusIcon(selectedBooking.status)}
                  Status: {formatStatus(selectedBooking.status)}
                </span>
              </div>

              {/* Service & Issue */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Service & Issue
                  </p>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                  {selectedBooking.service}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {selectedBooking.issueType}
                </p>
              </div>

              {/* Description */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  Description
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedBooking.description}
                </p>
              </div>

              {/* Scheduled Time */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-5 border-2 border-purple-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-200 dark:bg-purple-800/50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                  </div>
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Scheduled Time
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(selectedBooking.scheduledTime).toLocaleString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
                {selectedBooking.duration && (
                  <p className="text-sm mt-2 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Duration: {selectedBooking.duration} hours
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-800/10 rounded-2xl p-5 border-2 border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-200 dark:bg-green-800/50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-700 dark:text-green-300" />
                  </div>
                  <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">
                    Location
                  </p>
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  {selectedBooking.location?.address}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedBooking.location?.city && (
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">City</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{selectedBooking.location.city}</p>
                    </div>
                  )}
                  {selectedBooking.location?.district && (
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">District</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{selectedBooking.location.district}</p>
                    </div>
                  )}
                  {selectedBooking.location?.area && (
                    <div className="col-span-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">Area</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{selectedBooking.location.area}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional (if assigned) */}
              {selectedBooking.professionalId && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-800/10 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                        Assigned Professional
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedBooking.professionalId.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Created At */}
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Booking Created
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(selectedBooking.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-5 rounded-b-3xl z-10">
              <button
                onClick={handleCloseModal}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden animate-fadeIn">
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full flex flex-col transform animate-slideUp border border-gray-200 dark:border-gray-700"
            style={{ maxHeight: "90vh" }}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-5 shadow-lg rounded-t-3xl z-10 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Star className="w-6 h-6" />
                    Submit Review & Payment
                  </h2>
                  <p className="text-sm text-green-100 mt-1 font-medium">
                    {selectedBooking.service} - {selectedBooking.issueType}
                  </p>
                </div>
                <button
                  onClick={handleCloseReviewModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-br from-gray-50/50 to-green-50/30 dark:from-gray-800 dark:to-gray-900">
              {/* Professional Info */}
              {selectedBooking.professionalId && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wider mb-1">
                        Professional
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedBooking.professionalId.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Rating
                </label>
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                      className="focus:outline-none transition-all hover:scale-125 transform active:scale-95"
                    >
                      <Star
                        className={`w-10 h-10 transition-all ${star <= reviewData.rating
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                          : "text-gray-300 dark:text-gray-600"
                          }`}
                      />
                    </button>
                  ))}
                  <div className="ml-auto bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {reviewData.rating}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400"> / 5</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Review Comment
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-all resize-none text-sm placeholder:text-gray-400"
                  placeholder="Share your experience with this professional... Tell us what you liked or how they could improve."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Your feedback helps us improve our services
                </p>
              </div>

              {/* Payment */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border-2 border-green-200 dark:border-green-700 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  Payment Amount (LKR)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">Rs</span>
                  </div>
                  <input
                    type="number"
                    value={reviewData.paymentByUser}
                    onChange={(e) =>
                      setReviewData({
                        ...reviewData,
                        paymentByUser: e.target.value,
                      })
                    }
                    className="w-full pl-16 pr-4 py-4 border-2 border-green-300 dark:border-green-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-all text-lg font-semibold placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 mt-3 flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                  <CheckCircle className="w-3 h-3" />
                  Enter the amount you paid for this service
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-5 rounded-b-3xl flex gap-3 z-10">
              <button
                onClick={handleCloseReviewModal}
                disabled={submittingReview}
                className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-[1.02]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {submittingReview ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
