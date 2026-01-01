import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as LucideIcons from 'lucide-react';
const { Wrench, AlertTriangle, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } = LucideIcons;
import { API_BASE_URL } from '../../utils/api';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
 
export const Services = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState('services');

    // Services state
    const [services, setServices] = useState([]);
    const [serviceForm, setServiceForm] = useState({ service: '', description: '', iconName: '' });
    const [editingService, setEditingService] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [deleteServiceId, setDeleteServiceId] = useState(null);

    // Issues state
    const [issues, setIssues] = useState([]);
    const [issueForm, setIssueForm] = useState({ serviceId: '', issueName: '', basicCost: '' });
    const [editingIssue, setEditingIssue] = useState(null);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [deleteIssueId, setDeleteIssueId] = useState(null);

    // Pagination and filter state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterServiceId, setFilterServiceId] = useState('');

    // Loading state
    const [loading, setLoading] = useState(false);

    const renderIcon = (iconName, size = 20) => {
        const IconComponent = iconName && LucideIcons[iconName] ? LucideIcons[iconName] : Wrench;
        return <IconComponent size={size} className="text-purple-600" />;
    };

    // Fetch services
    const fetchServices = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/services`);
            const data = await res.json();
            if (data.success) {
                setServices(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch services');
        }
    };

    // Fetch issues with pagination and filter
    const fetchIssues = async (page = 1, serviceId = '') => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/issues?page=${page}&limit=10`;
            if (serviceId) {
                url += `&serviceId=${serviceId}`;
            }

            const res = await fetchWithAuth(url);
            const data = await res.json();
            if (data.success) {
                setIssues(data.data);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            }
        } catch (error) {
            toast.error('Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        if (activeTab === 'issues') {
            fetchIssues(currentPage, filterServiceId);
        }
    }, [activeTab]);

    // Service handlers
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingService
                ? `${API_BASE_URL}/api/services/${editingService._id}`
                : `${API_BASE_URL}/api/services`;

            const method = editingService ? 'PUT' : 'POST';

            const res = await fetchWithAuth(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceForm)
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                setServiceForm({ service: '', description: '', iconName: '' });
                setEditingService(null);
                setShowServiceModal(false);
                fetchServices();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (id) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/services/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                setDeleteServiceId(null);
                fetchServices();
                if (activeTab === 'issues') {
                    fetchIssues(currentPage, filterServiceId);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    // Issue handlers
    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingIssue
                ? `${API_BASE_URL}/api/issues/${editingIssue._id}`
                : `${API_BASE_URL}/api/issues`;

            const method = editingIssue ? 'PUT' : 'POST';

            const res = await fetchWithAuth(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(issueForm)
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                setIssueForm({ serviceId: '', issueName: '', basicCost: '' });
                setEditingIssue(null);
                setShowIssueModal(false);
                fetchIssues(currentPage, filterServiceId);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIssue = async (id) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/issues/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                setDeleteIssueId(null);
                fetchIssues(currentPage, filterServiceId);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (serviceId) => {
        setFilterServiceId(serviceId);
        setCurrentPage(1);
        fetchIssues(1, serviceId);
    };

    const handlePageChange = (page) => {
        fetchIssues(page, filterServiceId);
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

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2 mt-16 lg:mt-8">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'services'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Wrench size={20} />
                    <span>Services</span>
                </button>
                <button
                    onClick={() => setActiveTab('issues')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'issues'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <AlertTriangle size={20} />
                    <span>Issues</span>
                </button>
            </div>

            {/* Services Tab Content */}
            {activeTab === 'services' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Add Service Form */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={24} className="text-purple-600" />
                            Add New Service
                        </h2>
                        <form onSubmit={handleServiceSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.service}
                                        onChange={(e) => setServiceForm({ ...serviceForm, service: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                        placeholder="e.g., Electrical Services"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Icon Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.iconName}
                                        onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                        placeholder="e.g., Wrench, Home, Bolt"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use the exact icon name from lucide-react.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.description}
                                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                        placeholder="Service description"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Add Service'}
                            </button>
                        </form>
                    </div>

                    {/* Services Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Services List</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Icon</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {services.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No services found. Add your first service above.
                                            </td>
                                        </tr>
                                    ) : (
                                        services.map((service, index) => (
                                            <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        {renderIcon(service.iconName)}
                                                        <span className="text-gray-700">{service.iconName || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{service.service}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{service.description}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingService(service);
                                                                setServiceForm({ service: service.service, description: service.description, iconName: service.iconName || '' });
                                                                setShowServiceModal(true);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteServiceId(service._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
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
                </div>
            )}

            {/* Issues Tab Content */}
            {activeTab === 'issues' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Add Issue Form */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={24} className="text-purple-600" />
                            Add New Issue
                        </h2>
                        <form onSubmit={handleIssueSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Type *
                                    </label>
                                    <select
                                        value={issueForm.serviceId}
                                        onChange={(e) => setIssueForm({ ...issueForm, serviceId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                        required
                                    >
                                        <option value="">Select Service</option>
                                        {services.map(service => (
                                            <option key={service._id} value={service._id}>
                                                {service.service}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Issue Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={issueForm.issueName}
                                        onChange={(e) => setIssueForm({ ...issueForm, issueName: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                        placeholder="e.g., Fan Repairing"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Basic Cost *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={issueForm.basicCost}
                                        onChange={(e) => setIssueForm({ ...issueForm, basicCost: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                        placeholder="2000"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Add Issue'}
                            </button>
                        </form>
                    </div>

                    {/* Filter */}
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            <label className="text-sm font-semibold text-gray-700">Filter by Service:</label>
                            <select
                                value={filterServiceId}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="px-4 py-2 w-full lg:w-1/4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                            >
                                <option value="">All Services</option>
                                {services.map(service => (
                                    <option key={service._id} value={service._id}>
                                        {service.service}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Issues Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Issues List</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Issue Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Basic Cost</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : issues.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No issues found. Add your first issue above.
                                            </td>
                                        </tr>
                                    ) : (
                                        issues.map((issue, index) => (
                                            <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {(currentPage - 1) * 10 + index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                    {issue.serviceId?.service || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{issue.issueName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">Rs. {issue.basicCost}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingIssue(issue);
                                                                setIssueForm({
                                                                    serviceId: issue.serviceId._id,
                                                                    issueName: issue.issueName,
                                                                    basicCost: issue.basicCost
                                                                });
                                                                setShowIssueModal(true);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteIssueId(issue._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Edit Service</h3>
                            <button
                                onClick={() => {
                                    setShowServiceModal(false);
                                    setEditingService(null);
                                    setServiceForm({ service: '', description: '', iconName: '' });
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleServiceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    value={serviceForm.service}
                                    onChange={(e) => setServiceForm({ ...serviceForm, service: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Icon Name *
                                </label>
                                <input
                                    type="text"
                                    value={serviceForm.iconName}
                                    onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description *
                                </label>
                                <input
                                    type="text"
                                    value={serviceForm.description}
                                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Service'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowServiceModal(false);
                                        setEditingService(null);
                                        setServiceForm({ service: '', description: '', iconName: '' });
                                    }}
                                    className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Edit Issue</h3>
                            <button
                                onClick={() => {
                                    setShowIssueModal(false);
                                    setEditingIssue(null);
                                    setIssueForm({ serviceId: '', issueName: '', basicCost: '' });
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleIssueSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Service Type *
                                </label>
                                <select
                                    value={issueForm.serviceId}
                                    onChange={(e) => setIssueForm({ ...issueForm, serviceId: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                    required
                                >
                                    <option value="">Select Service</option>
                                    {services.map(service => (
                                        <option key={service._id} value={service._id}>
                                            {service.service}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Issue Name *
                                </label>
                                <input
                                    type="text"
                                    value={issueForm.issueName}
                                    onChange={(e) => setIssueForm({ ...issueForm, issueName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Basic Cost *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={issueForm.basicCost}
                                    onChange={(e) => setIssueForm({ ...issueForm, basicCost: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Issue'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowIssueModal(false);
                                        setEditingIssue(null);
                                        setIssueForm({ serviceId: '', issueName: '', basicCost: '' });
                                    }}
                                    className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Service Confirmation */}
            {deleteServiceId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Delete Service</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this service? <strong>All related issues will also be permanently deleted.</strong> This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDeleteService(deleteServiceId)}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={() => setDeleteServiceId(null)}
                                className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Issue Confirmation */}
            {deleteIssueId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Delete Issue</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this issue? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDeleteIssue(deleteIssueId)}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={() => setDeleteIssueId(null)}
                                className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};
