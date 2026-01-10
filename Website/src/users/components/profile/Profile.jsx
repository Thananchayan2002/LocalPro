import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Phone,
  Lock,
  Calendar,
  Shield,
  Edit2,
  Save,
  Camera,
  LogOut,
  Eye,
  EyeOff,
  Key,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Home,
  Settings,
  CreditCard,
  Heart,
  Bell,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { API_BASE_URL, fetchMyActivities } from "../../../utils/api";

const API_BASE_URL_LOCAL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Profile = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [activities, setActivities] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to view your profile");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL_LOCAL}/api/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      // Transform backend data to match component structure
      const userData = {
        id: data.user?.id || data.user?._id || undefined,
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phoneNumber || data.user.phone || "",
        role: data.user.role || "customer",
        lastLogin: data.user.lastLogin || "",
        status: data.user.status || "active",
        joinedDate: data.user.createdAt
          ? new Date(data.user.createdAt).toLocaleDateString()
          : "",
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${
          data.user.name || "User"
        }`,
        notifications: true,
        newsletter: true,
      };

      setProfileData(userData);
      setFormData(userData);
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error(error.message || "Failed to load profile");
      if (
        (error?.message || "").toLowerCase().includes("token") ||
        (error?.message || "").toLowerCase().includes("auth")
      ) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load activities and set up real-time socket subscription
  useEffect(() => {
    let socket;
    const token = localStorage.getItem("token");
    const userId = profileData?.id || profileData?._id || null;

    const init = async () => {
      try {
        // Initial fetch
        const list = await fetchMyActivities({ limit: 20 });
        setActivities(list);

        // Connect socket for real-time updates
        socket = io(API_BASE_URL, {
          transports: ["websocket", "polling"],
          auth: token ? { token } : undefined,
        });

        socket.on("connect", () => {
          setSocketConnected(true);
          if (userId) {
            socket.emit("subscribeActivities", { userId });
          }
        });

        socket.on("activity:new", (activity) => {
          setActivities((prev) => [activity, ...prev].slice(0, 50));
        });

        socket.on("disconnect", () => {
          setSocketConnected(false);
        });
      } catch (err) {
        console.error("Activities init error:", err);
      }
    };

    if (profileData) {
      init();
    }

    return () => {
      if (socket && socket.connected) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const name = (formData?.name || "").trim();
    const email = (formData?.email || "").trim();
    const phone = (formData?.phone || "").trim();

    if (!name) {
      toast.error("Name is required");
      return false;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Allow +, spaces, and dashes; validate digits length (basic but strict)
    const digits = phone.replace(/[^\d]/g, "");
    if (!digits || digits.length < 9 || digits.length > 15) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Here you would typically save to backend
    setProfileData(formData);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
    toast("Changes discarded");
  };

  const handlePasswordChange = () => {
    toast("Password change modal will be added here");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const statusColors = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    pause: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const roleColors = {
    customer:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    professional:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const quickActions = useMemo(
    () => [
      {
        icon: <Home className="w-5 h-5" />,
        label: "My Bookings",
        action: () => toast("Navigate to bookings"),
      },
      {
        icon: <CreditCard className="w-5 h-5" />,
        label: "Payment Methods",
        action: () => toast("Navigate to payments"),
      },
      {
        icon: <Heart className="w-5 h-5" />,
        label: "Favorites",
        action: () => toast("Navigate to favorites"),
      },
      {
        icon: <Settings className="w-5 h-5" />,
        label: "Settings",
        action: () => toast("Navigate to settings"),
      },
    ],
    []
  );

  // activities state replaces hard-coded activityLog

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading profile...
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-bold text-lg">
            Failed to load profile
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Please try again.
          </p>
          <button
            onClick={fetchUserProfile}
            className="mt-5 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const joinedText = profileData.joinedDate ? profileData.joinedDate : "N/A";
  const lastLoginText = profileData.lastLogin
    ? new Date(profileData.lastLogin).toLocaleString()
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account information and preferences
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    toast("Editing enabled");
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-blue-100 dark:border-blue-900 bg-gray-50 dark:bg-gray-700 shadow">
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        toast("Profile photo upload will be added here")
                      }
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow"
                      aria-label="Change profile photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name || ""}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-bold text-xl sm:text-2xl outline-none"
                            placeholder="Your name"
                            autoComplete="name"
                          />
                        ) : (
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                            {profileData.name}
                          </h2>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            roleColors[profileData.role]
                          }`}
                        >
                          {profileData.role.toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[profileData.status]
                          }`}
                        >
                          {profileData.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Email
                          </div>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={formData.email || ""}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white outline-none"
                              placeholder="name@email.com"
                              autoComplete="email"
                              inputMode="email"
                            />
                          ) : (
                            <div className="text-gray-900 dark:text-white truncate">
                              {profileData.email || "N/A"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Phone
                          </div>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone || ""}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white outline-none"
                              placeholder="+94 7X XXX XXXX"
                              autoComplete="tel"
                              inputMode="tel"
                            />
                          ) : (
                            <div className="text-gray-900 dark:text-white truncate">
                              {profileData.phone || "N/A"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:col-span-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Joined
                          </div>
                          <div className="text-gray-900 dark:text-white">
                            {joinedText}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="h-px bg-gray-100 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Security & Account
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Manage login and notification preferences
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Last Login */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Login
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {lastLoginText}
                    </span>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-3">
                  <div className="space-y-3"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Side */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Account Overview
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Account Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[profileData.status]
                    }`}
                  >
                    {profileData.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Account Type
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      roleColors[profileData.role]
                    }`}
                  >
                    {profileData.role.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Member Since
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {joinedText}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Verification
                  </span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>

              <div className="space-y-4">
                {activities.length === 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No recent activity yet.
                  </div>
                )}
                {activities.map((activity) => (
                  <div
                    key={activity.id || activity._id}
                    className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Globe className="w-4 h-4" />
                          {activity.device || "unknown"}
                        </div>
                      </div>

                      <div className="shrink-0 text-xs text-gray-500 dark:text-gray-500">
                        {new Date(
                          activity.timestamp || activity.createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
