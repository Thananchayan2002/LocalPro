import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Loader, AlertCircle, Check } from "lucide-react";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../../../animations/animations";

const LocationInput = ({
  locationInputRef,
  location,
  onChange,
  useCurrentLocation,
  setUseCurrentLocation,
  getCurrentLocation,
  locationLoading,
}) => {
  const { staggerContainer, staggerItem } = useAnimations();

  const [touched, setTouched] = useState(false);

  const hasError = touched && !location.address;
  const isValid = !!location.address;

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
        Service Location <span style={{ color: colors.error.DEFAULT }}>*</span>
      </motion.label>

      {/* ---------- Current Location ---------- */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setUseCurrentLocation(!useCurrentLocation);
            if (!useCurrentLocation) getCurrentLocation();
          }}
          className="
            inline-flex items-center gap-2
            rounded-xl
            px-4 py-2
            text-sm font-medium
            transition
            hover:opacity-90
            cursor-pointer
          "
          style={{
            backgroundColor: colors.primary.light,
            color: colors.primary.DEFAULT,
          }}
        >
          <Navigation className="w-4 h-4" />
          Use Current Location
        </button>

        {locationLoading && (
          <Loader
            className="w-5 h-5 animate-spin"
            style={{ color: colors.primary.DEFAULT }}
          />
        )}
      </motion.div>

      {/* ---------- Input ---------- */}
      <motion.div variants={staggerItem} className="relative">
        <MapPin
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: colors.text.secondary }}
        />

        <input
          ref={locationInputRef}
          type="text"
          name="location.address"
          value={location.address}
          onChange={(e) => {
            onChange(e);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          placeholder="Enter your service location"
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

        {/* Success / Error Icon */}
        {touched && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle size={18} style={{ color: colors.error.DEFAULT }} />
            ) : (
              <Check size={18} style={{ color: colors.success.DEFAULT }} />
            )}
          </span>
        )}
      </motion.div>

      {/* ---------- Inline Error ---------- */}
      {hasError && (
        <motion.p
          variants={staggerItem}
          className="text-xs font-medium"
          style={{ color: colors.error.DEFAULT }}
        >
          Please enter a valid service location.
        </motion.p>
      )}

      {/* ---------- Selected Location Preview ---------- */}
      {isValid && (
        <motion.div
          variants={staggerItem}
          className="rounded-xl px-4 py-3 border"
          style={{
            backgroundColor: colors.success.bg,
            borderColor: colors.success.DEFAULT,
          }}
        >
          <div className="flex items-start gap-2">
            <MapPin
              size={18}
              className="mt-0.5"
              style={{ color: colors.success.DEFAULT }}
            />
            <div>
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Selected Location
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                {location.address}
              </p>
              {location.lat && location.lng && (
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {location.lat.toFixed(6)},{" "}
                  {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LocationInput;
