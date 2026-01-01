import React from 'react';
import { Lock, Phone, Mail } from 'lucide-react';

export const BlockedAccountModal = ({ isOpen, errorMessage, onClose }) => {
    if (!isOpen) return null;

    const isBlocked = errorMessage?.includes('blocked');
    const isDenied = errorMessage?.includes('denied');
    const isPending = errorMessage?.includes('pending');

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className={`px-6 py-8 text-center ${isBlocked ? 'bg-gradient-to-br from-red-50 to-red-100' : isDenied ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'}`}>
                    <div className={`flex justify-center mb-4 ${isBlocked ? 'text-red-600' : isDenied ? 'text-orange-600' : 'text-yellow-600'}`}>
                        <Lock size={48} />
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${isBlocked ? 'text-red-900' : isDenied ? 'text-orange-900' : 'text-yellow-900'}`}>
                        {isBlocked ? 'Account Blocked' : isDenied ? 'Registration Denied' : 'Approval Pending'}
                    </h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <p className={`text-center text-base font-semibold mb-6 ${isBlocked ? 'text-red-800' : isDenied ? 'text-orange-800' : 'text-yellow-800'}`}>
                        {errorMessage}
                    </p>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Contact Administrator:</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-600">+94 (0) 11 234 5678</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-600">admin@localpro.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                            isBlocked
                                ? 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg hover:shadow-red-500/50'
                                : isDenied
                                ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/50'
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-lg hover:shadow-yellow-500/50'
                        } active:scale-95`}
                    >
                        Go Back to Login
                    </button>
                </div>

                {/* Footer Note */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                    <p>© 2026 LocalPro. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};
