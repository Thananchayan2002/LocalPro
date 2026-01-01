import React from 'react';
import { Bell } from 'lucide-react';

export const Notifications = () => {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                    <Bell size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                    <p className="text-sm text-gray-600">Stay updated with your latest activities</p>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                        <Bell size={40} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notifications</h3>
                    <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
                </div>
            </div>
        </div>
    );
};
