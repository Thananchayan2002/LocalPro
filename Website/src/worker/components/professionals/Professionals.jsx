import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  UserPlus,
  Globe,
  Plus,
  Edit2,
  Eye,
  Power,
  PowerOff,
  X,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
} from "lucide-react";

import { SRI_LANKAN_DISTRICTS } from "../../utils/districts";
import { API_BASE_URL } from "../../utils/api";
import { authFetch } from "../../../utils/authFetch";
import { ConfirmModal } from "../common/ConfirmModal";

export const Professionals = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("professionals");

  // Common state
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Professionals tab state
  const [professionals, setProfessionals] = useState([]);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // '' = all, 'accepted' = active, 'paused' = paused
  const [searchQuery, setSearchQuery] = useState("");
  const [viewProfessional, setViewProfessional] = useState(null);
  const [editProfessional, setEditProfessional] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Manual tab state
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceId: "",
    experience: "",
    district: "",
    location: "",
    nicNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Confirm modal state for status toggle
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    currentStatus: null,
    action: null,
  });

  // Website tab state
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [deniedProfessionals, setDeniedProfessionals] = useState([]);
  const [approveProfessional, setApproveProfessional] = useState(null);
  const [approveForm, setApproveForm] = useState({});

  // Fetch services
  const fetchServices = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/services`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch services");
    }
  };

  // Fetch accepted professionals
  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/professionals?`;

      // Build query params
      const params = [];
      if (filterStatus) {
        // If specific status selected, filter by that
        params.push(`status=${filterStatus}`);
      }
      // If no status filter, backend will return all (we'll filter on backend to show accepted and paused)

      if (filterDistrict) params.push(`district=${filterDistrict}`);
      if (searchQuery) params.push(`search=${searchQuery}`);

      url += params.join("&");

      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) {
        // If no status filter, show both accepted and paused
        if (!filterStatus) {
          const filtered = data.data.filter(
            (p) => p.status === "accepted" || p.status === "paused",
          );
          setProfessionals(filtered);
        } else {
          setProfessionals(data.data);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch professionals");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending professionals for website tab
  const fetchPendingProfessionals = async () => {
    try {
      setLoading(true);
      const res = await authFetch(
        `${API_BASE_URL}/api/professionals?status=pending&way=website`,
      );
      const data = await res.json();
      if (data.success) {
        setPendingProfessionals(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch pending professionals");
    } finally {
      setLoading(false);
    }
  };

  // Fetch denied professionals for website tab
  const fetchDeniedProfessionals = async () => {
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/professionals?status=denied&way=website`,
      );
      const data = await res.json();
      if (data.success) {
        setDeniedProfessionals(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch denied professionals");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (activeTab === "professionals") {
      fetchProfessionals();
    } else if (activeTab === "website") {
      fetchPendingProfessionals();
      fetchDeniedProfessionals();
    }
  }, [activeTab, filterDistrict, filterStatus, searchQuery]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, JPG, and PNG images are allowed");
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB");
        e.target.value = ""; // Reset input
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle manual form submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (manualForm.password !== manualForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setShowConfirmation(true);
  };

  // Confirm manual submission
  const confirmManualSubmission = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const formData = new FormData();
      formData.append("name", manualForm.name);
      formData.append("email", manualForm.email);
      formData.append("phone", manualForm.phone);
      formData.append("serviceId", manualForm.serviceId);
      formData.append("experience", manualForm.experience);
      formData.append("district", manualForm.district);
      formData.append("location", manualForm.location);
      formData.append("nicNumber", manualForm.nicNumber);
      formData.append("username", manualForm.username);
      formData.append("password", manualForm.password);
      formData.append("way", "manual");
      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const res = await authFetch(`${API_BASE_URL}/api/professionals`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Professional added successfully!");

        // Download PDF
        await downloadPDF(data.data._id, manualForm.password);

        // Reset form
        setManualForm({
          name: "",
          email: "",
          phone: "",
          serviceId: "",
          experience: "",
          district: "",
          location: "",
          nicNumber: "",
          username: "",
          password: "",
          confirmPassword: "",
        });
        setImagePreview(null);
        setImageFile(null);
      } else {
        toast.error(data.message || "Failed to add professional");
      }
    } catch (error) {
      toast.error("Failed to add professional");
    } finally {
      setLoading(false);
    }
  };

  // Handle status toggle
  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "accepted" ? "paused" : "accepted";
    const action = newStatus === "accepted" ? "activate" : "deactivate";

    setConfirmModal({
      isOpen: true,
      id,
      currentStatus,
      action,
    });
  };

  // Confirm status toggle
  const confirmStatusToggle = async () => {
    const { id, currentStatus } = confirmModal;
    const newStatus = currentStatus === "accepted" ? "paused" : "accepted";

    setConfirmModal({
      isOpen: false,
      id: null,
      currentStatus: null,
      action: null,
    });

    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/professionals/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success(
          `Professional ${newStatus === "accepted" ? "activated" : "deactivated"}`,
        );
        fetchProfessionals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(editForm).forEach((key) => {
        if (key !== "password" && key !== "confirmPassword") {
          formData.append(key, editForm[key]);
        }
      });

      const res = await authFetch(
        `${API_BASE_URL}/api/professionals/${editProfessional._id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Professional updated successfully");
        setEditProfessional(null);
        setEditForm({});
        fetchProfessionals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update professional");
    } finally {
      setLoading(false);
    }
  };

  // Handle deny
  const handleDeny = async (id) => {
    if (!window.confirm("Are you sure you want to deny this professional?"))
      return;

    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/professionals/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "denied" }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Professional denied");
        fetchPendingProfessionals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to deny professional");
    }
  };

  // Handle approve submit
  const handleApproveSubmit = async (e) => {
    e.preventDefault();

    if (approveForm.password !== approveForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = approveForm;

      const res = await authFetch(
        `${API_BASE_URL}/api/professionals/${approveProfessional._id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Professional approved successfully!");

        // Download PDF
        await downloadPDF(data.data._id, approveForm.password);

        setApproveProfessional(null);
        setApproveForm({});
        fetchPendingProfessionals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to approve professional");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = async (professionalId, plainPassword) => {
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/professionals/${professionalId}/pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plainPassword }),
        },
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `professional_${professionalId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error("Failed to download PDF");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF");
    }
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

      {/* Confirm Modal for Status Toggle */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.action === "activate"
            ? "Activate Professional"
            : "Deactivate Professional"
        }
        message={`Are you sure you want to ${confirmModal.action} this professional?`}
        confirmText={
          confirmModal.action === "activate" ? "Activate" : "Deactivate"
        }
        onConfirm={confirmStatusToggle}
        onCancel={() =>
          setConfirmModal({
            isOpen: false,
            id: null,
            currentStatus: null,
            action: null,
          })
        }
        isDangerous={confirmModal.action === "deactivate"}
      />

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex flex-row md:flex-row gap-2 mt-16 lg:mt-8">
        <button
          onClick={() => setActiveTab("professionals")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-all ${
            activeTab === "professionals"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Professionals"
        >
          <Users size={20} />
          <span className="hidden md:inline">Professionals</span>
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-all ${
            activeTab === "manual"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Manual"
        >
          <UserPlus size={20} />
          <span className="hidden md:inline">Manual</span>
        </button>
        <button
          onClick={() => setActiveTab("website")}
          className={`flex-1 flex items-center justify-center gap-2 px-2 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-all ${
            activeTab === "website"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Website"
        >
          <Globe size={20} />
          <span className="hidden md:inline">Website</span>
        </button>
      </div>

      {/* Professionals Tab */}
      {activeTab === "professionals" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Filter size={16} className="inline mr-2" />
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                >
                  <option value="">All (Active & Paused)</option>
                  <option value="accepted">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
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
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Search size={16} className="inline mr-2" />
                  Search by Name
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Professionals Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Accepted Professionals
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      District
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : professionals.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No professionals found
                      </td>
                    </tr>
                  ) : (
                    professionals.map((prof, index) => (
                      <tr
                        key={prof._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {prof.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.serviceId?.service || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.district}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          ⭐ {prof.rating}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              prof.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {prof.status.charAt(0).toUpperCase() +
                              prof.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewProfessional(prof)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setEditProfessional(prof);
                                setEditForm({
                                  name: prof.name,
                                  email: prof.email || "",
                                  phone: prof.phone,
                                  serviceId: prof.serviceId?._id || "",
                                  experience: prof.experience,
                                  district: prof.district,
                                  location: prof.location,
                                  nicNumber: prof.nicNumber,
                                });
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusToggle(prof._id, prof.status)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                prof.status === "accepted"
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                prof.status === "accepted"
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              {prof.status === "accepted" ? (
                                <PowerOff size={18} />
                              ) : (
                                <Power size={18} />
                              )}
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

      {/* Manual Tab */}
      {activeTab === "manual" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={24} className="text-purple-600" />
              Add Professional Manually
            </h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={manualForm.email}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={manualForm.phone}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service *
                  </label>
                  <select
                    value={manualForm.serviceId}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        serviceId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.service}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.experience}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        experience: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    value={manualForm.district}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, district: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select District</option>
                    {SRI_LANKAN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={manualForm.location}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, location: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    value={manualForm.nicNumber}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        nicNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={manualForm.username}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, username: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={manualForm.password}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={manualForm.confirmPassword}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 transition-all">
                      <Upload size={20} />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                    )}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Professional"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Website Tab */}
      {activeTab === "website" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Pending Approvals
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      District
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : pendingProfessionals.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No pending professionals
                      </td>
                    </tr>
                  ) : (
                    pendingProfessionals.map((prof, index) => (
                      <tr
                        key={prof._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {prof.profileImage && (
                              <img
                                src={`${API_BASE_URL}/${prof.profileImage}`}
                                alt={prof.name}
                                className="w-10 h-10 object-cover rounded-full"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-800">
                              {prof.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.serviceId?.service || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.district}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.experience} years
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setApproveProfessional(prof);
                                setApproveForm({
                                  name: prof.name,
                                  email: prof.email || "",
                                  phone: prof.phone,
                                  serviceId: prof.serviceId?._id || "",
                                  experience: prof.experience,
                                  district: prof.district,
                                  location: prof.location,
                                  nicNumber: prof.nicNumber,
                                  username: "",
                                  password: "",
                                  confirmPassword: "",
                                });
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleDeny(prof._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deny"
                            >
                              <XCircle size={18} />
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

          {/* Denied Professionals Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Denied Professionals
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      District
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      NIC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deniedProfessionals.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No denied professionals
                      </td>
                    </tr>
                  ) : (
                    deniedProfessionals.map((prof, index) => (
                      <tr
                        key={prof._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {prof.profileImage && (
                              <img
                                src={`${API_BASE_URL}/${prof.profileImage}`}
                                alt={prof.name}
                                className="w-10 h-10 object-cover rounded-full"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-800">
                              {prof.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.serviceId?.service || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.district}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.experience} years
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prof.nicNumber}
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

      {/* View Modal */}
      {viewProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Professional Details
              </h3>
              <button
                onClick={() => setViewProfessional(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {viewProfessional.profileImage && (
                <img
                  src={`${API_BASE_URL}/${viewProfessional.profileImage}`}
                  alt={viewProfessional.name}
                  className="w-32 h-32 object-cover rounded-lg mx-auto"
                />
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Name:</strong> {viewProfessional.name}
                </div>
                <div>
                  <strong>Email:</strong> {viewProfessional.email || "N/A"}
                </div>
                <div>
                  <strong>Phone:</strong> {viewProfessional.phone}
                </div>
                <div>
                  <strong>Service:</strong>{" "}
                  {viewProfessional.serviceId?.service || "N/A"}
                </div>
                <div>
                  <strong>Experience:</strong> {viewProfessional.experience}{" "}
                  years
                </div>
                <div>
                  <strong>Rating:</strong> ⭐ {viewProfessional.rating}
                </div>
                <div>
                  <strong>Total Jobs:</strong> {viewProfessional.totalJobs}
                </div>
                <div>
                  <strong>District:</strong> {viewProfessional.district}
                </div>
                <div>
                  <strong>Location:</strong> {viewProfessional.location}
                </div>
                <div>
                  <strong>NIC:</strong> {viewProfessional.nicNumber}
                </div>
                <div>
                  <strong>Username:</strong> {viewProfessional.username}
                </div>
                <div>
                  <strong>Status:</strong> {viewProfessional.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Edit Professional
              </h3>
              <button
                onClick={() => {
                  setEditProfessional(null);
                  setEditForm({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service *
                  </label>
                  <select
                    value={editForm.serviceId || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, serviceId: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.service}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.experience || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, experience: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    value={editForm.district || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, district: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select District</option>
                    {SRI_LANKAN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={editForm.location || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIC *
                  </label>
                  <input
                    type="text"
                    value={editForm.nicNumber || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nicNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditProfessional(null);
                    setEditForm({});
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

      {/* Approve Modal */}
      {approveProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Approve Professional
              </h3>
              <button
                onClick={() => {
                  setApproveProfessional(null);
                  setApproveForm({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={approveForm.name || ""}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={approveForm.email || ""}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={approveForm.phone || ""}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service *
                  </label>
                  <select
                    value={approveForm.serviceId || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        serviceId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.service}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={approveForm.experience || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        experience: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    value={approveForm.district || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        district: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select District</option>
                    {SRI_LANKAN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={approveForm.location || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIC *
                  </label>
                  <input
                    type="text"
                    value={approveForm.nicNumber || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        nicNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div className="lg:col-span-2 border-t-2 border-gray-200 pt-4 mt-2">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Account Credentials
                  </h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={approveForm.username || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={approveForm.password || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={approveForm.confirmPassword || ""}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Approving..." : "Approve & Download PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApproveProfessional(null);
                    setApproveForm({});
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

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <AlertTriangle size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Confirm Submission
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to add this professional? A PDF with the
              details will be downloaded automatically.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmManualSubmission}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Adding..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
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
