import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, User, Mail, Phone, MapPin, Shield, Briefcase, Navigation, Star, Trophy, Layers } from 'lucide-react';

export const Account = () => {
    const { user, token } = useAuth();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [professionalData, setProfessionalData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [passwords, setPasswords] = useState({ 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
    });
    const [showPasswords, setShowPasswords] = useState({ 
        current: false, 
        new: false, 
        confirm: false 
    });
    const [loading, setLoading] = useState(false);

    // Fetch professional details by professionalId
    useEffect(() => {
        const fetchProfessionalData = async () => {
            if (!user?.professionalId && !user?.phone) {
                setLoadingProfile(false);
                return;
            }

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Try by professionalId first
            if (user?.professionalId) {
                try {
                    const res = await fetch(`${apiUrl}/api/professionals/${user.professionalId}`, { headers });
                    const data = await res.json();

                    if (data.success) {
                        setProfessionalData(data.data);
                        setLoadingProfile(false);
                        return;
                    }
                } catch (error) {
                    console.error('Failed to fetch professional by id:', error);
                }
            }

            // Fallback: lookup by phone using search filter
            try {
                const res = await fetch(`${apiUrl}/api/professionals?search=${encodeURIComponent(user.phone)}`, { headers });
                const data = await res.json();
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setProfessionalData(data.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch professional by phone:', error);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfessionalData();
    }, [user?.professionalId, user?.phone, token, apiUrl]);

    const handlePasswordsChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const resetPasswords = () => {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswords({ current: false, new: false, confirm: false });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            toast.error('All password fields are required', {
                icon: '⚠️',
                style: {
                    borderRadius: '12px',
                    background: '#f59e0b',
                    color: '#fff',
                    fontWeight: '600',
                },
            });
            setLoading(false);
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match', {
                icon: '⚠️',
                style: {
                    borderRadius: '12px',
                    background: '#f59e0b',
                    color: '#fff',
                    fontWeight: '600',
                },
            });
            setLoading(false);
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters', {
                icon: '⚠️',
                style: {
                    borderRadius: '12px',
                    background: '#f59e0b',
                    color: '#fff',
                    fontWeight: '600',
                },
            });
            setLoading(false);
            return;
        }

        if (passwords.currentPassword === passwords.newPassword) {
            toast.error('New password must be different from current password', {
                icon: '⚠️',
                style: {
                    borderRadius: '12px',
                    background: '#f59e0b',
                    color: '#fff',
                    fontWeight: '600',
                },
            });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/api/worker/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update password');
            }

            toast.success('Password updated successfully!', {
                icon: '🎉',
                style: {
                    borderRadius: '12px',
                    background: '#10b981',
                    color: '#fff',
                    fontWeight: '600',
                },
                duration: 4000,
            });
            resetPasswords();
        } catch (err) {
            toast.error(err.message, {
                icon: '❌',
                style: {
                    borderRadius: '12px',
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: '600',
                },
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
            <Toaster position="top-right" />
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-10 mb-16 lg:mb-8">
                    
                </div>

                {/* Profile Card */}
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg mb-8">
                    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Profile Information</p>
                                <h2 className="text-2xl font-bold text-gray-900 mt-1">{professionalData?.name || user?.name || 'N/A'}</h2>
                                <p className="text-sm text-gray-600">Username: {professionalData?.username || user?.phone || 'N/A'}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm border ${
                                (professionalData?.status || user?.status) === 'accepted'
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : (professionalData?.status || user?.status) === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {professionalData?.status || user?.status || 'N/A'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <User className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
                                    <p className="text-gray-900 font-semibold">{professionalData?.name || user?.name || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                                    <p className="text-gray-900 font-semibold break-all">{professionalData?.email || user?.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                                    <p className="text-gray-900 font-semibold">{professionalData?.phone || user?.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <MapPin className="w-5 h-5 text-rose-600 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">District</p>
                                    <p className="text-gray-900 font-semibold">{professionalData?.district || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <Navigation className="w-5 h-5 text-sky-600 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Location</p>
                                    <p className="text-gray-900 font-semibold">{professionalData?.location || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <Briefcase className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Service</p>
                                    <p className="text-gray-900 font-semibold break-all">{professionalData?.serviceId?.service || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Rating</p>
                                    <p className="text-gray-900 font-semibold">{professionalData?.rating ?? 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <Trophy className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Jobs Completed</p>
                                    <p className="text-gray-900 font-semibold">{professionalData?.totalJobs ?? 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <Layers className="w-5 h-5 text-indigo-500 mt-0.5" />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Registration Method</p>
                                    <p className="text-gray-900 font-semibold capitalize">{professionalData?.way || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50 sm:col-span-2">
                                <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Username</p>
                                        <p className="text-gray-900 font-semibold break-all">{professionalData?.username || user?.phone || 'N/A'}</p>
                                    </div>
                                    <div className="mt-2 sm:mt-0 flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                        Secure login enabled
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-purple-600" />
                        Change Password
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordsChange}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordsChange}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordsChange}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                            <button
                                type="button"
                                onClick={resetPasswords}
                                disabled={loading}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
