import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../../../animations/animations";
import ScheduleInput from "./ScheduleInput";
import LocationInput from "./LocationInput";

/* ------------------ Utils ------------------ */
const STORAGE_KEY = "booking_draft_v4";
const DEBOUNCE_MS = 400;

const validateRequired = (value) =>
  value?.trim() ? "" : "This field is required";

/* ------------------ Step animation variants ------------------ */
const stepCircleVariants = {
  inactive: {
    scale: 1,
    opacity: 0.6,
  },
  active: {
    scale: 1.05,
    opacity: 1,
    transition: { duration: 0.25 },
  },
  completed: {
    scale: [1, 1.15, 1],
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

/* ------------------ Component ------------------ */
const BookingDetailsForm = ({
  selectedService,
  formData,
  loading,
  locationInputRef,
  useCurrentLocation,
  setUseCurrentLocation,
  getCurrentLocation,
  locationLoading,
  handleChange,
  handleBack,
  handleSubmit,
  getMinDateTime,
  getMaxDateTime,
  calculateEndTime,
}) => {
  const { staggerContainer, staggerItem } = useAnimations();

  /* ------------------ State ------------------ */
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState({});
  const [isConfirming, setIsConfirming] = useState(false);
  const debounceRef = useRef({});

  /* ------------------ Auto-save draft ------------------ */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    Object.entries(parsed).forEach(([name, value]) =>
      handleChange({ target: { name, value } })
    );
  }, []);

  /* ------------------ Validate pre-filled fields from props ------------------ */
  useEffect(() => {
    // Validate issueType and description when they're populated from external sources
    if (formData.issueType) {
      const error = validateRequired(formData.issueType);
      setErrors((p) => ({ ...p, issueType: error }));
      setValid((p) => ({ ...p, issueType: !error }));
    }

    if (formData.description) {
      const error = validateRequired(formData.description);
      setErrors((p) => ({ ...p, description: error }));
      setValid((p) => ({ ...p, description: !error }));
    }
  }, [formData.issueType, formData.description]);

  /* ------------------ Debounced validation ------------------ */
  const runValidation = (name, value) => {
    clearTimeout(debounceRef.current[name]);
    debounceRef.current[name] = setTimeout(() => {
      const error = validateRequired(value);
      setErrors((p) => ({ ...p, [name]: error }));
      setValid((p) => ({ ...p, [name]: !error }));
    }, DEBOUNCE_MS);
  };

  const onFieldChange = (e) => {
    handleChange(e);
    runValidation(e.target.name, e.target.value);
  };

  /* ------------------ Step guards ------------------ */
  const canProceed = {
    1: valid.issueType && valid.description,
    2: Boolean(formData.scheduledTime),
    3: Boolean(formData.location),
    4: true,
  };

  const nextStep = () => {
    if (canProceed[step] && step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitForm = (e) => {
    e.preventDefault();

    // Only allow submission on step 4 (Confirm step) and only when explicitly confirming
    if (step !== 4 || !isConfirming) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    handleSubmit(e);
    setIsConfirming(false);
  };

  /* ------------------ UI ------------------ */
  return (
    <motion.form
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      onSubmit={submitForm}
      className="space-y-6"
    >
      {/* ---------- Step Indicator ---------- */}
      <motion.div
        variants={staggerItem}
        className="flex justify-between text-xs font-semibold"
        style={{ color: colors.text.secondary }}
      >
        {["Details", "Schedule", "Location", "Confirm"].map((label, i) => {
          const index = i + 1;
          const state =
            step > index ? "completed" : step === index ? "active" : "inactive";

          return (
            <button
              key={label}
              type="button"
              onClick={() => step > index && setStep(index)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <motion.span
                variants={stepCircleVariants}
                animate={state}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    state !== "inactive"
                      ? colors.primary.DEFAULT
                      : colors.neutral[200],
                  color: state !== "inactive" ? "white" : colors.text.secondary,
                }}
              >
                <AnimatePresence mode="wait">
                  {state === "completed" ? (
                    <motion.span
                      key="check"
                      variants={checkmarkVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Check size={14} />
                    </motion.span>
                  ) : (
                    <span key="num">{index}</span>
                  )}
                </AnimatePresence>
              </motion.span>

              <span className="hidden sm:block">{label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* ---------- STEP CONTENT ---------- */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={staggerItem}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: colors.primary.light }}
            >
              <p className="text-xs" style={{ color: colors.text.secondary }}>
                Selected Service
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.primary.dark }}
              >
                {selectedService?.service}
              </p>
            </div>

            {/* Issue Type */}
            <div className="space-y-1">
              <label className="text-sm font-semibold">Issue Type *</label>
              <div className="relative">
                <input
                  name="issueType"
                  value={formData.issueType}
                  onChange={onFieldChange}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  className="w-full px-4 py-3 rounded-xl border-2"
                  style={{ borderColor: "var(--color-border)" }}
                />
                {valid.issueType && (
                  <Check
                    size={16}
                    className="absolute right-3 top-3.5"
                    style={{ color: colors.success.DEFAULT }}
                  />
                )}
              </div>
              {errors.issueType && (
                <p className="text-xs flex gap-1">
                  <AlertCircle
                    size={14}
                    style={{ color: colors.error.DEFAULT }}
                  />
                  <span style={{ color: colors.error.DEFAULT }}>
                    {errors.issueType}
                  </span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-semibold">Description *</label>
              <div className="relative">
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={onFieldChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 resize-none"
                  style={{ borderColor: "var(--color-border)" }}
                />
                {valid.description && (
                  <Check
                    size={16}
                    className="absolute right-3 top-3.5"
                    style={{ color: colors.success.DEFAULT }}
                  />
                )}
              </div>
              {errors.description && (
                <p className="text-xs flex gap-1">
                  <AlertCircle
                    size={14}
                    style={{ color: colors.error.DEFAULT }}
                  />
                  <span style={{ color: colors.error.DEFAULT }}>
                    {errors.description}
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <ScheduleInput
              scheduledTime={formData.scheduledTime}
              onChange={handleChange}
              getMinDateTime={getMinDateTime}
              getMaxDateTime={getMaxDateTime}
              calculateEndTime={calculateEndTime}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <LocationInput
              locationInputRef={locationInputRef}
              location={formData.location}
              onChange={handleChange}
              useCurrentLocation={useCurrentLocation}
              setUseCurrentLocation={setUseCurrentLocation}
              getCurrentLocation={getCurrentLocation}
              locationLoading={locationLoading}
            />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Review your details and confirm your booking.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Navigation ---------- */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between gap-2"
      >
        <button
          type="button"
          onClick={step === 1 ? handleBack : prevStep}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold cursor-pointer"
          style={{
            border: "2px solid var(--color-border)",
            color: colors.text.primary,
          }}
        >
          <ArrowLeft size={16} />
          {step === 1 ? "Back" : "Previous"}
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed[step]}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 cursor-pointer"
            style={{ background: colors.primary.gradient }}
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            onClick={() => setIsConfirming(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 cursor-pointer"
            style={{ background: colors.primary.gradient }}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirm Booking
              </>
            )}
          </button>
        )}
      </motion.div>
    </motion.form>
  );
};

export default BookingDetailsForm;
