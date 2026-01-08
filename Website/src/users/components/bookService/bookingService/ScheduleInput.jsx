import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, AlertCircle, Check } from "lucide-react";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../../../animations/animations";

const ScheduleInput = ({
  scheduledTime,
  onChange,
  getMinDateTime,
  getMaxDateTime,
  calculateEndTime,
}) => {
  const { staggerContainer, staggerItem } = useAnimations();
  const [touched, setTouched] = useState(false);

  const min = getMinDateTime();
  const max = getMaxDateTime();

  const isEmpty = !scheduledTime;
  const isOutOfRange =
    scheduledTime && (scheduledTime < min || scheduledTime > max);

  const hasError = touched && (isEmpty || isOutOfRange);
  const isValid = touched && !hasError;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* ---------- Label ---------- */}
      <motion.label
        variants={staggerItem}
        className="block text-sm font-semibold"
        style={{ color: colors.text.primary }}
      >
        Scheduled Service Time{" "}
        <span style={{ color: colors.error.DEFAULT }}>*</span>
      </motion.label>

      {/* ---------- Input + End Time ---------- */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* DateTime Input */}
        <div className="space-y-2">
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.text.secondary }}
            />

            <input
              type="datetime-local"
              name="scheduledTime"
              value={scheduledTime}
              min={min}
              max={max}
              required
              onChange={(e) => {
                onChange(e);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              className="
                w-full
                rounded-xl
                pl-11 pr-10 py-3
                text-sm
                transition
                focus:outline-none
              "
              style={{
                borderWidth: "2px",
                borderColor: hasError
                  ? colors.error.DEFAULT
                  : isValid
                  ? colors.success.DEFAULT
                  : "var(--color-border)",
                backgroundColor: colors.background.primary,
              }}
            />

            {/* Validation Icon */}
            {touched && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {hasError ? (
                  <AlertCircle
                    size={18}
                    style={{ color: colors.error.DEFAULT }}
                  />
                ) : (
                  <Check size={18} style={{ color: colors.success.DEFAULT }} />
                )}
              </span>
            )}
          </div>

          {/* Helper / Error Text */}
          {!hasError && (
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              Available: Today or Tomorrow only
            </p>
          )}

          {hasError && (
            <p
              className="text-xs font-medium"
              style={{ color: colors.error.DEFAULT }}
            >
              Please select a valid time within the allowed range.
            </p>
          )}
        </div>

        {/* Estimated End Time */}
        {scheduledTime && !hasError && (
          <motion.div
            variants={staggerItem}
            className="
              flex items-center gap-3
              rounded-xl
              px-4 py-3
            "
            style={{
              backgroundColor: colors.background.secondary,
            }}
          >
            <Clock size={18} style={{ color: colors.text.secondary }} />
            <div className="space-y-0.5">
              <p className="text-xs" style={{ color: colors.text.secondary }}>
                Estimated End Time
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                {calculateEndTime(scheduledTime)}
              </p>
              <p className="text-xs" style={{ color: colors.text.secondary }}>
                Duration: +2 hours
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ScheduleInput;
