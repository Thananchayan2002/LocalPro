import React, { useState, useEffect } from "react";
import { colors } from "../../../styles/colors";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  Camera,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../worker/context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { logout, user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Removed password logic
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    // User Data
    name: "",
    email: "",
    phone: "",
    role: "customer",

    // Location Data
    location: {
      location: "",
    },

    // Additional Info
    lastLogin: "",
    status: "active",
    joinedDate: "",

    // Removed passwordHash

    // Additional fields
    profileImage: "",
    // Removed notification preferences
  });

  const [formData, setFormData] = useState({ ...profileData });

  // Fetch user data from shared auth state
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const userData = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || user.phoneNumber || "",
      role: user.role || "customer",
      location:
        typeof user.location === "string"
          ? { location: user.location, area: "", lat: 0, lng: 0 }
          : user.In || { city: "", area: "", lat: 0, lng: 0 },
      lastLogin: user.lastLogin || new Date().toISOString(),
      status: user.status || "active",
      joinedDate: user.createdAt || new Date().toISOString(),
      passwordHash: "Г?ЫГ?ЫГ?ЫГ?ЫГ?ЫГ?ЫГ?ЫГ?Ы",
      profileImage:
        user.profileImage ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${
          user.name || "User"
        }`,
      notifications: user.notifications !== false,
      newsletter: user.newsletter !== false,
    };

    setProfileData(userData);
    setFormData(userData);
    setLoading(false);
  }, [authLoading, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    setProfileData(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
  };

  // Removed password change handler

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const statusColors = {
    active: `bg-[${colors.successBg}] text-[${colors.successText}] dark:bg-[${colors.successBgDark}] dark:text-[${colors.successTextDark}]`,
    blocked: `bg-[${colors.errorBg}] text-[${colors.errorText}] dark:bg-[${colors.errorBgDark}] dark:text-[${colors.errorTextDark}]`,
    pending: `bg-[${colors.warningBg}] text-[${colors.warningText}] dark:bg-[${colors.warningBgDark}] dark:text-[${colors.warningTextDark}]`,
    pause: `bg-[${colors.neutralBg}] text-[${colors.neutralText}] dark:bg-[${colors.neutralBgDark}] dark:text-[${colors.neutralTextDark}]`,
  };

  const roleColors = {
    customer: `bg-[${colors.primaryBg}] text-[${colors.primaryText}] dark:bg-[${colors.primaryBgDark}] dark:text-[${colors.primaryTextDark}]`,
    professional: `bg-[${colors.secondaryBg}] text-[${colors.secondaryText}] dark:bg-[${colors.secondaryBgDark}] dark:text-[${colors.secondaryTextDark}]`,
    admin: `bg-[${colors.errorBg}] text-[${colors.errorText}] dark:bg-[${colors.errorBgDark}] dark:text-[${colors.errorTextDark}]`,
  };

  // Removed quickActions for Payment Methods, Favorites, Settings

  // Removed activityLog (Recent Activity)

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
            <div className="p-8 sm:p-10 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-5 text-base sm:text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                Loading profile...
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Fetching your account details
              </p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600"></div>
              </div>
              <div className="mt-7 flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600/80 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse [animation-delay:150ms]"></div>
                <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse [animation-delay:300ms]"></div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  const joined = new Date(profileData.joinedDate).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 sm:pt-20">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-start sm:items-center justify-between gap-6 flex-col md:flex-row">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900/30 flex items-center justify-center shadow-sm">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-3xl sm:text-4xl tracking-tight text-gray-900 dark:text-white">
                        My Profile
                      </h1>
                      <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Manage your account information and preferences
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600">
                      <Calendar className="w-4 h-4" />
                      Member since {joined}
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="group flex-1 md:flex-none px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl
                            bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/40 dark:ring-gray-700/40
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition
                            active:scale-[0.99] cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                        >
                          <span className="inline-flex items-center justify-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-gray-400 group-hover:bg-gray-500 transition" />
                            Cancel
                          </span>
                        </button>
                        <button
                          onClick={handleSave}
                          className="group relative flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-2xl
                            shadow-sm ring-1 ring-blue-600/20
                            hover:bg-blue-700 hover:shadow-lg hover:-translate-y-[1px]
                            transition active:translate-y-0 active:scale-[0.99]
                            flex items-center justify-center gap-2 cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                        >
                          <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.20),transparent_45%)]" />
                          <Save className="w-4 h-4 relative" />
                          <span className="relative">Save Changes</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleLogout}
                          className="group flex-1 md:flex-none px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl
                            bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/40 dark:ring-gray-700/40
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition
                            active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                        >
                          <LogOut className="w-4 h-4 group-hover:-translate-y-[1px] transition" />
                          Logout
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="group relative flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-2xl
                            shadow-sm ring-1 ring-blue-600/20
                            hover:bg-blue-700 hover:shadow-lg hover:-translate-y-[1px]
                            transition active:translate-y-0 active:scale-[0.99]
                            flex items-center justify-center gap-2 cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                        >
                          <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.20),transparent_45%)]" />
                          <Edit2 className="w-4 h-4 relative group-hover:rotate-[-6deg] transition" />
                          <span className="relative">Edit Profile</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="group rounded-2xl bg-gray-50 dark:bg-gray-700/60 ring-1 ring-gray-200 dark:ring-gray-700 p-4 shadow-sm flex flex-col items-center transition hover:-translate-y-0.5 hover:shadow-md">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold ring-1 ring-black/5 dark:ring-white/10`}
                    style={{
                      background: colors.primary.light,
                      color: colors.primaryText,
                    }}
                  >
                    {profileData.role.toUpperCase()}
                  </span>
                  <span
                    className="mt-2 text-xs font-bold"
                    style={{ color: colors.secondaryText }}
                  >
                    Account Type
                  </span>
                </div>
                <div className="group rounded-2xl bg-gray-50 dark:bg-gray-700/60 ring-1 ring-gray-200 dark:ring-gray-700 p-4 shadow-sm flex flex-col items-center transition hover:-translate-y-0.5 hover:shadow-md">
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-extrabold ring-1 ring-black/5 dark:ring-white/10"
                    style={{
                      background:
                        profileData.status === "active"
                          ? "#eafaf1"
                          : profileData.status === "blocked"
                            ? "#fdecea"
                            : profileData.status === "pending"
                              ? "#fff9e5"
                              : profileData.status === "pause"
                                ? "#f4f3fa"
                                : "#f0f0f0",
                      color:
                        profileData.status === "active"
                          ? "#27ae60"
                          : profileData.status === "blocked"
                            ? "#e74c3c"
                            : profileData.status === "pending"
                              ? "#f1c40f"
                              : profileData.status === "pause"
                                ? "#8e44ad"
                                : "#333",
                    }}
                  >
                    {profileData.status.toUpperCase()}
                  </span>
                  <span
                    className="mt-2 text-xs font-bold"
                    style={{ color: colors.secondaryText }}
                  >
                    Status
                  </span>
                </div>
                <div className="group rounded-2xl bg-gray-50 dark:bg-gray-700/60 ring-1 ring-gray-200 dark:ring-gray-700 p-4 shadow-sm flex flex-col items-center transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/30">
                    <CheckCircle className="w-4 h-4 animate-[pulse_2.2s_ease-in-out_infinite]" />
                    Verified
                  </span>
                  <span className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                    Verification
                  </span>
                </div>
                {/* Last Login */}
                <div className="group rounded-2xl bg-gray-50 dark:bg-gray-700/60 ring-1 ring-gray-200 dark:ring-gray-700 p-4 shadow-sm flex flex-col items-center transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-900/30">
                    <Calendar className="w-4 h-4" />
                    Last Login
                  </span>
                  <span className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400 text-center">
                    {profileData.lastLogin
                      ? new Date(profileData.lastLogin).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl">
              {/* Animated top accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[${colors.primary}] via-[${colors.secondary}] to-[${colors.accent}] animate-[pulse_3.2s_ease-in-out_infinite]" />
              <div className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <div className="rounded-3xl bg-gray-50 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600 p-2 shadow-sm transition hover:shadow-md">
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-blue-100 dark:border-blue-900 object-cover transition duration-300 hover:scale-[1.02]"
                      />
                    </div>

                    {/* Subtle glow */}
                    <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[28px] bg-blue-500/10 blur-xl opacity-70" />

                    {isEditing && (
                      <button
                        className="group absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-sm ring-1 ring-blue-600/20
                          hover:bg-blue-700 hover:shadow-lg hover:-translate-y-[1px]
                          transition active:translate-y-0 active:scale-[0.99] cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                      >
                        <Camera className="w-4 h-4 group-hover:rotate-[-6deg] transition" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2
                            className="text-2xl sm:text-3xl font-extrabold tracking-tight min-w-0 w-full"
                            style={{ color: colors.primaryText }}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2.5
                                  text-gray-900 dark:text-white w-full sm:w-[600px]
                                  shadow-sm ring-1 ring-gray-200/40 dark:ring-gray-700/40
                                  focus:outline-none focus:ring-2 focus:ring-blue-600 transition
                                  hover:shadow-md"
                              />
                            ) : (
                              <span className="truncate inline-block max-w-[22ch] sm:max-w-none">
                                {profileData.name || "—"}
                              </span>
                            )}
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Email */}
                        <div className="group flex items-start gap-3 rounded-2xl bg-gray-50/60 dark:bg-gray-700/40 ring-1 ring-gray-200 dark:ring-gray-700 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm transition group-hover:shadow">
                            <Mail
                              className="w-5 h-5"
                              style={{ color: colors.primary }}
                            />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-bold"
                              style={{ color: colors.secondaryText }}
                            >
                              Email
                            </p>
                            {isEditing ? (
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition hover:shadow-md"
                              />
                            ) : (
                              <p
                                className="mt-1 text-sm font-semibold truncate"
                                style={{ color: colors.primaryText }}
                              >
                                {profileData.email || "—"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="group flex items-start gap-3 rounded-2xl bg-gray-50/60 dark:bg-gray-700/40 ring-1 ring-gray-200 dark:ring-gray-700 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm transition group-hover:shadow">
                            <Phone
                              className="w-5 h-5"
                              style={{ color: colors.secondary }}
                            />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-bold"
                              style={{ color: colors.secondaryText }}
                            >
                              Phone
                            </p>
                            {isEditing ? (
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition hover:shadow-md"
                              />
                            ) : (
                              <p
                                className="mt-1 text-sm font-semibold truncate"
                                style={{ color: colors.primaryText }}
                              >
                                {profileData.phone || "—"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="group flex items-start gap-3 rounded-2xl bg-gray-50/60 dark:bg-gray-700/40 ring-1 ring-gray-200 dark:ring-gray-700 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm transition group-hover:shadow">
                            <MapPin
                              className="w-5 h-5"
                              style={{ color: colors.accent }}
                            />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-bold"
                              style={{ color: colors.secondaryText }}
                            >
                              Location
                            </p>
                            {isEditing ? (
                              <input
                                type="text"
                                name="location"
                                value={formData.location.location}
                                onChange={handleLocationChange}
                                className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition hover:shadow-md"
                              />
                            ) : (
                              <p
                                className="mt-1 text-sm font-semibold truncate"
                                style={{ color: colors.primaryText }}
                              >
                                {profileData.location.location || "—"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Editing banner */}
                    <div
                      className={`mt-6 transition-all duration-300 ${
                        isEditing
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden"
                      }`}
                    >
                      <div className="rounded-3xl bg-blue-50 ring-1 ring-blue-200 p-4 shadow-sm relative overflow-hidden">
                        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-600/10 blur-2xl" />
                        <p className="text-sm font-extrabold text-blue-900">
                          Editing mode enabled
                        </p>
                        <p className="mt-1 text-xs text-blue-800">
                          Update your details and click{" "}
                          <span className="font-bold">Save Changes</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer hint */}
                <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Secure profile view • Changes are local until you connect
                    backend save
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* End */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
