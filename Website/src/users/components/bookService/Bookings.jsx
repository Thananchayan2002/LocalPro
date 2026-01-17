import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { getMyBookings } from "../../api/booking/booking";
import { canReviewBooking, submitReview } from "../../api/review/review";

const Bookings = () => {
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
      setBookings(data);
      // Check review status for each booking
      checkReviewableBookings(data);
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

  const getStatusColor = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800 border-yellow-200",
      assigned: "bg-blue-100 text-blue-800 border-blue-200",
      inspecting: "bg-purple-100 text-purple-800 border-purple-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      inProgress: "bg-indigo-100 text-indigo-800 border-indigo-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
      assigned: "Assigned",
      inspecting: "Inspecting",
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
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-purple-600 rounded-lg">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-sm text-gray-600">
              {bookings.length} total booking(s)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            "all",
            "requested",
            "assigned",
            "inProgress",
            "completed",
            "cancelled",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                filterStatus === status
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status === "all" ? "All" : formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                <Calendar size={32} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Bookings Found
              </h3>
              <p className="text-gray-600 text-sm">
                {filterStatus === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${formatStatus(filterStatus).toLowerCase()} bookings.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Scheduled
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Professional
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.service}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {booking.issueType}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <p className="text-sm text-gray-900">
                            {new Date(booking.scheduledTime).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 truncate">
                            {booking.location?.address ||
                              `${booking.location?.area}, ${booking.location?.district}`}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {booking.professionalId ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <p className="text-sm text-gray-900">
                              {booking.professionalId.name || "Assigned"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Not assigned</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {formatStatus(booking.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {" "}
                        {booking.payment && booking.payment.paymentByUser ? (
                          <div className="flex items-center gap-1.5 text-green-700">
                            <span className="text-sm font-semibold">
                              {booking.payment.paymentByUser}/=
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Not paid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {" "}
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {reviewableBookings[booking._id] && (
                            <button
                              onClick={() => handleOpenReviewModal(booking)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition"
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
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-md z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Booking Details</h2>
                  <p className="text-sm text-purple-100 mt-0.5">
                    Order ID: {selectedBooking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Status */}
              <div
                className={`rounded-lg p-3 border ${getStatusColor(
                  selectedBooking.status
                )}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(selectedBooking.status)}
                  <p className="text-xs font-semibold uppercase">Status</p>
                </div>
                <p className="text-base font-bold">
                  {formatStatus(selectedBooking.status)}
                </p>
              </div>

              {/* Service & Issue */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 font-semibold uppercase mb-1">
                  Service & Issue
                </p>
                <p className="text-base font-bold text-gray-900">
                  {selectedBooking.service}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {selectedBooking.issueType}
                </p>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700">
                  {selectedBooking.description}
                </p>
              </div>

              {/* Scheduled Time */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-orange-700 font-semibold uppercase">
                    Scheduled Time
                  </p>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(selectedBooking.scheduledTime).toLocaleString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
                {selectedBooking.duration && (
                  <p className="text-xs text-orange-700 mt-1">
                    Duration: {selectedBooking.duration} hours
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-700 font-semibold uppercase">
                    Location
                  </p>
                </div>
                <p className="text-sm text-gray-900">
                  {selectedBooking.location?.address}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-green-700">
                  {selectedBooking.location?.city && (
                    <p>City: {selectedBooking.location.city}</p>
                  )}
                  {selectedBooking.location?.district && (
                    <p>District: {selectedBooking.location.district}</p>
                  )}
                  {selectedBooking.location?.area && (
                    <p className="col-span-2">
                      Area: {selectedBooking.location.area}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional (if assigned) */}
              {selectedBooking.professionalId && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-700 font-semibold uppercase">
                      Assigned Professional
                    </p>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {selectedBooking.professionalId.name || "N/A"}
                  </p>
                </div>
              )}

              {/* Created At */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Booking Created
                </p>
                <p className="text-sm text-gray-700">
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
            <div className="flex-shrink-0 bg-white border-t p-4 z-10">
              <button
                onClick={handleCloseModal}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-md z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Submit Review & Payment</h2>
                  <p className="text-sm text-green-100 mt-0.5">
                    {selectedBooking.service} - {selectedBooking.issueType}
                  </p>
                </div>
                <button
                  onClick={handleCloseReviewModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Professional Info */}
              {selectedBooking.professionalId && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-700 font-semibold uppercase">
                      Professional
                    </p>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {selectedBooking.professionalId.name}
                  </p>
                </div>
              )}

              {/* Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    {reviewData.rating} / 5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Review Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                  placeholder="Share your experience with this professional..."
                />
              </div>

              {/* Payment */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Payment Amount (LKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={reviewData.paymentByUser}
                    onChange={(e) =>
                      setReviewData({
                        ...reviewData,
                        paymentByUser: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="Enter amount you paid"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter the amount you paid for this service
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white border-t p-4 flex gap-3 z-10">
              <button
                onClick={handleCloseReviewModal}
                disabled={submittingReview}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
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
