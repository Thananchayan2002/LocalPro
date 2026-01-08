import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    DollarSign,
    TrendingUp,
    Eye,
    X,
    Calendar,
    Clock,
    User,
    MapPin,
    Search,
    Filter,
    Download,
    CheckCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
import { SRI_LANKAN_DISTRICTS } from '../../utils/districts';

export const Payments = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewBooking, setViewBooking] = useState(null);

    const [filterDistrict, setFilterDistrict] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const COMMISSION_RATE = 0.10; // 10% commission

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE_URL}/api/bookings/all-detailed`);
            const data = await res.json();

            if (data.success) {
                const verifiedBookings = data.data.filter(booking => booking.status === 'verified');
                setBookings(verifiedBookings);
                setFilteredBookings(verifiedBookings);
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

    useEffect(() => {
        let filtered = [...bookings];

        if (filterDistrict) {
            filtered = filtered.filter(
                (booking) => booking.location?.district === filterDistrict
            );
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((booking) => {
                const customerName = booking.customerId?.name?.toLowerCase() || '';
                const customerPhone = booking.customerId?.phone?.toLowerCase() || '';
                const professionalName = booking.professionalId?.name?.toLowerCase() || '';
                const professionalPhone = booking.professionalId?.phone?.toLowerCase() || '';

                return (
                    customerName.includes(query) ||
                    customerPhone.includes(query) ||
                    professionalName.includes(query) ||
                    professionalPhone.includes(query)
                );
            });
        }

        // Filter by date range
        if (startDate || endDate) {
            filtered = filtered.filter((booking) => {
                const verifiedDate = new Date(booking.verifiedAt || booking.updatedAt);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                // Set time to start of day for start date and end of day for end date
                if (start) start.setHours(0, 0, 0, 0);
                if (end) end.setHours(23, 59, 59, 999);

                if (start && end) {
                    return verifiedDate >= start && verifiedDate <= end;
                } else if (start) {
                    return verifiedDate >= start;
                } else if (end) {
                    return verifiedDate <= end;
                }
                return true;
            });
        }

        setFilteredBookings(filtered);
    }, [bookings, filterDistrict, searchQuery, startDate, endDate]);

    const revenueStats = useMemo(() => {
        const totalRevenue = filteredBookings.reduce((sum, booking) => {
            const payment = Number(booking.payment?.paymentByWorker || 0);
            return sum + payment;
        }, 0);

        const totalCommission = filteredBookings.reduce((sum, booking) => {
            const payment = Number(booking.payment?.paymentByWorker || 0);
            return sum + (payment * COMMISSION_RATE);
        }, 0);

        const professionalEarnings = totalRevenue - totalCommission;

        return {
            totalRevenue,
            totalCommission,
            professionalEarnings,
            bookingCount: filteredBookings.length
        };
    }, [filteredBookings]);

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

    const calculateCommission = (payment) => {
        return Number(payment || 0) * COMMISSION_RATE;
    };

    return (
        <div className="min-h-screen p-4 lg:p-6">
            <Toaster
                position="top-right"
                reverseOrder={false}
                containerStyle={{ top: 80, right: 20 }}
            />

            <div className="bg-white rounded-xl shadow-md p-6 mb-6 mt-16 lg:mt-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                            <DollarSign size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Revenue & Payments</h1>
                            <p className="text-sm text-gray-600">Track all verified booking revenues and commissions</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                        <TrendingUp className="w-5 h-5 text-green-200" />
                    </div>
                    <p className="text-3xl font-bold mb-1">Rs. {revenueStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-green-100 text-xs">{revenueStats.bookingCount} verified bookings</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-100 text-sm font-medium">Platform Commission (10%)</p>
                        <DollarSign className="w-5 h-5 text-blue-200" />
                    </div>
                    <p className="text-3xl font-bold mb-1">Rs. {revenueStats.totalCommission.toLocaleString()}</p>
                    <p className="text-blue-100 text-xs">Admin earnings</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-purple-100 text-sm font-medium">Professional Earnings</p>
                        <User className="w-5 h-5 text-purple-200" />
                    </div>
                    <p className="text-3xl font-bold mb-1">Rs. {revenueStats.professionalEarnings.toLocaleString()}</p>
                    <p className="text-purple-100 text-xs">Paid to workers</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-orange-100 text-sm font-medium">Avg. Commission/Booking</p>
                        <CheckCircle className="w-5 h-5 text-orange-200" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                        Rs. {revenueStats.bookingCount > 0 ? Math.round(revenueStats.totalCommission / revenueStats.bookingCount).toLocaleString() : 0}
                    </p>
                    <p className="text-orange-100 text-xs">Per verified booking</p>
                </div>
            </div>

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
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
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
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Filter size={16} className="inline mr-2" />
                            District
                        </label>
                        <select
                            value={filterDistrict}
                            onChange={(e) => setFilterDistrict(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        >
                            <option value="">All Districts</option>
                            {SRI_LANKAN_DISTRICTS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Search size={16} className="inline mr-2" />
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Name or phone..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setFilterDistrict('');
                                setSearchQuery('');
                            }}
                            className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
                {(startDate || endDate || filterDistrict || searchQuery) && (
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
                            {filterDistrict && (
                                <span className="mr-3">
                                    <strong>District:</strong> {filterDistrict}
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Professional</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">District</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Payment</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Commission (10%)</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Verified At</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">No verified bookings found</td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking, index) => {
                                    const totalPayment = Number(booking.payment?.paymentByWorker || 0);
                                    const commission = calculateCommission(totalPayment);

                                    return (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                                {booking._id.slice(-8)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                {booking.customerId?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {booking.professionalId?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-800">{booking.service}</div>
                                                <div className="text-xs text-gray-500">{booking.issueType}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {booking.location?.district || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-800">
                                                    Rs. {totalPayment.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-green-600">
                                                    Rs. {commission.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(booking.verifiedAt || booking.updatedAt)}
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
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 animate-fadeIn">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <DollarSign size={24} />
                                Payment Details
                            </h2>
                            <button
                                onClick={() => setViewBooking(null)}
                                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <DollarSign size={20} className="text-green-600" />
                                        Financial Details
                                    </h3>

                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <label className="text-sm font-semibold text-gray-600">Total Payment</label>
                                        <p className="text-2xl font-bold text-gray-800">
                                            Rs. {Number(viewBooking.payment?.paymentByWorker || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <label className="text-sm font-semibold text-gray-600">Platform Commission (10%)</label>
                                        <p className="text-2xl font-bold text-green-600">
                                            Rs. {calculateCommission(viewBooking.payment?.paymentByWorker).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <label className="text-sm font-semibold text-gray-600">Professional Earnings (90%)</label>
                                        <p className="text-2xl font-bold text-purple-600">
                                            Rs. {(Number(viewBooking.payment?.paymentByWorker || 0) - calculateCommission(viewBooking.payment?.paymentByWorker)).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Payment Method</label>
                                        <p className="text-gray-800">{viewBooking.payment?.paymentMethod || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Verified At</label>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <Clock size={16} />
                                            {formatDate(viewBooking.verifiedAt || viewBooking.updatedAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <Calendar size={20} className="text-green-600" />
                                        Booking Information
                                    </h3>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Booking ID</label>
                                        <p className="text-gray-800 font-mono">{viewBooking._id}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Service</label>
                                        <p className="text-gray-800 font-medium">{viewBooking.service}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Issue Type</label>
                                        <p className="text-gray-800">{viewBooking.issueType}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Description</label>
                                        <p className="text-gray-800">{viewBooking.description}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Scheduled Time</label>
                                        <p className="text-gray-800">{formatDate(viewBooking.scheduledTime)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <User size={20} className="text-green-600" />
                                        Customer Details
                                    </h3>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Name</label>
                                        <p className="text-gray-800 font-medium">{viewBooking.customerId?.name || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Email</label>
                                        <p className="text-gray-800">{viewBooking.customerId?.email || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Phone</label>
                                        <p className="text-gray-800">{viewBooking.customerId?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <User size={20} className="text-green-600" />
                                        Professional Details
                                    </h3>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Name</label>
                                        <p className="text-gray-800 font-medium">{viewBooking.professionalId?.name || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Email</label>
                                        <p className="text-gray-800">{viewBooking.professionalId?.email || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Phone</label>
                                        <p className="text-gray-800">{viewBooking.professionalId?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <MapPin size={20} className="text-green-600" />
                                        Location
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-semibold text-gray-600">Address</label>
                                                <p className="text-gray-800">{viewBooking.location.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

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
