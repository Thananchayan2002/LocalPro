import React, { useState, useEffect } from 'react';
import { Bell, MapPin, Clock, CheckCircle, AlertCircle, Loader, X, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = (token) => {
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// Calculate distance between two coordinates using Haversine formula (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Check if booking should be shown based on time and distance
const shouldShowBooking = (booking, professionalLat, professionalLng) => {
  const createdAt = new Date(booking.createdAt);
  const now = new Date();
  const timeDiffMinutes = (now - createdAt) / (1000 * 60);

  // If booking is older than 30 minutes, show to all professionals in same district
  if (timeDiffMinutes > 30) {
    console.log(`Booking ${booking._id} is ${timeDiffMinutes.toFixed(0)} minutes old, showing to all in district`);
    return true;
  }

  // If booking is less than 30 minutes old, check distance
  if (!professionalLat || !professionalLng || !booking.location?.lat || !booking.location?.lng) {
    // If coordinates not available, fall back to showing all in district
    console.log(`Booking ${booking._id} or professional missing coordinates, showing anyway`);
    return true;
  }

  const distance = calculateDistance(
    professionalLat,
    professionalLng,
    booking.location.lat,
    booking.location.lng
  );

  console.log(`Booking ${booking._id} is ${timeDiffMinutes.toFixed(0)} minutes old, distance: ${distance.toFixed(2)} km`);
  return distance <= 10; // Show only if within 10km
};

export const Notifications = () => {
  const { user: contextUser, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userWithService, setUserWithService] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [acceptingBookingId, setAcceptingBookingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [pushSubscription, setPushSubscription] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Register Service Worker and request push notification permission
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
      }

      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Request notification permission
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        if (permission === 'granted') {
          setNotificationsEnabled(true);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    setupPushNotifications();
  }, []);

  // Subscribe to push notifications when user and service are available
  useEffect(() => {
    if (!userWithService || !userWithService.service || !userWithService.district || !notificationsEnabled || !token) {
      return;
    }

    const subscribeToPush = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Get VAPID public key from backend
        const keyResponse = await fetch(`${API_BASE_URL}/api/push/vapid-public-key`);
        const keyData = await keyResponse.json();
        
        if (!keyData.success || !keyData.publicKey) {
          console.error('Failed to get VAPID public key');
          return;
        }

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyData.publicKey
        });

        console.log('Push subscription created:', subscription);
        setPushSubscription(subscription);

        // Send subscription to backend
        const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            service: userWithService.service,
            district: userWithService.district
          })
        });

        const data = await response.json();
        if (data.success) {
          console.log('Successfully subscribed to push notifications');
          setMessage({ type: 'success', text: '🔔 Push notifications enabled!' });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      } catch (error) {
        console.error('Push subscription failed:', error);
      }
    };

    subscribeToPush();
  }, [userWithService?.service, userWithService?.district, notificationsEnabled, token]);

  // Fetch professional details using same logic as Account.jsx
  useEffect(() => {
    if (!contextUser) return;

    const fetchProfessionalData = async () => {
      try {
        if (!contextUser?.professionalId && !contextUser?.phone) {
          setUserWithService(contextUser);
          return;
        }

        let professionalData = null;

        // Try by professionalId first
        if (contextUser?.professionalId) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/professionals/${contextUser.professionalId}`, { 
              headers: getAuthHeaders(token) 
            });
            const data = await res.json();

            if (data.success) {
              professionalData = data.data;
            }
          } catch (error) {
            console.error('Failed to fetch professional by id:', error);
          }
        }

        // Fallback: lookup by phone using search filter
        if (!professionalData && contextUser?.phone) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/professionals?search=${encodeURIComponent(contextUser.phone)}`, { 
              headers: getAuthHeaders(token) 
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              professionalData = data.data[0];
            }
          } catch (error) {
            console.error('Failed to fetch professional by phone:', error);
          }
        }

        // Merge professional data with user data
        if (professionalData) {
          // Extract service name from serviceId (which is populated)
          const serviceName = professionalData.serviceId?.service || professionalData.service;
          setUserWithService({
            ...contextUser,
            service: serviceName,
            district: professionalData.district,
            location: professionalData.location,
            lat: professionalData.lat,
            lng: professionalData.lng
          });
          console.log('Professional data loaded:', professionalData);
          console.log('Service extracted:', serviceName);
          console.log('Coordinates:', { lat: professionalData.lat, lng: professionalData.lng });
        } else {
          setUserWithService(contextUser);
        }
      } catch (err) {
        console.error('Error loading professional data:', err);
        setMessage({ type: 'error', text: 'Failed to load professional data' });
        setUserWithService(contextUser);
      }
    };

    fetchProfessionalData();
  }, [contextUser?.professionalId, contextUser?.phone, contextUser, token]);

  // Fetch matching bookings
  useEffect(() => {
    if (!userWithService || !userWithService.service || !userWithService.district) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/bookings/all?status=requested`, {
          headers: getAuthHeaders(token)
        });

        const data = await response.json();
        console.log('Bookings response:', data);

        if (data.success) {
          const allBookings = Array.isArray(data.bookings) ? data.bookings : Array.isArray(data.data) ? data.data : [];
          const filtered = allBookings.filter(booking => {
            // First check service and district match
            const basicMatch = (
              booking.status === 'requested' &&
              booking.service === userWithService.service &&
              booking.location?.district === userWithService.district
            );
            
            if (!basicMatch) return false;
            
            // Then check time and distance
            return shouldShowBooking(booking, userWithService.lat, userWithService.lng);
          });
          console.log('Filtered bookings:', filtered);
          setBookings(filtered);
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to load bookings' });
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setMessage({ type: 'error', text: 'Failed to load bookings. Make sure backend is running.' });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userWithService?.service, userWithService?.district, token]);

  // WebSocket connection for real-time bookings
  useEffect(() => {
    if (!userWithService || !userWithService.service || !userWithService.district) return;

    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
    });

    socket.on('newBooking', (data) => {
      console.log('New booking received via WebSocket:', data);
      
      // Check if this booking matches professional's service and district
      const booking = data.booking;
      const basicMatch = (
        booking.status === 'requested' &&
        booking.service === userWithService.service &&
        booking.location?.district === userWithService.district
      );
      
      if (basicMatch && shouldShowBooking(booking, userWithService.lat, userWithService.lng)) {
        console.log('Adding new matching booking to list');
        setBookings(prevBookings => {
          // Check if booking already exists
          const exists = prevBookings.some(b => b._id === booking._id);
          if (exists) return prevBookings;
          return [booking, ...prevBookings];
        });
        
        // Show notification message
        setMessage({ 
          type: 'success', 
          text: `New job available: ${booking.issueType}` 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      }
    });

    socket.on('bookingStatusUpdate', (data) => {
      console.log('Booking status update received via WebSocket:', data);
      
      // If a booking is assigned, remove it from the list
      if (data.status === 'assigned') {
        setBookings(prevBookings => {
          const filtered = prevBookings.filter(b => b._id !== data.bookingId);
          // Show message only if the booking was in our list
          if (filtered.length < prevBookings.length) {
            setMessage({ 
              type: 'info', 
              text: 'A job was just accepted by another professional' 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
          }
          return filtered;
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [userWithService?.service, userWithService?.district, userWithService?.lat, userWithService?.lng]);

  // Periodic check to refresh bookings (for bookings that pass the 30-minute threshold)
  useEffect(() => {
    if (!userWithService || !userWithService.service || !userWithService.district) return;

    const interval = setInterval(() => {
      // Re-fetch bookings every minute to update the list based on time threshold
      fetchBookings();
    }, 60000); // Check every 1 minute

    return () => clearInterval(interval);
  }, [userWithService?.service, userWithService?.district, userWithService?.lat, userWithService?.lng, token]);

  // Calculate deadline time (scheduled time + duration)
  const getDeadlineTime = (scheduledTime, duration) => {
    const scheduled = new Date(scheduledTime);
    const deadline = new Date(scheduled.getTime() + (duration || 2) * 60 * 60 * 1000);
    return deadline.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bookings/all?status=requested`, {
        headers: getAuthHeaders(token)
      });

      const data = await response.json();
      console.log('Bookings response:', data);

      if (data.success) {
        const allBookings = Array.isArray(data.bookings) ? data.bookings : Array.isArray(data.data) ? data.data : [];
        const filtered = allBookings.filter(booking => {
          // First check service and district match
          const basicMatch = (
            booking.status === 'requested' &&
            booking.service === userWithService.service &&
            booking.location?.district === userWithService.district
          );
          
          if (!basicMatch) return false;
          
          // Then check time and distance
          return shouldShowBooking(booking, userWithService.lat, userWithService.lng);
        });
        console.log('Filtered bookings:', filtered);
        setBookings(filtered);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load bookings' });
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setMessage({ type: 'error', text: 'Failed to load bookings. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    setLoadingCustomer(true);
    console.log('Fetching customer details for ID:', customerId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${customerId}`, {
        headers: getAuthHeaders(token)
      });
      const data = await response.json();
      console.log('Customer details response:', data);
      if (data.success) {
        setCustomerDetails(data.data);
      } else {
        console.error('Failed to fetch customer:', data.message);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleOpenConfirmModal = (booking) => {
    console.log('Selected booking:', booking);
    console.log('Customer data from booking:', booking.customerId);
    setSelectedBooking(booking);
    setShowConfirmModal(true);
    
    // Check if customerId is already populated (object) or just an ID (string)
    if (booking.customerId && typeof booking.customerId === 'object') {
      // Already populated
      setCustomerDetails(booking.customerId);
      setLoadingCustomer(false);
    } else if (booking.customerId) {
      // Need to fetch
      fetchCustomerDetails(booking.customerId);
    } else {
      console.error('No customerId found in booking');
      setLoadingCustomer(false);
    }
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedBooking(null);
    setCustomerDetails(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessBooking(null);
  };

  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;

    try {
      setAcceptingBookingId(selectedBooking._id);
      
      // Use the user's own ID (from User table), not professionalId (from Professional table)
      const userIdToAssign = contextUser.id || contextUser._id;
      
      console.log('Accepting booking with:', {
        bookingId: selectedBooking._id,
        status: 'assigned',
        professionalId: userIdToAssign,
        contextUser
      });
      
      const response = await fetch(`${API_BASE_URL}/api/bookings/update-status/${selectedBooking._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          status: 'assigned',
          professionalId: userIdToAssign
        })
      });

      const data = await response.json();
      console.log('Update booking response:', data);
      
      if (data.success) {
        // Store booking with customer details for success modal
        const bookingWithCustomer = {
          ...selectedBooking,
          customerInfo: customerDetails
        };
        setSuccessBooking(bookingWithCustomer);
        setShowSuccessModal(true);
        setBookings(bookings.filter(b => b._id !== selectedBooking._id));
        handleCloseConfirmModal();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to accept booking' });
      }
    } catch (err) {
      console.error('Error accepting booking:', err);
      setMessage({ type: 'error', text: 'Failed to accept booking' });
    } finally {
      setAcceptingBookingId(null);
    }
  };

  if (!userWithService) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
            <Bell size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Available Jobs</h1>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const userInfo = `Service: ${userWithService.service || 'N/A'}, District: ${userWithService.district || 'N/A'}${userWithService.location ? `, Location: ${userWithService.location}` : ''}`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 mt-12">
        <div className="p-2.5 bg-purple-600 rounded-lg">
          <Bell size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Available Jobs</h1>
          <p className="text-sm text-gray-600">{userInfo} • {bookings.length} job(s)</p>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading available jobs...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 border border-gray-200">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
              <Bell size={32} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Available Jobs</h3>
            <p className="text-gray-600 text-sm">No pending bookings matching your service and district.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            // Calculate distance if coordinates are available
            let distance = null;
            if (userWithService.lat && userWithService.lng && booking.location?.lat && booking.location?.lng) {
              distance = calculateDistance(
                userWithService.lat,
                userWithService.lng,
                booking.location.lat,
                booking.location.lng
              );
              console.log('Distance calculated:', {
                professionalLat: userWithService.lat,
                professionalLng: userWithService.lng,
                bookingLat: booking.location.lat,
                bookingLng: booking.location.lng,
                distance: distance.toFixed(1)
              });
            } else {
              console.log('Missing coordinates for distance calculation:', {
                professionalLat: userWithService.lat,
                professionalLng: userWithService.lng,
                bookingLat: booking.location?.lat,
                bookingLng: booking.location?.lng
              });
            }

            return (
            <div key={booking._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-4">
                {/* Top Section - Service and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{booking.service}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{booking.issueType}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    {booking.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-3 text-sm line-clamp-2">{booking.description}</p>

                {/* Details Grid */}
                <div className="space-y-2 mb-3">
                  {/* Location with Distance */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        {distance !== null ? (
                          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                            {distance.toFixed(1)} km away
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                            Distance N/A
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 truncate">{booking.location?.address}</p>
                    </div>
                  </div>

                  {/* Scheduled Time */}
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Scheduled Time</p>
                      <p className="text-sm text-gray-900">
                        {new Date(booking.scheduledTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Booked Time */}
                  {booking.createdAt && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Booked At</p>
                        <p className="text-sm text-gray-900">
                          {new Date(booking.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenConfirmModal(booking)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Job
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-md z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Confirm Job Acceptance</h2>
                <button
                  onClick={handleCloseConfirmModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Customer Name */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-purple-700 font-semibold uppercase">Customer Name</p>
                </div>
                {loadingCustomer ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Loading...</span>
                  </div>
                ) : (
                  <p className="text-base font-semibold text-gray-900">{customerDetails?.name || 'N/A'}</p>
                )}
              </div>

              {/* Issue */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 font-semibold uppercase mb-1">Issue Type</p>
                <p className="text-base font-semibold text-gray-900">{selectedBooking.issueType}</p>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700">{selectedBooking.description}</p>
              </div>

              {/* Scheduled Time */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-orange-700 font-semibold uppercase">Scheduled Time</p>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(selectedBooking.scheduledTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {selectedBooking.duration && (
                  <p className="text-xs text-orange-700 mt-1">Duration: {selectedBooking.duration} hours</p>
                )}
              </div>

              {/* Location */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-700 font-semibold uppercase">Location</p>
                  {userWithService.lat && userWithService.lng && selectedBooking.location?.lat && selectedBooking.location?.lng && (
                    <span className="ml-auto text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                      {calculateDistance(
                        userWithService.lat,
                        userWithService.lng,
                        selectedBooking.location.lat,
                        selectedBooking.location.lng
                      ).toFixed(1)} km away
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-900">{selectedBooking.location?.address}</p>
                {selectedBooking.location?.district && (
                  <p className="text-xs text-green-700 mt-1">District: {selectedBooking.location.district}</p>
                )}
              </div>

              {/* Warning Message */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900 mb-1">Important Notice</p>
                    <p className="text-xs text-amber-800">
                      You must arrive within <span className="font-semibold">{getDeadlineTime(selectedBooking.scheduledTime, selectedBooking.duration)}</span>. Confirm only if you can reach within this timeframe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Sticky */}
            <div className="flex-shrink-0 bg-white border-t p-4 flex gap-3 z-10">
              <button
                onClick={handleCloseConfirmModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptBooking}
                disabled={acceptingBookingId === selectedBooking._id}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {acceptingBookingId === selectedBooking._id ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm & Accept
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successBooking && successBooking.customerInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Success Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-1">Booking Accepted!</h2>
                  <p className="text-sm text-green-100">You've successfully accepted this job</p>
                </div>
              </div>
            </div>

            {/* Success Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Issue Type */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Issue Type</p>
                <p className="text-base font-bold text-gray-900">{successBooking.issueType}</p>
              </div>

              {/* Customer Name */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-purple-600 font-semibold uppercase">Customer</p>
                </div>
                <p className="text-base font-bold text-gray-900">{successBooking.customerInfo.name}</p>
              </div>

              {/* Customer Phone */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold uppercase">Phone Number</p>
                </div>
                <p className="text-base font-bold text-gray-900">{successBooking.customerInfo.phone}</p>
              </div>

              {/* Scheduled Time */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-orange-600 font-semibold uppercase">Scheduled Time</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(successBooking.scheduledTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">✓ Successfully accepted!</span> You will receive updates on this job. Head to the location on time.
                </p>
              </div>
            </div>

            {/* Success Footer */}
            <div className="flex-shrink-0 bg-gray-50 px-4 py-3 border-t">
              <button
                onClick={handleCloseSuccessModal}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

