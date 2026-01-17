import React, { useState, useEffect } from 'react';
import { 
    CreditCard, Download, Calendar, Clock, MapPin, User, Phone, 
    CheckCircle, Loader, Search, DollarSign, Star, X, AlertCircle
} from 'lucide-react';
import { authFetch } from '../../../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const statusConfig = {
    completed: { label: 'Pending Payment', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    verified: { label: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

export const Payments = () => {
    const [completedBookings, setCompletedBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsBooking, setDetailsBooking] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentBooking, setPaymentBooking] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchCompletedBookings();
    }, []);

    const fetchCompletedBookings = async () => {
        try {
            setLoading(true);
            
            const response = await authFetch(`${API_BASE_URL}/api/bookings/professional-bookings`);

            const data = await response.json();

            if (data.success) {
                // Filter completed, paid, and verified bookings
                const completed = data.bookings.filter(booking => 
                    booking.status === 'completed' || booking.status === 'paid' || booking.status === 'verified'
                );
                setCompletedBookings(completed);
            }
        } catch (error) {
            console.error('Error fetching completed bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = completedBookings.filter(booking => {
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

    const calculateTotalToPay = () => {
        const total = filteredBookings
            .filter(booking => booking.status === 'completed')
            .reduce((total, booking) => {
                const payment = booking.payment?.paymentByWorker || 0;
                return total + Number(payment);
            }, 0);
        return total * 0.1; // 10% of total payment
    };

    const calculateTotalReceived = () => {
        return filteredBookings
            .filter(booking => booking.status === 'paid' || booking.status === 'verified')
            .reduce((total, booking) => {
                const payment = booking.payment?.paymentByWorker || 0;
                return total + Number(payment);
            }, 0);
    };

    const handlePayNow = (booking = null) => {
        if (booking) {
            setPaymentBooking(booking);
        } else {
            // Handle all completed bookings
            const allCompleted = filteredBookings.filter(b => b.status === 'completed');
            setPaymentBooking(allCompleted);
        }
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async () => {
        if (!paymentBooking) return;

        try {
            setProcessingPayment(true);

            // Check if it's a bulk payment (array) or single payment (object)
            const isBulk = Array.isArray(paymentBooking);
            
            if (isBulk) {
                // Handle multiple bookings
                const updatePromises = paymentBooking.map(booking =>
                    authFetch(`${API_BASE_URL}/api/bookings/update-status/${booking._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'paid' })
                    }).then(res => res.json())
                );

                const results = await Promise.all(updatePromises);
                const allSuccess = results.every(data => data.success);

                if (allSuccess) {
                    setSuccessMessage(`${paymentBooking.length} payment(s) confirmed successfully!`);
                    setShowSuccessModal(true);
                    setShowPaymentModal(false);
                    setPaymentBooking(null);
                    fetchCompletedBookings();
                    setTimeout(() => setShowSuccessModal(false), 3000);
                } else {
                    alert('Some payments failed to confirm. Please try again.');
                }
            } else {
                // Handle single booking
                const response = await authFetch(`${API_BASE_URL}/api/bookings/update-status/${paymentBooking._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'paid' })
                });

                const data = await response.json();

                if (data.success) {
                    setSuccessMessage('Payment confirmed successfully!');
                    setShowSuccessModal(true);
                    setShowPaymentModal(false);
                    setPaymentBooking(null);
                    fetchCompletedBookings();
                    setTimeout(() => setShowSuccessModal(false), 3000);
                } else {
                    alert(data.message || 'Failed to confirm payment');
                }
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Failed to confirm payment. Please try again.');
        } finally {
            setProcessingPayment(false);
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
            {/* Header with Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                {/* Pending Payments (To Pay) */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-sm p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Pending Commission</h2>
                            <p className="text-orange-100">
                                10% commission to pay
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-100 text-sm mb-1">Total To Pay (10%)</p>
                            <p className="text-3xl font-bold">{calculateTotalToPay().toLocaleString()}/=</p>
                        </div>
                    </div>
                    {calculateTotalToPay() > 0 && (
                        <button
                            onClick={() => handlePayNow()}
                            className="w-full px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay All Pending ({filteredBookings.filter(b => b.status === 'completed').length})
                        </button>
                    )}
                </div>
                
                {/* Received Payments */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Received Payments</h2>
                            <p className="text-green-100">
                                {filteredBookings.length} payment record{filteredBookings.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-green-100 text-sm mb-1">Total Received</p>
                            <p className="text-3xl font-bold">{calculateTotalReceived().toLocaleString()}/=</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
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
                    <div className="relative min-w-[200px]">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Pending Payment</option>
                            <option value="paid">Paid</option>
                            <option value="verified">Verified</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Completed Bookings Table */}
            {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No completed payments found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchQuery 
                            ? 'Try adjusting your search criteria'
                            : 'Complete bookings to see payment records here'
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
                                        Scheduled On
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Payment Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredBookings.map((booking) => {
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
                                                <div>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[booking.status]?.color}`}>
                                                        {React.createElement(statusConfig[booking.status]?.icon || CheckCircle, { className: 'w-3 h-3' })}
                                                        {statusConfig[booking.status]?.label}
                                                    </span>
                                                    {(booking.status === 'paid' || booking.status === 'verified') && booking.paidAt && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Paid: {formatDate(booking.paidAt)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                       
                                                        <span className={`text-sm font-bold ${
                                                            booking.status === 'completed'
                                                                ? 'text-orange-600 dark:text-orange-400'
                                                                : 'text-green-600 dark:text-green-400'
                                                        }`}>
                                                            {booking.status === 'completed' ? (
                                                                <>
                                                                    {(Number(booking.payment?.paymentByWorker || 0) * 0.1).toLocaleString()}/=
                                                                </>
                                                            ) : (
                                                                `${Number(booking.payment?.paymentByWorker || 0).toLocaleString()}/=`
                                                            )}
                                                        </span>
                                                    </div>
                                                    {booking.status === 'completed' && (
                                                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-400 mt-1">
                                                            Full amount: {Number(booking.payment?.paymentByWorker || 0).toLocaleString()}/=
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setDetailsBooking(booking);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    View Details
                                                </button>
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
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Payment Details</h2>
                                    <p className="text-green-100">
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
                                        {React.createElement(statusConfig[detailsBooking.status]?.icon || CheckCircle, { className: 'w-3 h-3' })}
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

                            {/* Worker Review (Rating & Comment) */}
                            {detailsBooking.workerReview && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Your Review
                                    </label>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Rating:</span>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star 
                                                        key={star}
                                                        className={`w-4 h-4 ${
                                                            star <= detailsBooking.workerReview.rating 
                                                                ? 'text-yellow-500 fill-yellow-500' 
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {detailsBooking.workerReview.rating}/5
                                                </span>
                                            </div>
                                        </div>
                                        {detailsBooking.workerReview.comment && (
                                            <div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Comment:</span>
                                                <p className="mt-1 text-gray-900 dark:text-white">
                                                    {detailsBooking.workerReview.comment}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Info */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Payment Amount
                                </label>
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <span className="text-green-600 dark:text-green-400">
                                        {detailsBooking.payment?.paymentByWorker !== null && detailsBooking.payment?.paymentByWorker !== undefined 
                                            ? `${Number(detailsBooking.payment.paymentByWorker).toLocaleString()}/=` 
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

            {/* Payment Confirmation Modal */}
            {showPaymentModal && paymentBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-8 h-8" />
                                <div>
                                    <h2 className="text-2xl font-bold">Confirm Payment</h2>
                                    <p className="text-orange-100 text-sm">
                                        {Array.isArray(paymentBooking) 
                                            ? `${paymentBooking.length} pending payment(s)` 
                                            : 'Please verify payment details'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {Array.isArray(paymentBooking) ? (
                                // Multiple bookings
                                <>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Payment List ({paymentBooking.length} bookings)
                                        </h3>
                                        <div className="space-y-2">
                                            {paymentBooking.map((booking, index) => {
                                                const fullAmount = Number(booking.payment?.paymentByWorker || 0);
                                                const commissionAmount = fullAmount * 0.1;
                                                return (
                                                    <div key={booking._id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {index + 1}. {booking.service}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {booking.customerId?.name} - {commissionAmount.toLocaleString()}/= (10% of {fullAmount.toLocaleString()}/=)
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Commission Amount (10%):</span>
                                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                            {(paymentBooking.reduce((sum, b) => sum + Number(b.payment?.paymentByWorker || 0), 0) * 0.1).toLocaleString()}/=
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Total booking amount: {paymentBooking.reduce((sum, b) => sum + Number(b.payment?.paymentByWorker || 0), 0).toLocaleString()}/=
                                        </p>
                                    </div>
                                </>
                            ) : (
                                // Single booking
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Service:</span>
                                        <p className="text-gray-900 dark:text-white font-semibold">
                                            {paymentBooking.service} - {paymentBooking.issueType}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Customer:</span>
                                        <p className="text-gray-900 dark:text-white font-semibold">
                                            {paymentBooking.customerId?.name}
                                        </p>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Commission Amount (10%):</span>
                                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {(Number(paymentBooking.payment?.paymentByWorker || 0) * 0.1).toLocaleString()}/=
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Full booking amount: {Number(paymentBooking.payment?.paymentByWorker || 0).toLocaleString()}/=
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-red-800 dark:text-red-200 mb-2">
                                            ⚠️ Important Confirmation Required
                                        </h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                                            Please confirm that you have <strong>already transferred the 10% commission through your bank</strong> for {Array.isArray(paymentBooking) ? 'these bookings' : 'this booking'}.
                                        </p>
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            By clicking "Confirm", you acknowledge that the 10% commission payment has been completed and this action will update the booking status to "Paid".
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentBooking(null);
                                    }}
                                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                                    disabled={processingPayment}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={processingPayment}
                                >
                                    {processingPayment ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Confirm
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-bounce-in">
                        <div className="p-8 text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Success!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
