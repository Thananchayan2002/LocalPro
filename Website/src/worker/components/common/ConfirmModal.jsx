import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ 
    isOpen, 
    title = 'Confirm Action', 
    message = 'Are you sure?', 
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm, 
    onCancel,
    isDangerous = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pt-10">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className={`flex items-center gap-3 px-6 py-4 ${isDangerous ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <AlertTriangle 
                        size={24} 
                        className={isDangerous ? 'text-red-600' : 'text-blue-600'}
                    />
                    <h3 className={`text-lg font-bold ${isDangerous ? 'text-red-900' : 'text-blue-900'}`}>
                        {title}
                    </h3>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <p className="text-gray-700 text-base">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 text-white  rounded-lg font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 ${
                            isDangerous 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/50' 
                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-500/50'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
