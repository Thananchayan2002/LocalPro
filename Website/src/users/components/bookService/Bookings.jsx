import React, { useState, useEffect } from "react";
import BookingsHeader from "./bookings/BookingsHeader";
import FilterTabs from "./bookings/FilterTabs";
import LoadingState from "./bookings/LoadingState";
import EmptyState from "./bookings/EmptyState";
import BookingsTable from "./bookings/BookingsTable";
import BookingDetailModal from "./bookings/BookingDetailModal";
import ReviewModal from "./bookings/ReviewModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
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
      const response = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
        // Check review status for each booking
        checkReviewableBookings(data.bookings || []);
      }
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
          const response = await fetch(
            `${API_BASE_URL}/api/reviews/can-review/${booking._id}`,
            {
              headers: getAuthHeaders(),
            }
          );
          const data = await response.json();
          if (data.success) {
            reviewStatus[booking._id] = data.canReview;
          }
        } catch (error) {
          console.error("Error checking review status:", error);
        }
      }
    }
    setReviewableBookings(reviewStatus);
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
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          paymentByUser: parseFloat(reviewData.paymentByUser),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Review submitted successfully!");
        handleCloseReviewModal();
        fetchBookings(); // Refresh bookings
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
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
        <BookingsHeader bookingsCount={bookings.length} />
        <FilterTabs
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <LoadingState />
        ) : filteredBookings.length === 0 ? (
          <EmptyState filterStatus={filterStatus} />
        ) : (
          <BookingsTable
            bookings={filteredBookings}
            reviewableBookings={reviewableBookings}
            onViewDetails={handleViewDetails}
            onOpenReview={handleOpenReviewModal}
          />
        )}
      </div>

      {/* Modals */}
      {showDetailModal && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={handleCloseModal}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          booking={selectedBooking}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default Bookings;
