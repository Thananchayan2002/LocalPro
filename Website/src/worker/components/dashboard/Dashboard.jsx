import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Calendar, DollarSign, CheckCircle, Clock, 
    TrendingUp, AlertCircle, Users, Briefcase, Star, Loader, ArrowRight,
    User, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const Dashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        pendingPayments: 0,
        pendingCommission: 0,
        totalEarnings: 0,
        paidAmount: 0,
        averageRating: 0,
        todayBookings: 0
    });
    const [pendingBookings, setPendingBookings] = useState([]);
    const [userWithService, setUserWithService] = useState(null);
    const [todayTasks, setTodayTasks] = useState([]);
    const [tomorrowTasks, setTomorrowTasks] = useState([]);

    // Fetch professional details
    useEffect(() => {
        if (!user) return;

        const fetchProfessionalData = async () => {
            try {
                if (!user?.professionalId && !user?.phone) {
                    setUserWithService(user);
                    return;
                }

                let professionalData = null;

                // Try by professionalId first
                if (user?.professionalId) {
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/professionals/${user.professionalId}`, { 
                            headers: getAuthHeaders() 
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
                if (!professionalData && user?.phone) {
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/professionals?search=${encodeURIComponent(user.phone)}`, { 
                            headers: getAuthHeaders() 
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
                    const serviceName = professionalData.serviceId?.service || professionalData.service;
                    setUserWithService({
                        ...user,
                        service: serviceName,
                        district: professionalData.district
                    });
                } else {
                    setUserWithService(user);
                }
            } catch (err) {
                console.error('Error loading professional data:', err);
                setUserWithService(user);
            }
        };

        fetchProfessionalData();
    }, [user?.professionalId, user?.phone, user, token]);

    useEffect(() => {
        fetchDashboardData();
        fetchAssignedTasks();
    }, []);

    // Fetch pending bookings (requested status matching service and district)
    useEffect(() => {
        if (!userWithService || !userWithService.service || !userWithService.district) return;

        const fetchPendingBookings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/bookings/all?status=requested`, {
                    headers: getAuthHeaders()
                });

                const data = await response.json();

                if (data.success) {
                    const allBookings = Array.isArray(data.bookings) ? data.bookings : Array.isArray(data.data) ? data.data : [];
                    const filtered = allBookings.filter(booking => {
                        return (
                            booking.status === 'requested' &&
                            booking.service === userWithService.service &&
                            booking.location?.district === userWithService.district
                        );
                    });
                    // Show up to 5 pending bookings
                    setPendingBookings(filtered.slice(0, 5));
                }
            } catch (err) {
                console.error('Error fetching pending bookings:', err);
            }
        };

        fetchPendingBookings();
    }, [userWithService?.service, userWithService?.district, token]);

    // WebSocket connection for real-time bookings
    useEffect(() => {
        if (!userWithService || !userWithService.service || !userWithService.district) return;

        const socket = io(API_BASE_URL);

        socket.on('connect', () => {
            console.log('Dashboard WebSocket connected:', socket.id);
        });

        socket.on('newBooking', (data) => {
            console.log('New booking received via WebSocket:', data);
            
            // Check if this booking matches professional's service and district
            const booking = data.booking;
            if (
                booking.status === 'requested' &&
                booking.service === userWithService.service &&
                booking.location?.district === userWithService.district
            ) {
                console.log('Adding new matching booking to dashboard');
                setPendingBookings(prevBookings => {
                    // Check if booking already exists
                    const exists = prevBookings.some(b => b._id === booking._id);
                    if (exists) return prevBookings;
                    // Add to beginning and limit to 5
                    return [booking, ...prevBookings].slice(0, 5);
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('Dashboard WebSocket disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, [userWithService?.service, userWithService?.district]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/api/bookings/professional-bookings`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                const bookings = data.bookings || [];
                
                // Calculate statistics
                const totalBookings = bookings.length;
                const activeBookings = bookings.filter(b => 
                    ['assigned', 'inspecting', 'approved', 'inProgress'].includes(b.status)
                ).length;
                const completedBookings = bookings.filter(b => 
                    ['completed', 'paid', 'verified'].includes(b.status)
                ).length;
                const pendingPayments = bookings.filter(b => b.status === 'completed').length;
                
                // Calculate pending commission (10% of completed but unpaid bookings)
                const pendingCommission = bookings
                    .filter(b => b.status === 'completed')
                    .reduce((sum, b) => sum + (Number(b.payment?.paymentByWorker) || 0), 0) * 0.1;
                
                // Calculate earnings
                const totalEarnings = bookings
                    .filter(b => ['completed', 'paid', 'verified'].includes(b.status))
                    .reduce((sum, b) => sum + (Number(b.payment?.paymentByWorker) || 0), 0);
                
                const paidAmount = bookings
                    .filter(b => ['paid', 'verified'].includes(b.status))
                    .reduce((sum, b) => sum + (Number(b.payment?.paymentByWorker) || 0), 0);

                // Calculate average rating
                const ratingsArray = bookings
                    .filter(b => b.workerReview?.rating)
                    .map(b => b.workerReview.rating);
                const averageRating = ratingsArray.length > 0
                    ? (ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length).toFixed(1)
                    : 0;

                // Today's bookings
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayBookings = bookings.filter(b => {
                    const scheduledDate = new Date(b.scheduledTime);
                    scheduledDate.setHours(0, 0, 0, 0);
                    return scheduledDate.getTime() === today.getTime();
                }).length;

                setStats({
                    totalBookings,
                    activeBookings,
                    completedBookings,
                    pendingPayments,
                    pendingCommission,
                    totalEarnings,
                    paidAmount,
                    averageRating,
                    todayBookings
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/professional-bookings`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                const bookings = data.bookings || [];
                
                // Get today's date at midnight
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Get tomorrow's date at midnight
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                // Get the day after tomorrow for upper bound
                const dayAfterTomorrow = new Date(tomorrow);
                dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
                
                // Filter assigned tasks for today
                const todayAssigned = bookings.filter(booking => {
                    const scheduledDate = new Date(booking.scheduledTime);
                    scheduledDate.setHours(0, 0, 0, 0);
                    return (
                        scheduledDate.getTime() === today.getTime() &&
                        ['assigned', 'inspecting', 'approved', 'inProgress'].includes(booking.status)
                    );
                });
                
                // Filter assigned tasks for tomorrow
                const tomorrowAssigned = bookings.filter(booking => {
                    const scheduledDate = new Date(booking.scheduledTime);
                    scheduledDate.setHours(0, 0, 0, 0);
                    return (
                        scheduledDate.getTime() === tomorrow.getTime() &&
                        ['assigned', 'inspecting', 'approved', 'inProgress'].includes(booking.status)
                    );
                });
                
                setTodayTasks(todayAssigned);
                setTomorrowTasks(tomorrowAssigned);
            }
        } catch (error) {
            console.error('Error fetching assigned tasks:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            requested: 'bg-yellow-100 text-yellow-800',
            assigned: 'bg-blue-100 text-blue-800',
            inspecting: 'bg-purple-100 text-purple-800',
            approved: 'bg-green-100 text-green-800',
            inProgress: 'bg-orange-100 text-orange-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            paid: 'bg-teal-100 text-teal-800',
            verified: 'bg-indigo-100 text-indigo-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white mt-16">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
                        <p className="text-blue-100">Here's your performance overview</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Bookings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.totalBookings}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Active Bookings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.activeBookings}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Completed Bookings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.completedBookings}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Earnings */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-8 h-8" />
                        <div>
                            <p className="text-green-100 text-sm">Total Earnings</p>
                            <p className="text-3xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Pending Commission */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-8 h-8" />
                        <div>
                            <p className="text-orange-100 text-sm">Pending Commission (10%)</p>
                            <p className="text-3xl font-bold">₹{stats.pendingCommission.toLocaleString()}</p>
                            <p className="text-orange-200 text-xs mt-1">{stats.pendingPayments} booking{stats.pendingPayments !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Pending Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            Current Pending Bookings
                        </h3>
                        <button
                            onClick={() => navigate('/worker/notifications')}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            View More
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {pendingBookings.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                No pending bookings available
                            </p>
                        ) : (
                            pendingBookings.map((booking) => (
                                <div 
                                    key={booking._id}
                                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {booking.service} - {booking.issueType}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {booking.customerId?.name} • {booking.location?.district} • {formatDate(booking.scheduledTime)}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            {/* Today's Assigned Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        Today's Assigned Tasks
                    </h3>
                    <button
                        onClick={() => navigate('/worker/bookings')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-3">
                    {todayTasks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No tasks assigned for today
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {todayTasks.map((booking) => (
                                <div 
                                    key={booking._id}
                                    className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {booking.service}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {booking.issueType}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            <span>{booking.customerId?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(booking.scheduledTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            <span>{booking.location?.city}, {booking.location?.district}</span>
                                        </div>
                                        {booking.payment?.paymentByWorker && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-3 h-3" />
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    ₹{booking.payment.paymentByWorker}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tomorrow's Assigned Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Tomorrow's Assigned Tasks
                    </h3>
                    <button
                        onClick={() => navigate('/worker/bookings')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-3">
                    {tomorrowTasks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No tasks assigned for tomorrow
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tomorrowTasks.map((booking) => (
                                <div 
                                    key={booking._id}
                                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {booking.service}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {booking.issueType}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            <span>{booking.customerId?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(booking.scheduledTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            <span>{booking.location?.city}, {booking.location?.district}</span>
                                        </div>
                                        {booking.payment?.paymentByWorker && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-3 h-3" />
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    ₹{booking.payment.paymentByWorker}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
