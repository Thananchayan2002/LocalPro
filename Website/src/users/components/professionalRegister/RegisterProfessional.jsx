import React, { useEffect, useState, useRef } from "react";
import {
  Upload,
  Phone,
  MapPin,
  Briefcase,
  IdCard,
  Mail,
  Image,
  Navigation,
  Loader,
  X,
} from "lucide-react";
import { getAllServices } from "../../api/service/service";
import { registerProfessional } from "../../api/professional/professional";
import { useAuth } from "../../../worker/context/AuthContext";

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
        'script[src*="maps.googleapis.com"]'
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
        }
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
        formData.append(key, value)
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
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  // If not in modal mode (no isOpen prop), render normally
  if (isOpen === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 px-4 py-10">
        {renderContent()}
      </div>
    );
  }

  // Modal mode
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );

  function renderContent() {
    return (
      <div
        className={
          isOpen
            ? "p-6 md:p-10"
            : "max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-purple-100/60 p-6 md:p-10"
        }
      >
        {!isOpen && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-purple-600 font-semibold">
                Join Our Network
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                Register as a Professional
              </h1>
              <p className="text-gray-600 mt-2">
                Provide your details. We keep your status pending and review
                website submissions before approval.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full border border-purple-100">
              <Image size={18} />
              <span className="text-sm font-semibold">
                Profile review required
              </span>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Register as Professional
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              type="button"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        )}

        {message.text && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                />
                <Phone
                  className="absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email (optional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="you@example.com"
                />
                <Mail
                  className="absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                  readOnly
                />
                <Phone
                  className="absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service *
              </label>
              <select
                value={form.serviceId}
                onChange={(e) =>
                  setForm({ ...form, serviceId: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
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
              {servicesLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading services...
                </p>
              )}
              {!servicesLoading && services.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Services not available right now.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Experience (years) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                />
                <Briefcase
                  className="absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                District *
              </label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              >
                <option value="">Select District</option>
                {SRI_LANKAN_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location * (Select from Google suggestions)
              </label>

              <div className="relative">
                <input
                  ref={locationInputRef}
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Start typing to search location..."
                  required
                />
                <MapPin
                  className="absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>
              {form.lat && form.lng && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Location coordinates captured
                </p>
              )}
              {!form.lat && !form.lng && (
                <p className="text-xs text-gray-500 mt-2">
                  Please select from Google suggestions to capture exact
                  location
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NIC Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.nicNumber}
                  onChange={(e) =>
                    setForm({ ...form, nicNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                />
                <IdCard
                  className="absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Image (optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                <Upload size={20} />
                <span className="font-semibold text-sm">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">JPEG/PNG up to 5MB.</p>
          </div>

          <button
            type="submit"
            disabled={disabledSubmit}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      </div>
    );
  }
};

export default RegisterProfessional;
