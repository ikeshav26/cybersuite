"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TermsAndConditionsPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-x-hidden">
      
      <div className="absolute inset-0">
        <img 
          src="/background-auth.webp" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>


      <div className="relative z-10 container mx-auto px-4 py-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl mb-6">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            SecureAuth Privacy Policy & Data Collection Terms
          </p>
        </div>


        <div className="max-w-4xl mx-auto">
          <div 
            className="backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12"
            style={{ backgroundColor: 'rgba(36, 36, 36, 0.95)' }}
          >
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to SecureAuth. By using our cybersecurity platform, you agree to these terms and conditions. 
                We prioritize your security while maintaining transparency about our data collection practices.
              </p>
            </div>


            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                Data Collection & Privacy
              </h2>
              
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4 border border-red-500/30">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ Security Monitoring</h3>
                  <p className="text-gray-300 mb-3">
                    For enhanced security and fraud prevention, we collect and monitor:
                  </p>
                  <ul className="space-y-2 text-gray-300 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span><strong>IP Address:</strong> To detect suspicious login attempts and prevent unauthorized access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span><strong>Geolocation Data:</strong> To verify login locations and alert you of unusual activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span><strong>Browser Details:</strong> Device fingerprinting for enhanced authentication security</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span><strong>ISP Information:</strong> To identify potential proxy or VPN usage</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4 border border-blue-500/30">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">🔒 Data Protection</h3>
                  <ul className="space-y-2 text-gray-300 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>All collected data is encrypted using industry-standard AES-256 encryption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Data is stored securely and never shared with third parties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Login history is maintained for 30 days for security auditing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Usage Terms
              </h2>
              
              <div className="space-y-3 text-gray-300">
                <p><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p><strong>Acceptable Use:</strong> Our platform must be used for legitimate purposes only. Any malicious activity is prohibited.</p>
                <p><strong>Service Availability:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted service.</p>
                <p><strong>Updates:</strong> We may update these terms periodically. Continued use constitutes acceptance of changes.</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Your Rights
              </h2>
              
              <div className="bg-black/20 rounded-xl p-4 border border-yellow-500/30">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span><strong>Data Access:</strong> Request a copy of your collected data at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span><strong>Data Deletion:</strong> Request deletion of your account and associated data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span><strong>Opt-out:</strong> Disable certain data collection features (may affect security)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span><strong>Notification:</strong> Be informed of any data breaches within 72 hours</span>
                  </li>
                </ul>
              </div>
            </div>



            <div className="border-t border-gray-700/50 pt-6">
              <div className="text-center">
                <button
                  onClick={() => router.back()}
                  className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Go Back
                </button>
              </div>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-gray-700/30">
              <p className="text-gray-500 text-sm">
                Last updated: September 19, 2025 | Version 1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
