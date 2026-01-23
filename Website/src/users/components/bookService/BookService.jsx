import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Navigation,
  Loader,
  Check,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "../../../styles/colors";
import { getAllServices } from "../../api/service/service";
import { createBooking } from "../../api/booking/booking";
import AppLoader from "../common/AppLoader";

const BookService = ({
  isOpen,
  onClose,
  initialService = null,
  initialIssueName = "",
}) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [hoveredServiceId, setHoveredServiceId] = useState(null);

  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    service: "",
    issueType: "",
    description: "",
    scheduledTime: "",
    location: {
      address: "",
      city: "",
      district: "",
      area: "",
      lat: null,
      lng: null,
    },
  });

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]);

  // Initialize form with pre-filled service and issue data when modal opens
  useEffect(() => {
    if (isOpen && initialService && services.length > 0) {
      const matchedService = services.find((s) => s.service === initialService);
      if (matchedService) {
        setSelectedService(matchedService);
        setFormData((prev) => ({
          ...prev,
          service: matchedService.service,
          issueType: initialIssueName || "",
        }));
        // Auto-advance to step 2 if we have both service and issue
        setStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialService, initialIssueName, services]);

  // Hide header and mobile navbar, prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
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
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";

      // Show mobile navbar
      const mobileNavbar = document.querySelector(
        "nav[aria-label='Mobile navigation']"
      );
      if (mobileNavbar) {
        mobileNavbar.style.display = "";
      }
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";

      // Ensure mobile navbar is shown on cleanup
      const mobileNavbar = document.querySelector(
        "nav[aria-label='Mobile navigation']"
      );
      if (mobileNavbar) {
        mobileNavbar.style.display = "";
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
        return;
      }

      window.initGoogleMaps = () => {
        initializeAutocomplete();
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    if (isOpen && step === 2) {
      loadGoogleMapsScript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]);

  const initializeAutocomplete = () => {
    if (
      locationInputRef.current &&
      window.google &&
      window.google.maps.places
    ) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "lk" },
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          setError("Please select a valid location from the suggestions");
          return;
        }

        let city = "";
        let district = "";
        let area = "";

        if (place.address_components) {
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

        if (!city && !area) {
          const parts = place.formatted_address.split(",");
          area = parts[0]?.trim() || "";
          city = parts[parts.length - 2]?.trim() || "";
        }

        setFormData((prev) => ({
          ...prev,
          location: {
            address: place.formatted_address,
            city,
            district,
            area: area || city,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
        }));
        setError("");
      });

      autocompleteRef.current = autocomplete;
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getAllServices();
      setServices(data);
      setError("");
    } catch (err) {
      console.error("Fetch services error:", err);
      setError(err.message || "Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData((prev) => ({ ...prev, service: service.service }));
  };

  const handleNext = () => {
    if (!selectedService) {
      setError("Please select a service");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "location.address") {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, address: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK" && results[0]) {
              let city = "";
              let district = "";
              let area = "";

              if (results[0].address_components) {
                results[0].address_components.forEach((component) => {
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

              setFormData((prev) => ({
                ...prev,
                location: {
                  address: results[0].formatted_address,
                  city,
                  district,
                  area: area || city,
                  lat: latitude,
                  lng: longitude,
                },
              }));

              if (locationInputRef.current) {
                locationInputRef.current.value = results[0].formatted_address;
              }
              setError("");
            } else {
              setError("Failed to get address details");
            }
            setLocationLoading(false);
          });
        } catch (err) {
          setError("Failed to get address details");
          setLocationLoading(false);
        }
      },
      (error) => {
        setError("Unable to retrieve your location");
        setLocationLoading(false);
      }
    );
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    return tomorrow.toISOString().slice(0, 16);
  };

  const calculateEndTime = (startTime) => {
    if (!startTime) return "";
    const start = new Date(startTime);
    start.setHours(start.getHours() + 2);
    return start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.service ||
      !formData.issueType ||
      !formData.description ||
      !formData.scheduledTime
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      !formData.location.address ||
      !formData.location.lat ||
      !formData.location.lng
    ) {
      setError("Please set a valid location");
      return;
    }

    setLoading(true);

    try {
      const data = await createBooking({
        service: formData.service,
        issueType: formData.issueType,
        description: formData.description,
        scheduledTime: formData.scheduledTime,
        location: {
          address: formData.location.address,
          city: formData.location.city,
          district: formData.location.district,
          area: formData.location.area,
          lat: formData.location.lat,
          lng: formData.location.lng,
        },
      });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError(data.message || "Failed to create booking");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setFormData({
      service: "",
      issueType: "",
      description: "",
      scheduledTime: "",
      location: {
        address: "",
        city: "",
        district: "",
        area: "",
        lat: null,
        lng: null,
      },
    });
    setError("");
    setSuccess(false);
    setUseCurrentLocation(false);
    if (locationInputRef.current) {
      locationInputRef.current.value = "";
    }
  };

  // ----- UX Enhancements (no logic changes): Escape to close + scroll lock feel
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        resetForm();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stepLabel = useMemo(() => {
    return step === 1 ? "Select Service" : "Booking Details";
  }, [step]);

  const loaderTitle = step === 1 ? "Loading services" : "Creating booking";
  const loaderSubtitle =
    step === 1
      ? "Fetching available services"
      : "Submitting your booking request";

  if (!isOpen) return null;

  // Animations
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const sheet = {
    hidden: { opacity: 0, y: 28, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 26 },
    },
    exit: { opacity: 0, y: 22, scale: 0.99, transition: { duration: 0.18 } },
  };

  const card = {
    hidden: { opacity: 0, y: 12 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut", delay: i * 0.04 },
    }),
  };

  const palette = colors;

  return (
    <AnimatePresence>
      {loading && (
        <AppLoader title={loaderTitle} subtitle={loaderSubtitle} />
      )}
      <motion.div
        className="fixed inset-0 z-50"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Backdrop */}
        <motion.button
          type="button"
          aria-label="Close modal overlay"
          className="absolute inset-0 cursor-pointer backdrop-blur-[6px]"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
          onClick={() => {
            onClose();
            resetForm();
          }}
        />

        {/* Modal wrapper: FULLSCREEN on mobile, centered sheet on larger screens */}
        <div className="relative z-10 flex h-[100dvh] w-full items-stretch justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            variants={sheet}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Book a Service"
            className={[
              // Mobile = true fullscreen "app screen" without padding since navbar is hidden
              "relative flex h-[100dvh] w-full flex-col overflow-hidden rounded-none",
              // Tablet/Desktop = responsive sheet
              "sm:h-auto sm:max-h-[92vh] sm:w-full sm:max-w-4xl sm:rounded-3xl sm:pb-0",
              "shadow-[0_22px_60px_-28px_rgba(0,0,0,0.55)]",
            ].join(" ")}
            style={{
              backgroundColor: palette.background.primary,
              color: palette.text.primary,
              border: `1px solid ${palette.border.light}`,
            }}
          >
            {/* Header (fixed area) */}
            <div
              className="relative shrink-0 overflow-hidden px-5 py-2 sm:px-7 sm:py-2"
              style={{
                background: palette.primary.gradient,
                color: palette.text.inverse,
              }}
            >
              <div
                className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full blur-2xl"
                style={{
                  backgroundColor: palette.primary.light,
                  opacity: 0.35,
                }}
              />
              <div
                className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-2xl"
                style={{
                  backgroundColor: palette.secondary.light,
                  opacity: 0.25,
                }}
              />

              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-90 active:scale-95 cursor-pointer"
                aria-label="Close"
                type="button"
                style={{
                  backgroundColor: palette.primary.light,
                  color: palette.text.inverse,
                }}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pr-12">
                <h2
                  className="text-xl font-bold sm:text-2xl"
                  style={{ color: palette.text.inverse }}
                >
                  Book a Service
                </h2>
                <p
                  className="mt-1 text-sm"
                  style={{ color: palette.text.inverse, opacity: 0.8 }}
                >
                  {step === 1
                    ? "Pick a service to get started"
                    : "Fill your details and confirm"}
                </p>
              </div>

              {/* Stepper */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {[
                  { n: 1, label: "Select Service" },
                  { n: 2, label: "Booking Details" },
                ].map((s, i) => {
                  const active = step === s.n;
                  const done = step > s.n;
                  const circleStyle = active
                    ? {
                        backgroundColor: palette.background.primary,
                        color: palette.primary.DEFAULT,
                      }
                    : done
                    ? {
                        backgroundColor: palette.secondary.light,
                        color: palette.text.inverse,
                      }
                    : {
                        backgroundColor: palette.background.secondary,
                        color: palette.text.primary,
                        opacity: 0.9,
                      };
                  const labelStyle = active
                    ? { color: palette.text.inverse }
                    : { color: palette.text.inverse, opacity: 0.75 };
                  return (
                    <div key={s.n} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                          style={circleStyle}
                        >
                          {done ? <Check className="h-5 w-5" /> : s.n}
                        </div>
                        <span
                          className="text-sm font-semibold"
                          style={labelStyle}
                        >
                          {s.label}
                        </span>
                      </div>
                      {i === 0 && (
                        <ChevronRight
                          className="h-4 w-4"
                          style={{ color: palette.text.inverse, opacity: 0.7 }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Body (scrollable area) */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {/* Alerts */}
              <AnimatePresence>
                {!!error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 flex items-start gap-3 rounded-2xl border p-4"
                    role="status"
                    aria-live="polite"
                    style={{
                      borderColor: palette.error.light,
                      backgroundColor: palette.error.bg,
                    }}
                  >
                    <div
                      className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: palette.error.bg,
                        color: palette.error.DEFAULT,
                      }}
                    >
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: palette.error.light }}
                      >
                        Something needs attention
                      </p>
                      <p
                        className="mt-0.5 text-sm"
                        style={{ color: palette.error.DEFAULT }}
                      >
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 flex items-start gap-3 rounded-2xl border p-4"
                    role="status"
                    aria-live="polite"
                    style={{
                      borderColor: palette.success.light,
                      backgroundColor: palette.success.bg,
                    }}
                  >
                    <div
                      className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: palette.success.bg,
                        color: palette.success.DEFAULT,
                      }}
                    >
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: palette.success.light }}
                      >
                        Booking created
                      </p>
                      <p
                        className="mt-0.5 text-sm"
                        style={{ color: palette.success.DEFAULT }}
                      >
                        Booking created successfully!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{
                          color: palette.primary.dark || palette.text.primary,
                        }}
                      >
                        Choose a Service
                      </h3>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: palette.text.secondary }}
                      >
                        Select what you need — we’ll match you with a pro.
                      </p>
                    </div>
                    <div
                      className="hidden sm:block text-sm"
                      style={{ color: palette.text.secondary }}
                    >
                      Step{" "}
                      <span
                        className="font-semibold"
                        style={{ color: palette.primary.DEFAULT }}
                      >
                        1
                      </span>{" "}
                      / 2
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-14">
                      <div
                        className="flex items-center gap-3 rounded-2xl px-6 py-4 shadow-sm"
                        style={{
                          backgroundColor: palette.background.secondary,
                        }}
                      >
                        <Loader
                          className="h-5 w-5 animate-spin"
                          style={{ color: palette.primary.DEFAULT }}
                        />
                        <span
                          className="text-sm font-semibold"
                          style={{ color: palette.text.primary }}
                        >
                          Loading services…
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                      {services.map((service, idx) => {
                        const isSelected = selectedService?._id === service._id;
                        const isHovered = hoveredServiceId === service._id;

                        return (
                          <motion.button
                            key={service._id}
                            type="button"
                            variants={card}
                            initial="hidden"
                            animate="visible"
                            custom={idx}
                            onClick={() => handleServiceSelect(service)}
                            onMouseEnter={() =>
                              setHoveredServiceId(service._id)
                            }
                            onMouseLeave={() => setHoveredServiceId(null)}
                            className={[
                              "group relative w-full text-left",
                              "rounded-2xl border-2 p-4 sm:p-5",
                              "transition-all duration-200",
                              "cursor-pointer focus:outline-none focus-visible:ring-4",
                            ].join(" ")}
                            style={{
                              borderColor: isSelected
                                ? palette.primary.DEFAULT
                                : palette.border.light,
                              backgroundColor: isSelected
                                ? palette.primary.light
                                : palette.background.primary,
                              boxShadow: isSelected
                                ? `0 14px 34px -24px ${palette.primary.dark}`
                                : `0 8px 24px -20px ${palette.neutral[300]}`,
                              "--tw-ring-color": palette.primary.light,
                              "--tw-ring-offset-color":
                                palette.background.primary,
                            }}
                          >
                            {/* Glow */}
                            <div
                              className={[
                                "pointer-events-none absolute -inset-0.5 rounded-[18px] opacity-0 blur transition-opacity duration-300",
                                isSelected
                                  ? "opacity-100"
                                  : "group-hover:opacity-60",
                              ].join(" ")}
                              style={{ background: palette.primary.gradient }}
                            />

                            <div className="relative flex items-start gap-3">
                              <div className="relative">
                                <div
                                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                                  style={{
                                    background: palette.primary.gradient,
                                    color: palette.text.inverse,
                                    boxShadow: `0 12px 30px -18px ${palette.primary.dark}`,
                                  }}
                                >
                                  <Package className="h-6 w-6" />
                                </div>
                                {isSelected && (
                                  <div
                                    className="absolute -bottom-2 -right-2 rounded-full p-1 shadow"
                                    style={{
                                      backgroundColor:
                                        palette.background.primary,
                                    }}
                                  >
                                    <Check
                                      className="h-4 w-4"
                                      style={{ color: palette.primary.DEFAULT }}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4
                                  className="truncate text-base font-bold"
                                  style={{
                                    color:
                                      isHovered || isSelected
                                        ? palette.text.inverse
                                        : palette.text.primary,
                                  }}
                                >
                                  {service.service}
                                </h4>
                                <p
                                  className="mt-1 line-clamp-2 text-sm"
                                  style={{
                                    color:
                                      isHovered || isSelected
                                        ? palette.text.inverse
                                        : palette.text.secondary,
                                    opacity: isHovered || isSelected ? 0.9 : 1,
                                  }}
                                >
                                  {service.description}
                                </p>
                              </div>

                              <ChevronRight
                                className="mt-1 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                                style={{
                                  color: isSelected
                                    ? palette.primary.DEFAULT
                                    : palette.text.secondary,
                                }}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-end">
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={!selectedService}
                      whileHover={
                        !selectedService ? {} : { y: -1, scale: 1.01 }
                      }
                      whileTap={!selectedService ? {} : { scale: 0.98 }}
                      className={[
                        "inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold",
                        "shadow-lg transition-all hover:shadow-xl",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "cursor-pointer focus:outline-none focus-visible:ring-4",
                      ].join(" ")}
                      style={{
                        background: palette.primary.gradient,
                        color: palette.text.inverse,
                        boxShadow: `0 10px 24px -12px ${palette.primary.dark}`,
                        "--tw-ring-color": palette.primary.light,
                      }}
                    >
                      Next
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: colors.primary.light }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Selected Service:
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: colors.primary.dark }}
                    >
                      {selectedService?.service}
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      Issue Type <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="issueType"
                      value={formData.issueType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition"
                      style={{
                        borderColor: colors.border.light,
                        color: colors.text.primary,
                        outlineColor: colors.primary.DEFAULT,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary.DEFAULT;
                        e.target.style.boxShadow = `0 0 0 2px ${colors.primary.light}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border.light;
                        e.target.style.boxShadow = "none";
                      }}
                      placeholder="e.g., Fan not working"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      Description <span>*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition"
                      style={{
                        borderColor: colors.border.light,
                        color: colors.text.primary,
                        backgroundColor: colors.background.primary,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary.DEFAULT;
                        e.target.style.boxShadow = `0 0 0 2px ${colors.primary.light}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border.light;
                        e.target.style.boxShadow = "none";
                      }}
                      placeholder="Describe the issue in detail..."
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      Scheduled Service Time <span>*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            size={20}
                            style={{ color: colors.text.secondary }}
                          />
                          <input
                            type="datetime-local"
                            name="scheduledTime"
                            value={formData.scheduledTime}
                            onChange={handleChange}
                            min={getMinDateTime()}
                            max={getMaxDateTime()}
                            className="w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-2 transition"
                            style={{
                              borderColor: colors.border.light,
                              color: colors.text.primary,
                              backgroundColor: colors.background.primary,
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor =
                                colors.primary.DEFAULT;
                              e.target.style.boxShadow = `0 0 0 2px ${colors.primary.light}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = colors.border.light;
                              e.target.style.boxShadow = "none";
                            }}
                            required
                          />
                        </div>
                        <p
                          className="text-xs mt-2"
                          style={{ color: colors.text.tertiary }}
                        >
                          Available: Today or Tomorrow only
                        </p>
                      </div>
                      {formData.scheduledTime && (
                        <div
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{
                            backgroundColor: colors.background.secondary,
                          }}
                        >
                          <Clock
                            size={20}
                            style={{ color: colors.text.secondary }}
                          />
                          <div>
                            <p
                              className="text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              Estimated End Time
                            </p>
                            <p
                              className="font-semibold"
                              style={{ color: colors.text.primary }}
                            >
                              {calculateEndTime(formData.scheduledTime)}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: colors.text.tertiary }}
                            >
                              Duration: +2 hours
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      Service Location <span>*</span>
                    </label>

                    <div className="flex items-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setUseCurrentLocation(!useCurrentLocation);
                          if (!useCurrentLocation) {
                            getCurrentLocation();
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
                        style={{
                          backgroundColor: colors.primary.light,
                          color: colors.primary.dark,
                        }}
                        onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
                        onMouseLeave={(e) => (e.target.style.opacity = "1")}
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
                    </div>

                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={20}
                        style={{ color: colors.text.secondary }}
                      />
                      <input
                        ref={locationInputRef}
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-2 transition"
                        style={{
                          borderColor: colors.border.light,
                          color: colors.text.primary,
                          backgroundColor: colors.background.primary,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = colors.primary.DEFAULT;
                          e.target.style.boxShadow = `0 0 0 2px ${colors.primary.light}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = colors.border.light;
                          e.target.style.boxShadow = "none";
                        }}
                        placeholder="Enter your service location"
                        required
                      />
                    </div>

                    {formData.location.address && (
                      <div
                        className="mt-3 p-3 rounded-lg border"
                        style={{
                          backgroundColor: colors.success.bg,
                          borderColor: colors.success.light,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin
                            className="flex-shrink-0 mt-0.5"
                            size={18}
                            style={{ color: colors.success.DEFAULT }}
                          />
                          <div>
                            <p
                              className="text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              Selected Location:
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: colors.text.primary }}
                            >
                              {formData.location.address}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: colors.text.tertiary }}
                            >
                              Coordinates: {formData.location.lat?.toFixed(6)},{" "}
                              {formData.location.lng?.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 border-2 rounded-xl font-semibold transition"
                      style={{
                        borderColor: colors.border.dark,
                        color: colors.text.primary,
                        backgroundColor: colors.background.primary,
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor =
                          colors.background.secondary)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor =
                          colors.background.primary)
                      }
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                      style={{
                        background: colors.primary.gradient,
                        color: colors.text.inverse,
                        opacity: loading ? 0.5 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) =>
                        !loading &&
                        (e.target.style.boxShadow =
                          "0 10px 25px rgba(0,0,0,0.2)")
                      }
                      onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Creating Booking...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer (fixed area) */}
            <div
              className="hidden sm:block shrink-0 border-t px-5 py-4 sm:px-7"
              style={{
                borderColor: palette.border.light,
                backgroundColor: palette.background.primary,
              }}
            >
              <p
                className="text-center text-xs"
                style={{ color: palette.text.secondary }}
              >
                Tip: Press{" "}
                <span
                  className="font-semibold"
                  style={{ color: palette.text.primary }}
                >
                  Esc
                </span>{" "}
                to close • Current step:{" "}
                <span
                  className="font-semibold"
                  style={{ color: palette.text.primary }}
                >
                  {stepLabel}
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookService;
