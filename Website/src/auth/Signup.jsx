import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, MapPin, AlertCircle, LogIn } from 'lucide-react';
import loginBG from '../assets/loginBG.jfif';
import { useAuth } from '../worker/context/AuthContext';

export const Signup = () => {
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        location: '',
        role: 'customer',
        status: 'active'
    });

    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return false;
        }

        if (!formData.email.trim()) {
            setError('Please enter your email');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!formData.phone.trim()) {
            setError('Please enter your phone number');
            return false;
        }

        if (formData.phone.trim().length < 10) {
            setError('Phone number must be at least 10 digits');
            return false;
        }

        if (!formData.password) {
            setError('Please enter a password');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        if (!formData.confirmPassword) {
            setError('Please confirm your password');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    password: formData.password,
                    location: formData.location.trim() || '',
                    role: formData.role,
                    status: formData.status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Signup failed. Please try again.');
                setLoading(false);
                return;
            }

            if (data.success) {
                // Store token and user data via AuthContext
                setAuthData(data.token, data.user);
                // Route by role: customers to /app, professionals would need separate flow
                if (data.user?.role === 'professional') {
                    navigate('/worker/dashboard', { replace: true });
                } else if (data.user?.role === 'customer') {
                    navigate('/app', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${loginBG})` }}
            >
                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Signup Card */}
            <div className="relative w-full max-w-2xl z-10">
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border-2 border-purple-300/30">
                    {/* Logo and Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">
                            LocalPro
                        </h1>
                        <p className="text-gray-600 text-lg font-medium">Create Your Account</p>
                        <div className="mt-4 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto"></div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location Field */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                                Location (Optional)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                                    placeholder="Enter your location"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type={showPassword.password ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, password: !showPassword.password})}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-purple-600 transition-colors"
                                >
                                    {showPassword.password ? (
                                        <EyeOff className="text-gray-400 hover:text-purple-500" size={20} />
                                    ) : (
                                        <Eye className="text-gray-400 hover:text-purple-500" size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type={showPassword.confirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({...showPassword, confirmPassword: !showPassword.confirmPassword})}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-purple-600 transition-colors"
                                >
                                    {showPassword.confirmPassword ? (
                                        <EyeOff className="text-gray-400 hover:text-purple-500" size={20} />
                                    ) : (
                                        <Eye className="text-gray-400 hover:text-purple-500" size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Signup Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-8"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <a
                                href="/login"
                                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                            >
                                Login here
                            </a>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>© 2026 LocalPro. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default Signup;