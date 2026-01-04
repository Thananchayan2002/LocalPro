import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
const { 
  Search, Filter, Star, MapPin, Briefcase, Award, 
  Clock, CheckCircle, Users, Phone, Mail, MessageSquare,
  ChevronRight, X, Sparkles, Shield, Award: AwardIcon,
  ThumbsUp, Calendar, ArrowRight, Download, Loader
} = LucideIcons;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const Professionals = () => {
  const [selectedService, setSelectedService] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const sriLankaDistricts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  // Map icon names to Lucide icon components dynamically
  const getIconComponent = (iconName) => {
    if (!iconName) return Briefcase;
    const IconComponent = LucideIcons[iconName];
    return IconComponent || Briefcase;
  };

  // Generate service categories dynamically from services state
  const serviceCategories = [
    { id: 'all', name: 'All Professionals', icon: Briefcase, count: professionals.length },
    ...services.map(service => ({
      id: service._id,
      name: service.service,
      icon: getIconComponent(service.iconName),
      count: professionals.filter(p => p.serviceId?._id === service._id).length
    }))
  ];

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/professionals?status=accepted&limit=1000`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setProfessionals(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch professionals');
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setError('Failed to load professionals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.data || []);
        console.log('Services fetched:', data.data);
      } else {
        console.error('Failed to fetch services:', data.message);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchReviews = async (professionalPhone) => {
    try {
      setLoadingReviews(true);
      setReviews([]);
      
      // First, find the User ID by phone number
      const userResponse = await fetch(`${API_BASE_URL}/api/auth/user/phone/${professionalPhone}`, {
        headers: getAuthHeaders()
      });
      const userData = await userResponse.json();
      
      if (!userData.success || !userData.data) {
        console.log('No user found for phone:', professionalPhone);
        setLoadingReviews(false);
        return;
      }
      
      const userId = userData.data._id;
      console.log('Found user ID:', userId);
      
      // Now fetch reviews using the User ID
      const reviewsResponse = await fetch(`${API_BASE_URL}/api/reviews/professional/${userId}`, {
        headers: getAuthHeaders()
      });
      const reviewsData = await reviewsResponse.json();
      
      if (reviewsData.success) {
        setReviews(reviewsData.reviews || []);
        console.log('Reviews fetched:', reviewsData.reviews);
      } else {
        console.error('Failed to fetch reviews:', reviewsData.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };



  const filteredProfessionals = professionals.filter(professional => {
    const matchesService = selectedService === 'all' || professional.serviceId?._id === selectedService;
    const matchesDistrict = selectedDistrict === 'all' || professional.district === selectedDistrict;
    const matchesSearch = professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (professional.serviceId?.service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (professional.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesDistrict && matchesSearch;
  });

  const openProfessionalModal = (professional) => {
    setSelectedProfessional(professional);
    setShowReviews(false);
    setReviews([]);
    // Fetch reviews using professional's phone number
    if (professional.phone) {
      fetchReviews(professional.phone);
    }
  };

  const closeModal = () => {
    setSelectedProfessional(null);
    setShowReviews(false);
    setReviews([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Verified Professionals</h1>
            <p className="text-xl text-blue-100 mb-8">
              Connect with trusted professionals in your area. All verified and background checked.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search professionals by name, service, or location..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* Service Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Service Category</h2>
                </div>
                
                <div className="space-y-2">
                  {serviceCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedService(category.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedService === category.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium flex-1 text-left">{category.name}</span>
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* District Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">District</h2>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  <button
                    onClick={() => setSelectedDistrict('all')}
                    className={`w-full p-3 rounded-lg transition-colors text-left ${
                      selectedDistrict === 'all'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All Districts
                  </button>
                  
                  {sriLankaDistricts.map((district) => (
                    <button
                      key={district}
                      onClick={() => setSelectedDistrict(district)}
                      className={`w-full p-3 rounded-lg transition-colors text-left ${
                        selectedDistrict === district
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Professionals</span>
                    <span className="font-bold">{professionals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Verified</span>
                    <span className="font-bold text-green-600">
                      {professionals.length > 0 ? Math.round((professionals.filter(p => p.status === 'accepted').length / professionals.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Rating</span>
                    <span className="font-bold text-yellow-600">
                      {professionals.length > 0 ? (professionals.reduce((sum, p) => sum + (p.rating || 0), 0) / professionals.length).toFixed(1) : '0'} ★
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Jobs Completed</span>
                    <span className="font-bold">
                      {professionals.reduce((sum, p) => sum + (p.totalJobs || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Professionals Grid */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verified Professionals
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredProfessionals.length} professionals found
                  {selectedService !== 'all' && ` in ${serviceCategories.find(s => s.id === selectedService)?.name}`}
                  {selectedDistrict !== 'all' && ` from ${selectedDistrict}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedService('all');
                    setSelectedDistrict('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>



            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading professionals...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center">
                <X className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-2">
                  {error}
                </h3>
                <button
                  onClick={fetchProfessionals}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No professionals found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProfessionals.map((professional) => (
                  <div
                    key={professional._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      {/* Professional Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={
                            professional.profileImage?.trim()
                              ? `${import.meta.env.VITE_API_BASE_URL}/${professional.profileImage}`
                              : `https://api.dicebear.com/7.x/initials/svg?seed=${professional.name}`
                          }
                          alt={professional.name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-blue-100 dark:border-blue-900"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                {professional.name}
                                {professional.status === 'accepted' && (
                                  <Shield className="inline ml-2 w-4 h-4 text-green-600" />
                                )}
                              </h3>
                              <p className="text-blue-600 dark:text-blue-400 font-medium">
                                {professional.serviceId?.service || 'Professional'}
                              </p>
                            </div>
                            {professional.isAvailable && (
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                Available
                              </span>
                            )}
                          </div>
                          
                          {/* Rating & Location */}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 font-medium">{professional.rating || 4}</span>
                              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                                ({professional.totalJobs || 0} jobs)
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span className="ml-1 text-sm">{professional.district}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location Info */}
                      <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {professional.location}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {professional.experience} years experience
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedService === 'all' ? professional.serviceId?.service : professional.district}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => openProfessionalModal(professional)}
                          className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl">
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Why Choose Our Professionals?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Verified & Safe</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">All professionals are background checked</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AwardIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Quality Guaranteed</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">We stand behind every job completed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ThumbsUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Customer Reviews</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Real feedback from thousands of customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Details Modal */}
      {selectedProfessional && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProfessional.name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400">{selectedProfessional.serviceId?.service || 'Professional'}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Overview */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-1/3">
                  <img
                      src={
                        selectedProfessional.profileImage?.trim()
                          ? `${import.meta.env.VITE_API_BASE_URL}/${selectedProfessional.profileImage}`
                          : `https://api.dicebear.com/7.x/initials/svg?seed=${selectedProfessional.name}`
                      }
                    alt={selectedProfessional.name}
                    className="w-48 h-48 rounded-2xl object-cover border-4 border-blue-100 dark:border-blue-900 mx-auto"
                  />
                  <div className="text-center mt-4 space-y-3">
                    {selectedProfessional.status === 'accepted' && (
                      <div className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-semibold flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        Verified Professional
                      </div>
                    )}
                    {selectedProfessional.isAvailable && (
                      <div className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-semibold">
                        Available Now
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedProfessional.rating || 4}
                      </div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(selectedProfessional.rating || 4) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProfessional.totalJobs || 0} jobs completed
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedProfessional.experience}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Years Experience</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        <MapPin className="inline w-5 h-5 mb-1" /> {selectedProfessional.district}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">District</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-xl font-bold text-green-600 mb-1">
                        {selectedProfessional.isAvailable ? 'Available' : 'Not Available'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Availability</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Professional Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Service</div>
                          <div className="text-gray-600 dark:text-gray-400">{selectedProfessional.serviceId?.service || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Location</div>
                          <div className="text-gray-600 dark:text-gray-400">{selectedProfessional.location}</div>
                        </div>
                      </div>
                      {selectedProfessional.serviceId?.description && (
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">Service Description</div>
                            <div className="text-gray-600 dark:text-gray-400">{selectedProfessional.serviceId.description}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Customer Feedback ({reviews.length})
                  </h3>
                  {reviews.length > 0 && (
                    <button
                      onClick={() => setShowReviews(!showReviews)}
                      className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2"
                    >
                      {showReviews ? 'Hide Reviews' : 'Show All Reviews'}
                      <ChevronRight className={`w-4 h-4 transition-transform ${showReviews ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Reviews Display */}
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews yet</p>
                    <p className="text-sm mt-1">Be the first to book and review this professional!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show all reviews if showReviews is true, otherwise just first review */}
                    {(showReviews ? reviews : reviews.slice(0, 1)).map((review) => (
                      <div key={review._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {review.customerId?.name || 'Customer'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {review.bookingId?.service || 'Service'} • {review.bookingId?.issueType || ''}
                              {review.createdAt && ` • ${new Date(review.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};