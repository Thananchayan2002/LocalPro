import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { colors } from "../../../styles/colors";
import StepIndicator from "./bookingService/StepIndicator";
import AlertMessages from "./bookingService/AlertMessages";
import ServiceSelection from "./bookingService/ServiceSelection";
import BookingDetailsForm from "./bookingService/BookingDetailsForm";
import BookServiceMobile from "./BookServiceMobile";

const BookService = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
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
  }, [isOpen, step]);

  // Hide header and nav when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      document.body.classList.add("bookservice-mobile-open");
    } else {
      document.body.classList.remove("modal-open");
      document.body.classList.remove("bookservice-mobile-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.body.classList.remove("bookservice-mobile-open");
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

        // Extract location components from address_components
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

        // Fallback: extract from formatted address if components not found
        if (!city && !area) {
          const parts = place.formatted_address.split(",");
          area = parts[0]?.trim() || "";
          city = parts[parts.length - 2]?.trim() || "";
        }

        setFormData((prev) => ({
          ...prev,
          location: {
            address: place.formatted_address,
            city: city,
            district: district,
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
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setServices(data.data || data.services || []);
      } else {
        setError(data.message || "Failed to load services");
      }
    } catch (err) {
      console.error("Fetch services error:", err);
      setError("Failed to load services. Please try again.");
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
              // Extract location components
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
                  city: city,
                  district: district,
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
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bookings/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
          }),
        }
      );

      const data = await response.json();

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
      setError("An error occurred. Please try again.");
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

  return (
    <>
      {/* Mobile view */}
      <BookServiceMobile
        isOpen={isOpen}
        onClose={onClose}
        step={step}
        services={services}
        selectedService={selectedService}
        loading={loading}
        error={error}
        success={success}
        useCurrentLocation={useCurrentLocation}
        setUseCurrentLocation={setUseCurrentLocation}
        locationLoading={locationLoading}
        locationInputRef={locationInputRef}
        formData={formData}
        handleServiceSelect={handleServiceSelect}
        handleNext={handleNext}
        handleBack={handleBack}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        getCurrentLocation={getCurrentLocation}
        getMinDateTime={getMinDateTime}
        getMaxDateTime={getMaxDateTime}
        calculateEndTime={calculateEndTime}
        resetForm={resetForm}
      />

      {/* Desktop view (modal) */}
      {isOpen && (
        <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm pt-48 sm:pt-0">
          {/* Modal Container */}
          <div
            className="
              relative w-full max-w-4xl
              h-auto max-h-[90vh]
              bg-white
              rounded-2xl
              border border-gray-100
              shadow-2xl
              flex flex-col
              overflow-hidden 
            "
          >
            {/* Header (sticky) */}
            <div
              className="
                sticky top-0 z-10
                relative flex-shrink-0
                px-4 py-4 sm:p-6
                text-white
                shadow-sm
              "
              style={{ background: colors.primary.gradient }}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="
                  absolute top-3 right-3 sm:top-4 sm:right-4
                  rounded-full p-2.5 sm:p-2
                  transition hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-white/40
                  cursor-pointer
                "
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                aria-label="Close booking modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <h2 className="text-xl sm:text-2xl font-bold mb-2 pr-8">
                Book a Service
              </h2>

              <StepIndicator currentStep={step} />
            </div>

            {/* Body (scrollable) */}
            <div
              className="
                flex-1
                overflow-y-auto
                px-4 py-5 sm:px-6 sm:py-6
                space-y-6
                pb-6 sm:pb-8
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
        </div>
      )}
    </>
  );
};

export default BookService;
