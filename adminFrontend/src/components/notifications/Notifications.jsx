import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    Filter,
    MapPin,
    Search,
    User,
    X
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
import { SRI_LANKAN_DISTRICTS } from '../../utils/districts';
import { ProfessionalsModal } from './ProfessionalsModal';

export const Notifications = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewBooking, setViewBooking] = useState(null);
    const [professionalsModalBooking, setProfessionalsModalBooking] = useState(null);

    const [filterDistrict, setFilterDistrict] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Get current Sri Lankan time (UTC+5:30)
    const getSriLankanTime = () => {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const sriLankanOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
        return new Date(utcTime + sriLankanOffset);
    };

    const isOverdue = (createdAt) => {
        if (!createdAt) return false;
        const createdTime = new Date(createdAt).getTime();
        const sriLankanNow = getSriLankanTime().getTime();
        return sriLankanNow > createdTime + 30 * 60 * 1000;
    };

    const minutesSinceCreated = (createdAt) => {
        if (!createdAt) return 'N/A';
        const createdTime = new Date(createdAt).getTime();
        const sriLankanNow = getSriLankanTime().getTime();
        const diff = Math.max(0, sriLankanNow - createdTime);
        return Math.floor(diff / 60000);
    };

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

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE_URL}/api/bookings/all-detailed`);
            const data = await res.json();

            if (data.success) {
                const overdueRequested = (data.data || []).filter(
                    (booking) => booking.status === 'requested' && isOverdue(booking.createdAt)
                );
                setBookings(overdueRequested);
                setFilteredBookings(overdueRequested);
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

        setFilteredBookings(filtered);
    }, [bookings, filterDistrict, searchQuery]);

    const statCards = useMemo(() => {
        const total = bookings.length;
        const over60 = bookings.filter(
            (b) => minutesSinceCreated(b.createdAt) >= 60
        ).length;
        return { total, over60 };
    }, [bookings]);

    return (
        <div className="min-h-screen p-4 lg:p-6">
            <Toaster
                position="top-right"
                reverseOrder={false}
                containerStyle={{ top: 80, right: 20 }}
            />

            <div className="bg-white rounded-xl shadow-md p-6 mb-6 mt-16 lg:mt-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                        <Bell size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Overdue Requested Bookings</h1>
                        <p className="text-sm text-gray-600">Requests pending more than 30 minutes</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Total overdue requests</p>
                    <p className="text-2xl font-bold text-gray-800">{statCards.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Waiting 60+ mins</p>
                    <p className="text-2xl font-bold text-gray-800">{statCards.over60}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Filter size={16} className="inline mr-2" />
                            Filter by District
                        </label>
                        <select
                            value={filterDistrict}
                            onChange={(e) => setFilterDistrict(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
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
                            Search by Name or Phone
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter customer/professional name or phone..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Issue Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">District</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Scheduled</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Waiting (mins)</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">No overdue requested bookings found</td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking, index) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            {booking.customerId?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.service}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.issueType}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.location?.district || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(booking.createdAt)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(booking.scheduledTime)}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-amber-700">{minutesSinceCreated(booking.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setProfessionalsModalBooking(booking)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Check Professionals"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 animate-fadeIn">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Bell size={24} />
                                Booking Details
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
                                        <Calendar size={20} className="text-purple-600" />
                                        Booking Info
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
                                        <label className="text-sm font-semibold text-gray-600">Created At</label>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <Clock size={16} />
                                            {formatDate(viewBooking.createdAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Waiting Time</label>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <Clock size={16} />
                                            {minutesSinceCreated(viewBooking.createdAt)} minutes
                                        </p>
                                    </div>
                                </div>

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

                                <div className="space-y-4 lg:col-span-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                        <MapPin size={20} className="text-purple-600" />
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

                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Coordinates</label>
                                            <p className="text-gray-800">Lat: {viewBooking.location?.lat || 'N/A'}, Lng: {viewBooking.location?.lng || 'N/A'}</p>
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

            {/* Professionals Modal */}
            {professionalsModalBooking && (
                <ProfessionalsModal
                    booking={professionalsModalBooking}
                    onClose={() => setProfessionalsModalBooking(null)}
                />
            )}
        </div>
    );
};
