import React, { useState, useEffect, useRef } from 'react';
import {
  X, ChevronRight, Calendar, Clock, MapPin, AlertCircle,
  Navigation, Loader, Check, Package
} from 'lucide-react';

const BookService = ({ isOpen, onClose }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    service: '',
    issueType: '',
    description: '',
    scheduledTime: '',
    location: {
      address: '',
      city: '',
      district: '',
      area: '',
      lat: null,
      lng: null
    }
  });

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchServices();
    }
  }, [isOpen, step]);

  // Hide header when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
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

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true; 
      document.head.appendChild(script);
    };  

    if (isOpen && step === 2) {
      loadGoogleMapsScript();
    }
  }, [isOpen, step]);

  const initializeAutocomplete = () => {
    if (locationInputRef.current && window.google && window.google.maps.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ['geocode'],
          componentRestrictions: { country: 'lk' }
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          setError('Please select a valid location from the suggestions');
          return;
        }

        // Extract location components from address_components
        let city = '';
        let district = '';
        let area = '';

        if (place.address_components) {
          place.address_components.forEach(component => {
            const types = component.types;

            if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
              district = component.long_name;
            } else if (types.includes('administrative_area_level_1') && !district) {
              district = component.long_name;
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
              area = component.long_name;
            }
          });
        }

        // Fallback: extract from formatted address if components not found
        if (!city && !area) {
          const parts = place.formatted_address.split(',');
          area = parts[0]?.trim() || '';
          city = parts[parts.length - 2]?.trim() || '';
        }

        setFormData(prev => ({
          ...prev,
          location: {
            address: place.formatted_address,
            city: city,
            district: district,
            area: area || city,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));
        setError('');
      });

      autocompleteRef.current = autocomplete;
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        setServices(data.data || data.services || []);
      } else {
        setError(data.message || 'Failed to load services');
      }
    } catch (err) {
      console.error('Fetch services error:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData(prev => ({ ...prev, service: service.service }));
  };

  const handleNext = () => {
    if (!selectedService) {
      setError('Please select a service');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'location.address') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, address: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
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
            if (status === 'OK' && results[0]) {
              // Extract location components
              let city = '';
              let district = '';
              let area = '';

              if (results[0].address_components) {
                results[0].address_components.forEach(component => {
                  const types = component.types;

                  if (types.includes('locality')) {
                    city = component.long_name;
                  } else if (types.includes('administrative_area_level_2')) {
                    district = component.long_name;
                  } else if (types.includes('administrative_area_level_1') && !district) {
                    district = component.long_name;
                  } else if (types.includes('sublocality') || types.includes('neighborhood')) {
                    area = component.long_name;
                  }
                });
              }

              setFormData(prev => ({
                ...prev,
                location: {
                  address: results[0].formatted_address,
                  city: city,
                  district: district,
                  area: area || city,
                  lat: latitude,
                  lng: longitude
                }
              }));

              if (locationInputRef.current) {
                locationInputRef.current.value = results[0].formatted_address;
              }
              setError('');
            } else {
              setError('Failed to get address details');
            }
            setLocationLoading(false);
          });
        } catch (err) {
          setError('Failed to get address details');
          setLocationLoading(false);
        }
      },
      (error) => {
        setError('Unable to retrieve your location');
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
    if (!startTime) return '';
    const start = new Date(startTime);
    start.setHours(start.getHours() + 2);
    return start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.service || !formData.issueType || !formData.description || !formData.scheduledTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.location.address || !formData.location.lat || !formData.location.lng) {
      setError('Please set a valid location');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
            lng: formData.location.lng
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setFormData({
      service: '',
      issueType: '',
      description: '',
      scheduledTime: '',
      location: { address: '', city: '', district: '', area: '', lat: null, lng: null }
    });
    setError('');
    setSuccess(false);
    setUseCurrentLocation(false);
    if (locationInputRef.current) {
      locationInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold mb-2">Book a Service</h2>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-white' : 'text-purple-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-white text-purple-600' : 'bg-purple-500'}`}>
                1
              </div>
              <span className="font-medium">Select Service</span>
            </div>
            <ChevronRight className="w-5 h-5" />
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-white' : 'text-purple-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-white text-purple-600' : 'bg-purple-500'}`}>
                2
              </div>
              <span className="font-medium">Booking Details</span>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-green-600">Booking created successfully!</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose a Service</h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      onClick={() => handleServiceSelect(service)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedService?._id === service._id
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg text-white">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{service.service}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        {selectedService?._id === service._id && (
                          <Check className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!selectedService}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Selected Service:</p>
                <p className="font-semibold text-purple-900">{selectedService?.service}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Type <span>*</span>
                </label>
                <input
                  type="text"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="e.g., Fan not working"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="Describe the issue in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Service Time <span>*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="datetime-local"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        min={getMinDateTime()}
                        max={getMaxDateTime()}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Available: Today or Tomorrow only</p>
                  </div>
                  {formData.scheduledTime && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                      <Clock className="text-gray-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-600">Estimated End Time</p>
                        <p className="font-semibold text-gray-900">{calculateEndTime(formData.scheduledTime)}</p>
                        <p className="text-xs text-gray-500 mt-1">Duration: +2 hours</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                  >
                    <Navigation className="w-4 h-4" />
                    Use Current Location
                  </button>
                  {locationLoading && <Loader className="w-5 h-5 animate-spin text-purple-600" />}
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    ref={locationInputRef}
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    placeholder="Enter your service location"
                    required
                  />
                </div>

                {formData.location.address && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Selected Location:</p>
                        <p className="text-sm text-gray-900">{formData.location.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Coordinates: {formData.location.lat?.toFixed(6)}, {formData.location.lng?.toFixed(6)}
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
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
      </div>
    </div>
  );
};

export default BookService;
