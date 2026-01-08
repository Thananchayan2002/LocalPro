import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Calendar,
    Eye,
    CheckCircle,
    X,
    MapPin,
    User,
    Briefcase,
    Clock,
    DollarSign,
    Star,
    MessageSquare,
    FileText,
    Search,
    Filter
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
import { ConfirmModal } from '../common/ConfirmModal';
import { SRI_LANKAN_DISTRICTS } from '../../utils/districts';

export const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewBooking, setViewBooking] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        bookingId: null
    });

    // Filter and search state
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Fetch all bookings with populated data
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE_URL}/api/bookings/all-detailed`);
            const data = await res.json();

            if (data.success) {
                // Filter to show only completed, paid, and verified bookings
                const allowedStatuses = ['completed', 'paid', 'verified'];
                const filteredData = data.data.filter(booking =>
                    allowedStatuses.includes(booking.status)
                );
                setBookings(filteredData);
                setFilteredBookings(filteredData);
            } else {
                toast.error(data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Filter and search bookings
    useEffect(() => {
        let filtered = [...bookings];

        // Filter by status
        if (filterStatus) {
            filtered = filtered.filter(booking => booking.status === filterStatus);
        }

        // Filter by district
        if (filterDistrict) {
            filtered = filtered.filter(booking => booking.location?.district === filterDistrict);
        }

        // Search by customer name, professional name, or phone number
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(booking => {
                const customerName = booking.customerId?.name?.toLowerCase() || '';
                const customerPhone = booking.customerId?.phone?.toLowerCase() || '';
                const professionalName = booking.professionalId?.name?.toLowerCase() || '';
                const professionalPhone = booking.professionalId?.phone?.toLowerCase() || '';

                return customerName.includes(query) ||
                    customerPhone.includes(query) ||
                    professionalName.includes(query) ||
                    professionalPhone.includes(query);
            });
        }

        // Filter by date range
        if (startDate || endDate) {
            filtered = filtered.filter((booking) => {
                const bookingDate = new Date(booking.scheduledTime);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                // Set time to start of day for start date and end of day for end date
                if (start) start.setHours(0, 0, 0, 0);
                if (end) end.setHours(23, 59, 59, 999);

                if (start && end) {
                    return bookingDate >= start && bookingDate <= end;
                } else if (start) {
                    return bookingDate >= start;
                } else if (end) {
                    return bookingDate <= end;
                }
                return true;
            });
        }

        setFilteredBookings(filtered);
    }, [bookings, filterStatus, filterDistrict, searchQuery, startDate, endDate]);

    // Handle verify booking
    const handleVerify = (bookingId) => {
        setConfirmModal({
            isOpen: true,
            bookingId
        });
    };

    // Confirm verification
    const confirmVerification = async () => {
        const { bookingId } = confirmModal;
        setConfirmModal({ isOpen: false, bookingId: null });

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/bookings/update-status/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'verified',
                    verifiedAt: new Date()
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Booking verified successfully');
                fetchBookings();
            } else {
                toast.error(data.message || 'Failed to verify booking');
            }
        } catch (error) {
            console.error('Verify booking error:', error);
            toast.error('Failed to verify booking');
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            requested: 'bg-blue-100 text-blue-700',
            assigned: 'bg-cyan-100 text-cyan-700',
            inspecting: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            inProgress: 'bg-orange-100 text-orange-700',
            completed: 'bg-purple-100 text-purple-700',
            cancelled: 'bg-red-100 text-red-700',
            paid: 'bg-emerald-100 text-emerald-700',
            verified: 'bg-teal-100 text-teal-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen p-4 lg:p-6">
            <Toaster
                position="top-right"
                reverseOrder={false}
                containerStyle={{
                    top: 80,
                    right: 20,
                }}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Verify Booking"
                message="Are you sure you want to mark this booking as verified?"
                confirmText="Verify"
                onConfirm={confirmVerification}
                onCancel={() => setConfirmModal({ isOpen: false, bookingId: null })}
                isDangerous={false}
            />

            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 mt-16 lg:mt-8">
                <div className="flex items-center gap-3">
                    <Calendar size={28} className="text-purple-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar size={16} className="inline mr-2" />
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar size={16} className="inline mr-2" />
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Filter size={16} className="inline mr-2" />
                            Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="paid">Paid</option>
                            <option value="verified">Verified</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Filter size={16} className="inline mr-2" />
                            District
                        </label>
                        <select
                            value={filterDistrict}
                            onChange={(e) => setFilterDistrict(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        >
                            <option value="">All Districts</option>
                            {SRI_LANKAN_DISTRICTS.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Search size={16} className="inline mr-2" />
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Name or phone..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setFilterStatus('');
                                setFilterDistrict('');
                                setSearchQuery('');
                            }}
                            className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
                {(startDate || endDate || filterStatus || filterDistrict || searchQuery) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            {startDate && endDate && (
                                <span className="mr-3">
                                    <strong>Date Range:</strong> {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                </span>
                            )}
                            {startDate && !endDate && (
                                <span className="mr-3">
                                    <strong>From:</strong> {new Date(startDate).toLocaleDateString()}
                                </span>
                            )}
                            {!startDate && endDate && (
                                <span className="mr-3">
                                    <strong>Until:</strong> {new Date(endDate).toLocaleDateString()}
                                </span>
                            )}
                            {filterStatus && (
                                <span className="mr-3">
                                    <strong>Status:</strong> {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                                </span>
                            )}
                            {filterDistrict && (
                                <span className="mr-3">
                                    <strong>District:</strong> {filterDistrict}
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Professional</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Issue Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">District</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Scheduled</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking, index) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            {booking.customerId?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {booking.professionalId?.name || 'Not Assigned'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.service}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.issueType}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.location?.district || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(booking.scheduledTime)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setViewBooking(booking)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {(booking.status === 'completed' || booking.status === 'paid') && (
                                                    <button
                                                        onClick={() => handleVerify(booking._id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Verify Booking"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Booking Modal */}
            {viewBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 animate-fadeIn">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText size={24} />
                                Booking Details
                            </h2>
                            <button
                                onClick={() => setViewBooking(null)}
                                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <Calendar size={20} className="text-purple-600" />
                                        Basic Information
                                    </h3>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Service</label>
                                        <p className="text-gray-800 font-medium">{viewBooking.service}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Issue Type</label>
                                        <p className="text-gray-800 font-medium">{viewBooking.issueType}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Description</label>
                                        <p className="text-gray-800">{viewBooking.description}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Status</label>
                                        <div className="mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewBooking.status)}`}>
                                                {viewBooking.status.charAt(0).toUpperCase() + viewBooking.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Scheduled Time</label>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <Clock size={16} />
                                            {formatDate(viewBooking.scheduledTime)}
                                        </p>
                                    </div>

                                    {viewBooking.paidAt && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Paid At</label>
                                            <p className="text-gray-800">{formatDate(viewBooking.paidAt)}</p>
                                        </div>
                                    )}

                                    {viewBooking.verifiedAt && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Verified At</label>
                                            <p className="text-gray-800">{formatDate(viewBooking.verifiedAt)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Customer & Professional Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <User size={20} className="text-purple-600" />
                                        People
                                    </h3>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Customer Name</label>
                                        <p className="text-gray-800 font-medium">{viewBooking.customerId?.name || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Customer Email</label>
                                        <p className="text-gray-800">{viewBooking.customerId?.email || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Customer Phone</label>
                                        <p className="text-gray-800">{viewBooking.customerId?.phone || 'N/A'}</p>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <label className="text-sm font-semibold text-gray-600">Professional Name</label>
                                        <p className="text-gray-800 font-medium">{viewBooking.professionalId?.name || 'Not Assigned'}</p>
                                    </div>

                                    {viewBooking.professionalId && (
                                        <>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Professional Email</label>
                                                <p className="text-gray-800">{viewBooking.professionalId?.email || 'N/A'}</p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Professional Phone</label>
                                                <p className="text-gray-800">{viewBooking.professionalId?.phone || 'N/A'}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <MapPin size={20} className="text-purple-600" />
                                        Location
                                    </h3>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">City</label>
                                        <p className="text-gray-800">{viewBooking.location?.city || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">District</label>
                                        <p className="text-gray-800">{viewBooking.location?.district || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Area</label>
                                        <p className="text-gray-800">{viewBooking.location?.area || 'N/A'}</p>
                                    </div>

                                    {viewBooking.location?.address && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Address</label>
                                            <p className="text-gray-800">{viewBooking.location.address}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Coordinates</label>
                                        <p className="text-gray-800">
                                            Lat: {viewBooking.location?.lat || 'N/A'}, Lng: {viewBooking.location?.lng || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <DollarSign size={20} className="text-purple-600" />
                                        Payment
                                    </h3>

                                    {viewBooking.payment ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Payment by User</label>
                                                <p className="text-gray-800 font-medium">
                                                    {viewBooking.payment.paymentByUser ? `Rs. ${viewBooking.payment.paymentByUser}` : 'Not Paid'}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Payment by Worker</label>
                                                <p className="text-gray-800 font-medium">
                                                    {viewBooking.payment.paymentByWorker ? `Rs. ${viewBooking.payment.paymentByWorker}` : 'Not Paid'}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">No payment information available</p>
                                    )}
                                </div>

                                {/* Client Review */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <Star size={20} className="text-purple-600" />
                                        Review for Client
                                    </h3>

                                    {viewBooking.clientReview ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Rating</label>
                                                <p className="text-gray-800 flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className={i < viewBooking.clientReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                    <span className="ml-2 font-medium">({viewBooking.clientReview.rating}/5)</span>
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Comment</label>
                                                <p className="text-gray-800">{viewBooking.clientReview.comment}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">No client review available</p>
                                    )}
                                </div>

                                {/* Worker Review */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <MessageSquare size={20} className="text-purple-600" />
                                        Review for Worker
                                    </h3>

                                    {viewBooking.workerReview ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Rating</label>
                                                <p className="text-gray-800 flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className={i < viewBooking.workerReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                    <span className="ml-2 font-medium">({viewBooking.workerReview.rating}/5)</span>
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Comment</label>
                                                <p className="text-gray-800">{viewBooking.workerReview.comment}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">No worker review available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => setViewBooking(null)}
                                className="px-6 py-2.5 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
