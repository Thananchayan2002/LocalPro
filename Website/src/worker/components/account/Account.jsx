import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, User, Mail, Phone, MapPin, Shield, Briefcase, Navigation, Star, Trophy, Layers } from 'lucide-react';

export const Account = () => {
    const { user, token } = useAuth();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [professionalData, setProfessionalData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
   
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
            </div>
        </div>
    );
};
