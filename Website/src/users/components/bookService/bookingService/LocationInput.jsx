import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const autocompleteRef = useRef(null);
  const initializationAttemptedRef = useRef(false);

  const hasError = touched && !location.address;
  const isValid = !!location.address;

  // Load Google Maps script if not already loaded
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      return; // Already loaded
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script if needed
    };
  }, []);

  // Initialize Google Maps Autocomplete - only once when ready
  useEffect(() => {
    // Only initialize once
    if (initializationAttemptedRef.current) {
      return;
    }

    if (
      !locationInputRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    ) {
      // Google Maps not ready yet, try again in a moment
      const timer = setTimeout(() => {
        initializationAttemptedRef.current = false; // Reset to retry
      }, 500);
      return () => clearTimeout(timer);
    }

    initializationAttemptedRef.current = true;

    try {
      // Clear any previous listeners on the input element
      const inputElement = locationInputRef.current;
      if (inputElement) {
        // Clear all Google Maps event listeners from this element
        window.google.maps.event.clearInstanceListeners(inputElement);
      }

      // Create autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputElement,
        {
          types: ["geocode"],
          componentRestrictions: { country: "lk" },
          fields: [
            "address_components",
            "formatted_address",
            "geometry",
            "name",
          ],
        }
      );

      // Create stable place_changed handler
      const handlePlaceChanged = () => {
        const place = autocomplete.getPlace();

        if (!place || !place.geometry) {
          console.warn("Invalid place selected");
          return;
        }

        // Extract location components
        let city = "";
        let district = "";
        let area = "";

        if (place.address_components && place.address_components.length > 0) {
          place.address_components.forEach((component) => {
            const types = component.types;

            if (types.includes("locality")) {
              city = component.long_name;
            } else if (types.includes("administrative_area_level_2")) {
              district = component.long_name;
            } else if (
              types.includes("administrative_area_level_1") &&
              !district
            ) {
              district = component.long_name;
            } else if (
              types.includes("sublocality") ||
              types.includes("neighborhood")
            ) {
              area = component.long_name;
            }
          });
        }

        // Fallback extraction
        if (!city && !area) {
          const parts = place.formatted_address.split(",");
          area = parts[0]?.trim() || "";
          city = parts[parts.length - 2]?.trim() || "";
        }

        // Update location via onChange
        onChange({
          target: {
            name: "location",
            value: {
              address: place.formatted_address,
              city: city,
              district: district,
              area: area || city,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          },
        });

        setTouched(true);
      };

      // Add listener to autocomplete
      autocomplete.addListener("place_changed", handlePlaceChanged);

      // Store reference for cleanup
      autocompleteRef.current = autocomplete;

      console.log("Autocomplete initialized successfully");
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      initializationAttemptedRef.current = false; // Allow retry on error
    }

    // Cleanup function
    return () => {
      if (autocompleteRef.current && locationInputRef.current) {
        window.google.maps.event.clearInstanceListeners(
          locationInputRef.current
        );
      }
    };
  }, []); // Empty dependency array - only run once

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
      <motion.div
        variants={staggerItem}
        className="relative z-10 location-input-wrapper"
      >
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
            relative
            z-20
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
          autoComplete="off"
        />

        {/* Success / Error Icon */}
        {touched && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
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
