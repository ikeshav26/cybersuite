"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';

interface Report {
  id: number;
  bugData: string | null;
  fixData: string | null;
  timestamp: string;
  status: string;
}

const ProviderDashboard = () => {
  const { user } = useAuthStore();
  const [bugData, setBugData] = useState('');
  const [fixData, setFixData] = useState('');
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitReport = () => {
    if (!bugData.trim() && !fixData.trim()) {
      toast.error('Please provide at least bug data or fix data');
      return;
    }

    try {
      if (bugData.trim()) {
        JSON.parse(bugData);
      }
      if (fixData.trim()) {
        JSON.parse(fixData);
      }

      const newReport: Report = {
        id: Date.now(),
        bugData: bugData.trim() || null,
        fixData: fixData.trim() || null,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      setSubmittedReports([newReport, ...submittedReports]);
      setBugData('');
      setFixData('');
      toast.success('Bug and Fix report submitted successfully!');
    } catch (error) {
      toast.error('Invalid JSON format in one or both fields');
    }
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome, {user?.username || 'Provider'}!
            </h1>
            <p className="text-gray-400">
              Submit vulnerability reports and security fixes to protect the ecosystem
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Provider Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Provider Profile</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Organization</p>
                    <p className="text-white font-medium">{user?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 capitalize">
                      {user?.role || 'serviceProvider'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-white font-medium">
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Security Reports</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Combined Reports</span>
                    <span className="text-white font-medium">{submittedReports.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Reports with Bug Data</span>
                    <span className="text-red-400 font-medium">
                      {submittedReports.filter(r => r.bugData).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Reports with Fix Data</span>
                    <span className="text-green-400 font-medium">
                      {submittedReports.filter(r => r.fixData).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Success Rate</span>
                    <span className="text-blue-400 font-medium">98%</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Impact Metrics</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">2.3M</div>
                    <div className="text-gray-400 text-sm">Services Protected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">99.9%</div>
                    <div className="text-gray-400 text-sm">Uptime Maintained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">24h</div>
                    <div className="text-gray-400 text-sm">Avg Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Security Reporting Center</h2>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-5xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Submit Bug & Fix Report</h3>
                  <p className="text-gray-400 text-sm">Provide both vulnerability and fix information in a single submission</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Bug/Vulnerability Data (JSON Format)
                    </label>
                    <textarea
                      value={bugData}
                      onChange={(e) => setBugData(e.target.value)}
                      placeholder={`{\n  "cve": "CVE-2024-XXXX",\n  "severity": "critical",\n  "description": "Description of vulnerability",\n  "affected_versions": ["1.0", "1.1"],\n  "discovery_date": "2024-09-17",\n  "impact": "Remote code execution",\n  "reproduction_steps": "Steps to reproduce"\n}`}
                      className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none font-mono text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fix/Patch Data (JSON Format)
                    </label>
                    <textarea
                      value={fixData}
                      onChange={(e) => setFixData(e.target.value)}
                      placeholder={`{\n  "fix_id": "FIX-2024-XXXX",\n  "related_cve": "CVE-2024-XXXX",\n  "patch_version": "1.2.0",\n  "fix_description": "Description of the fix",\n  "deployment_date": "2024-09-17",\n  "testing_status": "verified",\n  "rollback_plan": "Rollback instructions"\n}`}
                      className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none font-mono text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSubmitReport}
                  className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 mx-auto min-w-64"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Bug & Fix Report
                </button>
                <p className="text-gray-500 text-sm mt-3">Both bug and fix data will be saved as a single record</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Submission History</h2>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              {submittedReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/20">
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Submitted At</th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Bug Data</th>
                        <th className="text-left py-4 px-6 text-gray-300 font-medium">Fix Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedReports.slice(0, 10).map((report) => (
                        <tr key={report.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 text-gray-300">
                            {formatDate(report.timestamp)}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              {report.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-300 font-mono text-sm max-w-xs">
                            {report.bugData ? (
                              <div className="truncate text-red-300">
                                {report.bugData.length > 50 ? `${report.bugData.substring(0, 50)}...` : report.bugData}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No bug data</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-300 font-mono text-sm max-w-xs">
                            {report.fixData ? (
                              <div className="truncate text-green-300">
                                {report.fixData.length > 50 ? `${report.fixData.substring(0, 50)}...` : report.fixData}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No fix data</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 px-6 text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 mb-2">No reports submitted yet</p>
                  <p className="text-gray-500 text-sm">Submit your first vulnerability or fix report above</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vulnerability Reporting Guidelines
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  Include CVE ID if available or request assignment
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  Provide clear description and reproduction steps
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  Specify affected versions and severity level
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  Use JSON format for structured data submission
                </li>
              </ul>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fix Submission Guidelines
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Link fixes to related CVE or vulnerability reports
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Include patch version and deployment timeline
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Provide testing status and verification details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Submit fixes promptly after vulnerability disclosure
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
