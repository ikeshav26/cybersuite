"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { env } from '@/lib/env';

const AddServer = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    serverIP: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a server name');
      return;
    }
    
    if (!formData.serverIP.trim()) {
      toast.error('Please enter a server IP address');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(
        `${env.API_URL}/add/server`, 
        formData,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success('Server added successfully!');
        router.push('/user-dashboard');
      }
    } catch (error: any) {
      console.error('Error adding server:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/user-dashboard');
  };

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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Add New Server</h1>
            <p className="text-gray-400">
              Add a server to your monitoring dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-blue-400 font-medium mb-2">Server Requirements</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Server must be accessible from the internet</li>
                      <li>• Use a descriptive name to easily identify your server</li>
                      <li>• IP address can be IPv4, IPv6, or domain name</li>
                      <li>• Make sure the server allows monitoring connections</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-green-400 font-medium mb-2">Getting Started</h3>
                    <div className="text-gray-300 text-sm space-y-2">
                      <p>1. <strong>Server Name:</strong> Choose a descriptive name that helps you identify the server&apos;s purpose (e.g., &quot;Production Web Server&quot;, &quot;Database Server&quot;)</p>
                      <p>2. <strong>IP Address:</strong> Enter the public IP address or domain name where your server can be reached</p>
                      <p>3. <strong>Submit:</strong> Click &quot;Add Server&quot; to add it to your monitoring dashboard</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-yellow-400 font-medium mb-2">Security Notice</h3>
                    <p className="text-gray-300 text-sm">
                      Only add servers that you own or have explicit permission to monitor. 
                      Ensure your server&apos;s firewall allows monitoring connections on the required ports.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Server Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Production Web Server"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="serverIP" className="block text-sm font-medium text-gray-300 mb-2">
                        Server IP Address *
                      </label>
                      <input
                        type="text"
                        id="serverIP"
                        name="serverIP"
                        value={formData.serverIP}
                        onChange={handleChange}
                        placeholder="e.g., 192.168.1.100 or example.com"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                        disabled={loading}
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Enter an IP address or domain name
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Server
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServer;
