import React, { useEffect, useState, useRef } from "react";
import { colors } from "../../../styles/colors";
import {
  Upload,
  Phone,
  MapPin,
  Briefcase,
  IdCard,
  Mail,
  Image,
  Loader,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllServices } from "../../api/service/service";
import { registerProfessional } from "../../api/professional/professional";
import { useAuth } from "../../../worker/context/AuthContext";
import AppLoader from "../common/AppLoader";

const SRI_LANKAN_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  serviceId: "",
  experience: "",
  district: "",
  location: "",
  lat: null,
  lng: null,
  nicNumber: "",
};

const RegisterProfessional = ({ isOpen, onClose }) => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [servicesLoading, setServicesLoading] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const { user, loading: authLoading } = useAuth();

  const showAppLoader =
    authLoading || (servicesLoading && services.length === 0);
  const loaderTitle = authLoading ? "Loading profile" : "Loading services";
  const loaderSubtitle = authLoading
    ? "Preparing your registration form"
    : "Fetching available services";

  // Animations
  const ease = [0.22, 1, 0.36, 1];
  const overlayMotion = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.25, ease } },
    exit: { opacity: 0, transition: { duration: 0.2, ease } },
  };
  const sheetMotion = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease },
    },
    exit: {
      opacity: 0,
      y: 18,
      scale: 0.99,
      transition: { duration: 0.2, ease },
    },
  };
  const contentMotion = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
  };

  // Pre-fill form with logged-in user data (support both `phone` and `phoneNumber`)
  useEffect(() => {
    if (authLoading) return;
    const storedUserPhone =
      typeof window !== "undefined" ? localStorage.getItem("userPhone") : null;
    const userData = user || {};
    const phoneValue =
      userData.phone || userData.phoneNumber || storedUserPhone || "";
    setForm((prevForm) => ({
      ...prevForm,
      name: userData.name || "",
      email: userData.email || "",
      phone: phoneValue,
      location: userData.location || "",
    }));
  }, [authLoading, user]);

  // Load Google Maps script (robust loader with onload/onerror to avoid callback collisions)
  useEffect(() => {
    let script = null;
    let mounted = true;

    const loadGoogleMapsScript = () => {
      // Already available
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
        return Promise.resolve();
      }

      // If a script already exists, wait for it to load
      const existing = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      );
      if (existing) {
        return new Promise((resolve, reject) => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places
          ) {
            initializeAutocomplete();
            resolve();
            return;
          }

          existing.addEventListener("load", () => {
            if (!mounted) return;
            if (
              window.google &&
              window.google.maps &&
              window.google.maps.places
            ) {
              initializeAutocomplete();
              resolve();
            } else {
              setMessage({
                type: "error",
                text: "Google Maps loaded but Places API not available. Check API key and enabled services.",
              });
              reject(new Error("Places API not available"));
            }
          });

          existing.addEventListener("error", () => {
            if (!mounted) return;
            setMessage({
              type: "error",
              text: "Failed to load Google Maps. Please check API key and network.",
            });
            reject(new Error("Google Maps load error"));
          });
        });
      }

      // Create and append script
      return new Promise((resolve, reject) => {
        script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (!mounted) return;
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places
          ) {
            initializeAutocomplete();
            resolve();
          } else {
            setMessage({
              type: "error",
              text: "Google Maps loaded but Places API not available. Check API key and enabled services.",
            });
            reject(new Error("Places API not available"));
          }
        };
        script.onerror = () => {
          if (!mounted) return;
          setMessage({
            type: "error",
            text: "Failed to load Google Maps. Please check API key and network.",
          });
          reject(new Error("Google Maps load error"));
        };

        document.head.appendChild(script);
      });
    };

    // Only load when modal is open OR when component is rendered as page (isOpen undefined)
    if (isOpen === undefined || isOpen) {
      loadGoogleMapsScript().catch(() => {
        /* Error already handled via setMessage */
      });

      // If script was already loaded earlier but initialize ran before the input existed, try init again
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
      }
    }

    return () => {
      mounted = false;
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [isOpen]);

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
        },
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          setMessage({
            type: "error",
            text: "Please select a valid location from the suggestions",
          });
          return;
        }

        let city = "";
        let district = "";

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
            }
          });
        }

        setForm((prev) => ({
          ...prev,
          location: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          district: district || prev.district,
        }));
      });

      autocompleteRef.current = autocomplete;
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const data = await getAllServices();
        setServices(data);
        setMessage({ type: "", text: "" });
      } catch (err) {
        setMessage({
          type: "error",
          text: err.message || "Unable to load services. Please try again.",
        });
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Only JPEG and PNG images are allowed.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should not exceed 5MB." });
      e.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value),
      );
      formData.append("way", "website");
      formData.append("status", "pending");
      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const data = await registerProfessional(formData);

      if (data.success) {
        setMessage({
          type: "success",
          text: "Thanks! Your profile is submitted. We will review and get back to you.",
        });
        setForm(initialForm);
        setImageFile(null);
        setImagePreview(null);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Submission failed. Please try again.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const disabledSubmit = submitting || servicesLoading;

  // Hide header when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // If not in modal mode (no isOpen prop), render normally
  if (isOpen === undefined) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 via-white to-purple-50">
        {showAppLoader && (
          <AppLoader title={loaderTitle} subtitle={loaderSubtitle} />
        )}

        <motion.div
          variants={contentMotion}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8"
        >
          {renderContent()}
        </motion.div>
      </div>
    );
  }

  // Modal mode
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        variants={overlayMotion}
        initial="hidden"
        animate="show"
        exit="exit"
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: "rgba(2, 6, 23, 0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        {showAppLoader && (
          <AppLoader title={loaderTitle} subtitle={loaderSubtitle} />
        )}

        <motion.div
          key="sheet"
          variants={sheetMotion}
          initial="hidden"
          animate="show"
          exit="exit"
          className="w-full h-full sm:max-w-4xl sm:mx-6 sm:rounded-3xl sm:max-h-[calc(100vh-3rem)] overflow-y-auto mx-0 rounded-none max-w-none"
          style={{
            background: colors.neutral[50],
            borderRadius: window.innerWidth < 640 ? "0" : "1.5rem",
            boxShadow:
              window.innerWidth < 640
                ? "none"
                : "0 18px 48px 0 " + colors.primary.light + "33",
            height: window.innerWidth < 640 ? "100vh" : undefined,
          }}
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  function Field({ label, required, rightIcon, children, helper }) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            {label} {required ? <span className="text-gray-500">*</span> : null}
          </label>
          {helper ? (
            <span className="text-xs text-gray-500">{helper}</span>
          ) : null}
        </div>

        <div className="relative">
          {children}
          {rightIcon ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  function inputBaseClass(disabled = false) {
    return [
      "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm",
      "outline-none transition-all duration-200",
      "focus:border-transparent focus:ring-2 focus:ring-blue-500/40",
      "placeholder:text-gray-400",
      disabled ? "cursor-not-allowed opacity-70" : "cursor-text",
    ].join(" ");
  }

  function selectBaseClass(disabled = false) {
    return [
      "w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm",
      "outline-none transition-all duration-200",
      "focus:border-transparent focus:ring-2 focus:ring-blue-500/40",
      disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
    ].join(" ");
  }

  function renderContent() {
    return (
      <div
        className={[
          "relative w-full",
          isOpen ? "p-5 sm:p-8 md:p-10" : "p-5 sm:p-8 md:p-10",
        ].join(" ")}
        style={
          !isOpen
            ? {
                background: colors.neutral[50],
                borderRadius: "1.5rem",
                boxShadow: "0 4px 24px 0 " + colors.primary.light + "22",
                border: `1px solid ${colors.primary.light}99`,
              }
            : undefined
        }
      >
        {/* Top bar / Header */}
        {!isOpen && (
          <motion.div
            variants={contentMotion}
            initial="hidden"
            animate="show"
            className="mb-6 flex flex-col gap-4 sm:mb-8 sm:gap-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold tracking-[0.18em] sm:text-sm"
                  style={{
                    color: colors.primary.DEFAULT,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  Join Our Network
                </p>

                <h1
                  className="text-2xl font-bold leading-tight sm:text-3xl"
                  style={{ color: colors.neutral[700] }}
                >
                  Register as a Professional
                </h1>

                <p
                  className="max-w-2xl text-sm leading-relaxed sm:text-[15px]"
                  style={{ color: colors.neutral[500] }}
                >
                  Provide your details. We keep your status pending and review
                  website submissions before approval.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold shadow-sm"
                style={{
                  background: colors.primary.light,
                  color: colors.primary.DEFAULT,
                  border: `1px solid ${colors.primary.light}`,
                }}
              >
                <Image size={18} />
                <span>Profile review required</span>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </motion.div>
        )}

        {isOpen && (
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <div className="space-y-1">
              <h2
                className="text-xl font-bold sm:text-2xl"
                style={{ color: colors.neutral[700] }}
              >
                Register as Professional
              </h2>
              <p
                className="text-xs sm:text-sm"
                style={{ color: colors.neutral[500] }}
              >
                Submit your profile for review and approval.
              </p>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="group inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100 active:scale-95 cursor-pointer"
              style={{}}
            >
              <X
                className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90"
                style={{ color: colors.neutral[500] }}
              />
            </button>
          </div>
        )}

        {/* Message */}
        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div
              key={message.type + message.text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22, ease }}
              className="mb-5 rounded-2xl border px-4 py-3 text-sm shadow-sm sm:mb-6"
              style={
                message.type === "success"
                  ? {
                      background: colors.success.bg,
                      border: `1px solid ${colors.success.DEFAULT}`,
                      color: colors.success.DEFAULT,
                    }
                  : {
                      background: colors.error.bg,
                      border: `1px solid ${colors.error.DEFAULT}`,
                      color: colors.error.DEFAULT,
                    }
              }
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl bg-white/60 p-4 shadow-[0_1px_0_0_rgba(17,24,39,0.03)] ring-1 ring-gray-200/70 backdrop-blur sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              <Field label="Full Name" required rightIcon={<Phone size={18} />}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputBaseClass(false)}
                  required
                />
              </Field>

              <Field label="Email (optional)" rightIcon={<Mail size={18} />}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputBaseClass(false)}
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Phone" required rightIcon={<Phone size={18} />}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputBaseClass(true)}
                  required
                  readOnly
                />
              </Field>

              <Field
                label="Service"
                required
                helper={servicesLoading ? "Loading..." : undefined}
              >
                <div className="relative">
                  <select
                    value={form.serviceId}
                    onChange={(e) =>
                      setForm({ ...form, serviceId: e.target.value })
                    }
                    className={selectBaseClass(
                      servicesLoading || services.length === 0,
                    )}
                    required
                    disabled={servicesLoading || services.length === 0}
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.service}
                      </option>
                    ))}
                  </select>

                  {/* Custom chevron (pure CSS triangle via Tailwind) */}
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 10l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                {!servicesLoading && services.length === 0 && (
                  <p
                    className="mt-2 text-xs"
                    style={{ color: colors.error.DEFAULT }}
                  >
                    Services not available right now.
                  </p>
                )}
              </Field>

              <Field
                label="Experience (years)"
                required
                rightIcon={<Briefcase size={18} />}
              >
                <input
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                  className={inputBaseClass(false)}
                  required
                />
              </Field>

              <Field label="District" required>
                <div className="relative">
                  <select
                    value={form.district}
                    onChange={(e) =>
                      setForm({ ...form, district: e.target.value })
                    }
                    className={selectBaseClass(false)}
                    required
                  >
                    <option value="">Select District</option>
                    {SRI_LANKAN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 10l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Field>

              <div className="md:col-span-2">
                <Field
                  label="Location"
                  required
                  helper="Select from Google suggestions"
                  rightIcon={<MapPin size={18} />}
                >
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className={inputBaseClass(false)}
                    placeholder="Start typing to search location..."
                    required
                  />
                </Field>

                <div className="mt-2">
                  <AnimatePresence mode="wait">
                    {form.lat && form.lng ? (
                      <motion.p
                        key="coords"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease }}
                        className="text-xs font-medium"
                        style={{ color: colors.success.DEFAULT }}
                      >
                        ✓ Location coordinates captured
                      </motion.p>
                    ) : (
                      <motion.p
                        key="hint"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease }}
                        className="text-xs"
                        style={{ color: colors.neutral[500] }}
                      >
                        Please select from Google suggestions to capture exact
                        location
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <Field
                label="NIC Number"
                required
                rightIcon={<IdCard size={18} />}
              >
                <input
                  type="text"
                  value={form.nicNumber}
                  onChange={(e) =>
                    setForm({ ...form, nicNumber: e.target.value })
                  }
                  className={inputBaseClass(false)}
                  required
                />
              </Field>
            </div>
          </div>

          {/* Profile Image */}
          <div className="rounded-3xl bg-white/60 p-4 ring-1 ring-gray-200/70 backdrop-blur sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800">
                  Profile Image (optional)
                </p>
                <p className="text-xs" style={{ color: colors.neutral[500] }}>
                  JPEG/PNG up to 5MB.
                </p>
              </div>

              {imagePreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, ease }}
                  className="relative"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-2xl object-cover shadow-sm sm:h-20 sm:w-20"
                    style={{ border: `2px solid ${colors.neutral[100]}` }}
                  />
                  <span className="absolute -bottom-2 -right-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200">
                    <Image className="h-4 w-4 text-gray-600" />
                  </span>
                </motion.div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label
                className="group inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                style={{
                  background: colors.neutral[50],
                  border: `2px dashed ${colors.neutral[100]}`,
                  borderRadius: "1rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <Upload
                  size={18}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview ? (
                <motion.div
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-medium text-gray-600"
                >
                  Image selected
                </motion.div>
              ) : (
                <div className="text-xs text-gray-500">No image selected</div>
              )}
            </div>
          </div>

          {/* Sticky Submit (mobile app feel) */}
          <div className="sticky bottom-0 -mx-5 px-5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <button
              type="submit"
              disabled={disabledSubmit}
              className={[
                "group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold",
                "transition-all duration-200",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
                "cursor-pointer",
                "sm:w-auto sm:px-7",
              ].join(" ")}
              style={{
                background: colors.primary.gradient,
                color: colors.neutral[50],
                padding: "0.75rem 2rem",
                borderRadius: "1rem",
                boxShadow: `0 4px 16px 0 ${colors.primary.light}44`,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {submitting ? (
                  <motion.span
                    key="submitting"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease }}
                    className="inline-flex items-center gap-2"
                  >
                    <Loader className="h-4 w-4 animate-spin" />
                    Submitting...
                  </motion.span>
                ) : (
                  <motion.span
                    key="submit"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease }}
                    className="inline-flex items-center gap-2"
                  >
                    Submit for Review
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 group-hover:translate-x-0.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12h12M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* micro helper */}
            <p className="mt-3 text-center text-xs text-gray-500">
              By submitting, your profile will be marked as{" "}
              <span className="font-semibold">pending</span> until review.
            </p>
          </div>
        </form>
      </div>
    );
  }
};

export default RegisterProfessional;
