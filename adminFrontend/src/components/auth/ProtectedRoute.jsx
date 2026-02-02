import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const ProtectedRoute = ({ children }) => {
    const { admin, loading } = useAdminAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin
    if (admin && admin.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return children;
};
