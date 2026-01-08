import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, MapPin, User, Phone, Mail, 
    CheckCircle, XCircle, AlertCircle, Loader,
    Search, Filter, ChevronDown, Star, X, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const statusConfig = {
    requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    inspecting: { label: 'Inspecting', color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    inProgress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: Clock },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    paid: { label: 'Paid', color: 'bg-teal-100 text-teal-800', icon: DollarSign },
    verified: { label: 'Verified', color: 'bg-indigo-100 text-indigo-800', icon: Star }
};

export const Bookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsBooking, setDetailsBooking] = useState(null);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: '',
        payment: ''
    });

    useEffect(() => {
        fetchProfessionalBookings();
    }, []);

    const fetchProfessionalBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/api/bookings/professional-bookings`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                console.log('Fetched bookings with payments:', data.bookings);
                setBookings(data.bookings || []);
            } else {
                setError(data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError('Failed to load bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.issueType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleMarkComplete = (booking) => {
        setSelectedBooking(booking);
        setFormData({
            rating: 5,
            comment: '',
            payment: ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
        setFormData({
            rating: 5,
            comment: '',
            payment: ''
        });
    };

    const handleSubmitComplete = async (e) => {
        e.preventDefault();
        
        if (!formData.comment.trim()) {
            alert('Please provide a comment');
            return;
        }

        if (!formData.payment || formData.payment <= 0) {
            alert('Please provide a valid payment amount');
            return;
        }

        try {
            setSubmitting(true);
            
            const response = await fetch(`${API_BASE_URL}/api/bookings/complete-booking`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    bookingId: selectedBooking._id,
                    rating: formData.rating,
                    comment: formData.comment,
                    payment: parseFloat(formData.payment)
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Booking completed successfully!');
                handleCloseModal();
                fetchProfessionalBookings(); // Refresh the list
            } else {
                alert(data.message || 'Failed to complete booking');
            }
        } catch (error) {
            console.error('Error completing booking:', error);
            alert('Failed to complete booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-16">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by service, customer, or location..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="assigned">Assigned</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="paid">Paid</option>
                            <option value="verified">Verified</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </div>
            )}

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No bookings found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchQuery || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'You don\'t have any bookings yet'
                        }
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Service / Issue
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Scheduled
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredBookings.map((booking) => {
                                    const StatusIcon = statusConfig[booking.status]?.icon || AlertCircle;
                                    
                                    return (
                                        <tr 
                                            key={booking._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {booking.service}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {booking.issueType}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {booking.customerId?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {booking.customerId?.phone || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {formatDate(booking.scheduledTime)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatTime(booking.scheduledTime)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[booking.status]?.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig[booking.status]?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {booking.payment?.paymentByWorker !== null && booking.payment?.paymentByWorker !== undefined 
                                                            ? `₹${Number(booking.payment.paymentByWorker).toLocaleString()}` 
                                                            : 'Not paid'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setDetailsBooking(booking);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleMarkComplete(booking)}
                                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Booking Details Modal */}
            {showDetailsModal && detailsBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Booking Details</h2>
                                    <p className="text-blue-100">
                                        {detailsBooking.service} - {detailsBooking.issueType}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setDetailsBooking(null);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Booking ID - Copyable */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Booking ID
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-gray-900 dark:text-white">
                                        {detailsBooking._id}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(detailsBooking._id);
                                            alert('Booking ID copied to clipboard!');
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* Customer & Service Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Customer Name
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>{detailsBooking.customerId?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Contact Number
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{detailsBooking.customerId?.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Scheduled Date & Time
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{formatDate(detailsBooking.scheduledTime)} at {formatTime(detailsBooking.scheduledTime)}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[detailsBooking.status]?.color}`}>
                                        {React.createElement(statusConfig[detailsBooking.status]?.icon || AlertCircle, { className: 'w-3 h-3' })}
                                        {statusConfig[detailsBooking.status]?.label}
                                    </span>
                                </div>
                            </div>

                            {/* Location Details */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Location
                                </label>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">City:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                                {detailsBooking.location?.city || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">District:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                                {detailsBooking.location?.district || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500 dark:text-gray-400">Area:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                                {detailsBooking.location?.area || 'N/A'}
                                            </span>
                                        </div>
                                        {detailsBooking.location?.address && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500 dark:text-gray-400">Address:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                                    {detailsBooking.location.address}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {detailsBooking.description}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Payment Status
                                </label>
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="text-gray-900 dark:text-white">
                                        {detailsBooking.payment?.paymentByWorker !== null && detailsBooking.payment?.paymentByWorker !== undefined 
                                            ? `₹${Number(detailsBooking.payment.paymentByWorker).toLocaleString()}` 
                                            : 'Not paid'}
                                    </span>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setDetailsBooking(null);
                                }}
                                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Booking Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Complete Booking</h2>
                                    <p className="text-green-100">
                                        {selectedBooking.service} - {selectedBooking.issueType}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    disabled={submitting}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitComplete} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Booking Details */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Booking Details</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                            {selectedBooking.customerId?.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Booking ID:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white font-mono">
                                            {selectedBooking._id?.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Rate the Client
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                className={`w-8 h-8 ${
                                                    star <= formData.rating 
                                                        ? 'text-yellow-500 fill-yellow-500' 
                                                        : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                        {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Comment / Feedback
                                </label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Share your experience with this client..."
                                    required
                                />
                            </div>

                            {/* Payment */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Payment Amount (₹)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        value={formData.payment}
                                        onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter payment amount"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Complete Booking
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};