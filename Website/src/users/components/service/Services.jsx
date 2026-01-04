import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
const {
  Search, Loader, AlertTriangle, DollarSign, 
  Briefcase, ChevronRight, ArrowLeft, X
} = LucideIcons;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // Get icon component dynamically
  const getIconComponent = (iconName) => {
    if (!iconName) return Briefcase;
    const IconComponent = LucideIcons[iconName];
    return IconComponent || Briefcase;
  };

  // Fetch services and issues
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuesForService = async (serviceId) => {
    try {
      setLoadingIssues(true);
      const response = await fetch(`${API_BASE_URL}/api/issues?serviceId=${serviceId}&limit=1000`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setIssues(data.data || []);
      } else {
        console.error('Failed to fetch issues:', data.message);
        setIssues([]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
    } finally {
      setLoadingIssues(false);
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowModal(true);
    fetchIssuesForService(service._id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setIssues([]);
  };

  const filteredServices = services.filter(service =>
    service.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIssues = issues.filter(issue =>
    issue.issueName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Services</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchServices}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Services
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Browse {services.length} professional services with verified professionals
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services Grid */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Available Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No services found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const IconComponent = getIconComponent(service.iconName);
                return (
                  <div
                    key={service._id}
                    onClick={() => handleServiceClick(service)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {service.service}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        View Issues & Pricing
                      </span>
                      <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trust Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Services?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {(() => {
                const Shield = LucideIcons['Shield'];
                const Award = LucideIcons['Award'];
                const ThumbsUp = LucideIcons['ThumbsUp'];
                return (
                  <>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Verified & Safe</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">All professionals are background checked</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Quality Guaranteed</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">We stand behind every job completed</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ThumbsUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Transparent Pricing</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Clear pricing with no hidden charges</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Issues Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const IconComponent = getIconComponent(selectedService.iconName);
                    return (
                      <div className="p-3 bg-white/10 rounded-xl">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-3xl font-bold mb-1">{selectedService.service}</h2>
                    <p className="text-blue-100">{selectedService.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingIssues ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Issues Available
                  </h3>
                  <p className="text-gray-500">No issues found for this service.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {issues.length} issue{issues.length !== 1 ? 's' : ''} & service{issues.length !== 1 ? 's' : ''} available
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map((issue) => (
                      <div
                        key={issue._id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {issue.issueName}
                          </h3>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-2xl font-bold">₹{issue.basicCost?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Base price - Final cost may vary
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            handleCloseModal();
                            navigate('/professionals');
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                        >
                          Book Service
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

   