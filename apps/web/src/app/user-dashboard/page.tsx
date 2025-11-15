"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import ProfileTab from '@/components/ProfileTab';
import AuthorizeGitHubTab from '@/components/AuthorizeGitHubTab';
import AddServerTab from '@/components/AddServerTab';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'github' | 'server'>('profile');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 pt-16 relative">
      <div className="fixed inset-0 z-0">
        <img
          src="/background-auth.webp"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.username || 'User'}!
            </h1>
            <p className="text-gray-400 mb-6">
              Manage your repositories and monitor security across your services
            </p>

            <div className="border-b border-gray-700">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } transition-colors duration-200`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('github')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'github'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } transition-colors duration-200`}
                >
                  Authorize GitHub
                </button>
                <button
                  onClick={() => setActiveTab('server')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'server'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } transition-colors duration-200`}
                >
                  Add Server
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'github' && <AuthorizeGitHubTab />}
          {activeTab === 'server' && <AddServerTab />}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
