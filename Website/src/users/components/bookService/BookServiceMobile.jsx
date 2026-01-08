import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { colors } from "../../../styles/colors";
import { useAnimations } from "../../../animations/animations";

import StepIndicator from "./bookingService/StepIndicator";
import AlertMessages from "./bookingService/AlertMessages";
import ServiceSelection from "./bookingService/ServiceSelection";
import BookingDetailsForm from "./bookingService/BookingDetailsForm";

const BookServiceMobile = ({
  isOpen,
  onClose,
  step,
  services,
  selectedService,
  loading,
  error,
  success,
  useCurrentLocation,
  setUseCurrentLocation,
  locationLoading,
  locationInputRef,
  formData,
  handleServiceSelect,
  handleNext,
  handleBack,
  handleSubmit,
  handleChange,
  getCurrentLocation,
  getMinDateTime,
  getMaxDateTime,
  calculateEndTime,
  resetForm,
}) => {
  if (!isOpen) return null;

  const { fadeInUp } = useAnimations();

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-white
      "
    >
      {/* Container */}
      <div
        className="
          relative
          flex h-full w-full flex-col
          sm:h-auto sm:max-h-[90vh]
          sm:max-w-4xl
          sm:rounded-2xl
          sm:shadow-2xl
          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            flex-shrink-0
            px-4 py-4 sm:px-6
            text-white
            flex flex-col gap-2
          "
          style={{ background: colors.primary.gradient }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold">Book a Service</h2>

            <button
              onClick={handleClose}
              className="
                rounded-full p-2
                transition
                hover:scale-105 active:scale-95
                focus:outline-none
                cursor-pointer
              "
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              aria-label="Close booking"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <StepIndicator currentStep={step} />
        </div>

        {/* Body */}
        <div
          className="
            flex-1
            overflow-y-auto
            px-4 py-5 sm:px-6
            space-y-6
          "
        >
          <AlertMessages error={error} success={success} />

          {step === 1 && (
            <ServiceSelection
              services={services}
              selectedService={selectedService}
              loading={loading}
              onServiceSelect={handleServiceSelect}
              onNext={handleNext}
            />
          )}

          {step === 2 && (
            <BookingDetailsForm
              selectedService={selectedService}
              formData={formData}
              loading={loading}
              locationInputRef={locationInputRef}
              useCurrentLocation={useCurrentLocation}
              setUseCurrentLocation={setUseCurrentLocation}
              getCurrentLocation={getCurrentLocation}
              locationLoading={locationLoading}
              handleChange={handleChange}
              handleBack={handleBack}
              handleSubmit={handleSubmit}
              getMinDateTime={getMinDateTime}
              getMaxDateTime={getMaxDateTime}
              calculateEndTime={calculateEndTime}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookServiceMobile;
