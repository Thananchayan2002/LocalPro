import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Lock, Calendar, Shield,
  Edit2, Save, Camera, LogOut, Eye, EyeOff, Key,
  Navigation, Globe, CheckCircle, AlertCircle, Clock,
  Home, Settings, CreditCard, Heart, Bell
} from 'lucide-react';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    // User Data
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+94 77 123 4567',
    role: 'customer',
    
    // Location Data
    location: {
      city: 'Colombo',
      area: 'Colombo 07',
      lat: 6.9271,
      lng: 79.8612
    },
    
    // Additional Info
    lastLogin: '2024-01-15 14:30:45',
    status: 'active',
    joinedDate: '2023-05-20',
    
    // Password (for display only)
    passwordHash: '••••••••',
    
    // Additional fields
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    notifications: true,
    newsletter: true
  });

  const [formData, setFormData] = useState({ ...profileData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
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

  const handlePasswordChange = () => {
    // Password change logic would go here
    alert('Password change functionality would open a modal');
  };

  const handleLogout = () => {
    // Logout logic
    alert('Logging out...');
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    pause: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  const roleColors = {
    customer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    professional: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  const quickActions = [
    { icon: <Home className="w-5 h-5" />, label: 'My Bookings', action: () => alert('Navigate to bookings') },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Payment Methods', action: () => alert('Navigate to payments') },
    { icon: <Heart className="w-5 h-5" />, label: 'Favorites', action: () => alert('Navigate to favorites') },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', action: () => alert('Navigate to settings') },
  ];

  const activityLog = [
    { id: 1, action: 'Logged in', timestamp: '2024-01-15 14:30:45', device: 'Mobile Chrome' },
    { id: 2, action: 'Booked Electrical Service', timestamp: '2024-01-14 10:15:22', device: 'Desktop Safari' },
    { id: 3, action: 'Updated Profile', timestamp: '2024-01-12 16:45:10', device: 'Mobile App' },
    { id: 4, action: 'Reviewed Professional', timestamp: '2024-01-10 09:30:05', device: 'Desktop Chrome' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account information and preferences</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-2">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                <div className="relative">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-2xl border-4 border-blue-100 dark:border-blue-900"
                  />
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white w-full md:w-auto"
                        />
                      ) : (
                        profileData.name
                      )}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[profileData.role]}`}>
                      {profileData.role.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[profileData.status]}`}>
                      {profileData.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300">{profileData.email}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300">{profileData.phone}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Joined: {new Date(profileData.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Location Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.location.city}
                      onChange={handleLocationChange}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {profileData.location.city}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Area
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="area"
                      value={formData.location.area}
                      onChange={handleLocationChange}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {profileData.location.area}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Map Coordinates
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Latitude</div>
                    <div className="font-mono text-gray-900 dark:text-white">{profileData.location.lat}</div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Longitude</div>
                    <div className="font-mono text-gray-900 dark:text-white">{profileData.location.lng}</div>
                  </div>
                </div>
                
                <button className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  <Navigation className="w-4 h-4" />
                  View on Google Maps
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security & Account</h3>
              </div>
              
              <div className="space-y-6">
                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <button
                      onClick={handlePasswordChange}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <Key className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono">
                      {showPassword ? 'password123' : '••••••••'}
                    </div>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Last Login */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Login
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {new Date(profileData.lastLogin).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Notification Preferences
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications}
                        onChange={(e) => setFormData(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                      <Bell className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Email Newsletter</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {action.icon}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[profileData.status]}`}>
                    {profileData.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Account Type</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[profileData.role]}`}>
                    {profileData.role.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(profileData.joinedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Verification</span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{activity.action}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Globe className="w-4 h-4" />
                      {activity.device}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-3">Need Help?</h3>
              <p className="text-blue-100 mb-4">
                Our support team is here to help you with any questions or issues.
              </p>
              <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};