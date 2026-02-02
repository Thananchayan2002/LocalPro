import React from "react";
import {
  Star,
  X,
  Shield,
  MapPin,
  Award,
  MessageSquare,
  ChevronRight,
  Loader,
  Briefcase,
  Calendar,
  User,
} from "lucide-react";
import { getProfessionalImageUrl } from "../../api/professional/professional";
import { useEffect } from "react";

export const ProfessionalModal = ({
  selectedProfessional,
  isOpen,
  closeModal,
  reviews,
  loadingReviews,
  showReviews,
  setShowReviews,
}) => {
  // Hook must be called before early return
  useEffect(() => {
    if (selectedProfessional) {
      document.body.classList.add("modal-open");
      // Prevent body scroll on mobile to avoid double scrollbars
      document.body.style.overflow = "hidden";

      // Hide mobile navbar
      const mobileNavbar = document.querySelector(
        "nav[aria-label='Mobile navigation']"
      );
      if (mobileNavbar) {
        mobileNavbar.style.display = "none";
      }

      return () => {
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "auto";

        // Show mobile navbar
        const mobileNavbar = document.querySelector(
          "nav[aria-label='Mobile navigation']"
        );
        if (mobileNavbar) {
          mobileNavbar.style.display = "";
        }
      };
    }
  }, [selectedProfessional]);

  if (!selectedProfessional) return null;

  // Scroll handling for modal
  const handleContentScroll = (e) => {
    const modalContent = e.currentTarget;
    const isScrolling = modalContent.scrollTop > 0;
    // You could add shadow/effect based on scroll if needed
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      {/* Backdrop with smooth transition */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />

      {/* Modal Container */}
      <div
        className="relative w-full sm:max-w-4xl h-[95vh] sm:h-[90vh] bg-white dark:bg-gray-900 shadow-2xl 
                   transform transition-all duration-300 ease-out
                   rounded-t-2xl sm:rounded-2xl overflow-hidden
                   border border-gray-200 dark:border-gray-800"
        style={{
          maxHeight: "calc(100vh - 2rem)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Grabber for Mobile */}
        <div className="sm:hidden pt-4 pb-2 flex items-center justify-center sticky top-0 z-20 bg-white dark:bg-gray-900">
          <div className="h-1.5 w-16 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Header - Sticky */}
        <div
          className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 
                     px-5 sm:px-6 py-4 flex items-start justify-between gap-4
                     backdrop-blur-sm bg-white/95 dark:bg-gray-900/95"
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {selectedProfessional.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                {selectedProfessional.serviceId?.service || "Professional"}
              </p>
              {selectedProfessional.status === "accepted" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <Shield className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
          <button
            onClick={closeModal}
            className="cursor-pointer flex-shrink-0 rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 
                       transition-colors duration-200 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div
          className="h-[calc(100%-4rem)] overflow-y-auto"
          onScroll={handleContentScroll}
        >
          <div className="px-5 sm:px-6 py-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Profile & Quick Info */}
              <div className="lg:col-span-4 space-y-6">
                {/* Profile Image Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={
                          getProfessionalImageUrl(
                            selectedProfessional.profileImage,
                          ) ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${selectedProfessional.name}`
                        }
                        alt={selectedProfessional.name}
                        className="h-44 w-44 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                      />
                      {selectedProfessional.isAvailable && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-md">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            Available
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="mt-6 w-full space-y-3">
                      {selectedProfessional.status === "accepted" && (
                        <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                            Verified Professional
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                          <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Rating
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {selectedProfessional.rating || 4.0}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < Math.floor(selectedProfessional.rating || 4)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300 dark:text-gray-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Experience
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {selectedProfessional.experience} years
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Jobs Completed
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {selectedProfessional.totalJobs || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Reviews */}
              <div className="lg:col-span-8 space-y-6">
                {/* Location & District Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Location
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {selectedProfessional.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          District
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedProfessional.district}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Service Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Service Type
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {selectedProfessional.serviceId?.service || "N/A"}
                        </p>
                      </div>
                    </div>

                    {selectedProfessional.serviceId?.description && (
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Description
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                            {selectedProfessional.serviceId.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedProfessional.nicNumber && (
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Verified ID
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            NIC: {selectedProfessional.nicNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Customer Reviews
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {reviews.length > 0 && (
                      <button
                        onClick={() => setShowReviews(!showReviews)}
                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium 
                                 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                 transition-colors duration-200"
                      >
                        {showReviews ? "Show Less" : "Show All"}
                        <ChevronRight
                          className={`h-4 w-4 transition-transform duration-200 ${
                            showReviews ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {loadingReviews ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Loader className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Loading reviews...
                      </p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        No reviews yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Be the first to review this professional
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(showReviews ? reviews : reviews.slice(0, 2)).map(
                        (review) => (
                          <div
                            key={review._id}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                                     transition-colors duration-200"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 
                                                dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {review.customerId?.name || "Anonymous Customer"}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {review.bookingId?.service || "Service"} •{" "}
                                      {review.createdAt
                                        ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })
                                        : "Recent"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300 dark:text-gray-700"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-13">
                              "{review.comment}"
                            </p>
                          </div>
                        ),
                      )}
                      {!showReviews && reviews.length > 2 && (
                        <div className="text-center pt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{reviews.length - 2} more reviews
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Padding for Mobile */}
            <div className="h-8 sm:h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};