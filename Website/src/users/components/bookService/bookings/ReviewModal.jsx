import React, { useState } from "react";
import { X, User, Star, DollarSign, Loader, CheckCircle } from "lucide-react";
import { colors } from "../../../../styles/colors";

const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    paymentByUser: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reviewData.comment.trim() || !reviewData.paymentByUser) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    await onSubmit(reviewData);
    setSubmitting(false);
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Modal Header */}
        <div
          className="flex-shrink-0 text-white p-4 shadow-md z-10"
          style={{
            background:
              colors.success.gradient ||
              `linear-gradient(to right, ${colors.success.DEFAULT}, ${colors.category.emerald})`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Submit Review & Payment</h2>
              <p
                className="text-sm mt-0.5"
                style={{ color: colors.success.light }}
              >
                {booking.service} - {booking.issueType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Professional Info */}
          {booking.professionalId && (
            <div
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: colors.primary.light,
                borderColor: colors.primary.DEFAULT,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <User
                  className="w-4 h-4"
                  style={{ color: colors.primary.DEFAULT }}
                />
                <p
                  className="text-xs font-semibold uppercase"
                  style={{ color: colors.text.primary }}
                >
                  Professional
                </p>
              </div>
              <p
                className="text-base font-semibold"
                style={{ color: colors.text.primary }}
              >
                {booking.professionalId.name}
              </p>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              style={{ color: colors.text.primary }}
            >
              Rating <span style={{ color: colors.error.DEFAULT }}>*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className="w-8 h-8"
                    style={{
                      fill:
                        star <= reviewData.rating
                          ? colors.category.yellow
                          : colors.neutral[200],
                      color:
                        star <= reviewData.rating
                          ? colors.category.yellow
                          : colors.neutral[200],
                    }}
                  />
                </button>
              ))}
              <span
                className="ml-2 text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                {reviewData.rating} / 5
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              style={{ color: colors.text.primary }}
            >
              Review Comment{" "}
              <span style={{ color: colors.error.DEFAULT }}>*</span>
            </label>
            <textarea
              value={reviewData.comment}
              onChange={(e) =>
                setReviewData({ ...reviewData, comment: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 rounded-lg resize-none text-sm transition"
              style={{
                borderWidth: "1px",
                borderColor: "var(--color-border)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.success.DEFAULT;
                e.target.style.boxShadow = `0 0 0 3px ${colors.success.light}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border)";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Share your experience with this professional..."
            />
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              style={{ color: colors.text.primary }}
            >
              Payment Amount (LKR){" "}
              <span style={{ color: colors.error.DEFAULT }}>*</span>
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: colors.text.secondary }}
              />
              <input
                type="number"
                value={reviewData.paymentByUser}
                onChange={(e) =>
                  setReviewData({
                    ...reviewData,
                    paymentByUser: e.target.value,
                  })
                }
                className="w-full pl-10 pr-3 py-2 rounded-lg text-sm transition"
                style={{
                  borderWidth: "1px",
                  borderColor: "var(--color-border)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.success.DEFAULT;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.success.light}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-border)";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="Enter amount you paid"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              Enter the amount you paid for this service
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="flex-shrink-0 border-t p-4 flex gap-3 z-10"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            style={{
              borderWidth: "1px",
              borderColor: "var(--color-border)",
              color: colors.text.primary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background:
                colors.success.gradient ||
                `linear-gradient(to right, ${colors.success.DEFAULT}, ${colors.category.emerald})`,
            }}
          >
            {submitting ? (
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
  );
};

export default ReviewModal;
