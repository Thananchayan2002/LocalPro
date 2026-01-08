import React, { useEffect, useState } from 'react';
import { X, MapPin, Phone, Star, Briefcase, User, Navigation, Loader, Mail } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

// Calculate distance using Haversine formula (in km)
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

export const ProfessionalsModal = ({ booking, onClose }) => {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
                setLoading(true);
                // Fetch all professionals with the same service and district, status accepted
                const res = await fetchWithAuth(
                    `${API_BASE_URL}/api/professionals?status=accepted`
                );
                const data = await res.json();

                if (data.success) {
                    // Filter by service and district
                    let filtered = (data.data || []).filter(
                        (prof) =>
                            prof.serviceId?.service === booking.service &&
                            prof.district === booking.location?.district
                    );

                    // Calculate distance for each professional if coordinates are available
                    if (booking.location?.lat && booking.location?.lng) {
                        filtered = filtered.map((prof) => {
                            let distance = null;
                            if (prof.lat && prof.lng) {
                                distance = calculateDistance(
                                    booking.location.lat,
                                    booking.location.lng,
                                    prof.lat,
                                    prof.lng
                                );
                            }
                            return { ...prof, distance };
                        });

                        // Sort by distance (closest first)
                        filtered.sort((a, b) => {
                            if (a.distance === null) return 1;
                            if (b.distance === null) return -1;
                            return a.distance - b.distance;
                        });
                    }

                    setProfessionals(filtered);
                }
            } catch (error) {
                console.error('Error fetching professionals:', error);
            } finally {
                setLoading(false);
            }
        };

        if (booking) {
            fetchProfessionals();
        }
    }, [booking]);

    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="text-white">
                        <h2 className="text-xl font-bold">Available Professionals</h2>
                        <p className="text-sm text-purple-100">
                            {booking.service} • {booking.location?.district}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Booking Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Job Location</h3>
                        <div className="flex items-start gap-2 text-sm text-blue-800">
                            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{booking.location?.address || 'N/A'}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 animate-spin text-purple-600" />
                            <span className="ml-3 text-gray-600">Loading professionals...</span>
                        </div>
                    ) : professionals.length === 0 ? (
                        <div className="text-center py-12">
                            <User size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-600 font-medium">No professionals found</p>
                            <p className="text-sm text-gray-500 mt-1">
                                No accepted professionals available for {booking.service} in {booking.location?.district}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-200">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                                            Professional
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                                            Distance
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                                            Experience
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {professionals.map((prof) => (
                                        <tr key={prof._id} className="hover:bg-purple-50/50 transition">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    {prof.profileImage ? (
                                                        <img
                                                            src={`${API_BASE_URL}/${prof.profileImage}`}
                                                            alt={prof.name}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <User size={24} className="text-purple-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{prof.name}</p>
                                                        <p className="text-xs text-gray-500">NIC: {prof.nicNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone size={14} className="text-purple-600" />
                                                        <span className="text-gray-900">{prof.phone}</span>
                                                    </div>
                                                    {prof.email && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail size={14} className="text-purple-600" />
                                                            <span className="text-gray-600 truncate max-w-[200px]">{prof.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-start gap-2 max-w-[250px]">
                                                    <MapPin size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700 line-clamp-2">{prof.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {prof.distance !== null ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                        <Navigation size={12} />
                                                        {prof.distance.toFixed(1)} km
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No data</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Briefcase size={14} className="text-purple-600" />
                                                    <span className="font-medium text-gray-900">{prof.experience} yrs</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="font-semibold text-gray-900">{prof.rating || 4}</span>
                                                    <span className="text-xs text-gray-500">({prof.totalJobs || 0})</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    prof.isAvailable 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {prof.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Found <span className="font-semibold text-purple-600">{professionals.length}</span> professional(s)
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
