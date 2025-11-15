import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
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

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">SecureAuth</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A revolutionary hackathon project bridging the critical vulnerability gap through innovative 
              partnerships with service providers and automated GitHub integration.
            </p>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <div className="bg-red-500/20 p-3 rounded-2xl mr-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white">The Problem</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                When server providers discover vulnerabilities, there&apos;s a critical window (days to weeks) 
                before public patches are released. During this time, services remain vulnerable while 
                attackers may already be exploiting the security gaps.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <div className="bg-green-500/20 p-3 rounded-2xl mr-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white">Our Solution</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                SecureAuth creates partnerships with service providers (Ubuntu, Vercel, AWS) to receive 
                vulnerability information and fixes privately. We then automatically apply these fixes 
                to our users&apos; GitHub repositories via Pull Requests, providing immediate protection.
              </p>
            </div>
          </div>

          <div className="mb-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                <span className="text-blue-400">Hackathon Innovation</span> - Zero-Day Protection Platform
              </h2>
              <p className="text-gray-400">
                This project represents a novel approach to cybersecurity, creating a collaborative ecosystem 
                between service providers and developers for proactive vulnerability management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Partnership Model</h3>
                <p className="text-gray-400 text-sm">
                  Collaborate with major service providers to receive early vulnerability intelligence
                </p>
              </div>

              <div className="bg-black/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m13 0h-6m-2-5L7 3m0 0L2 3m5 0v6m8 4v6m-2-2l2 2 2-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">GitHub Integration</h3>
                <p className="text-gray-400 text-sm">
                  Seamless OAuth integration with automatic Pull Request generation for security fixes
                </p>
              </div>

              <div className="bg-black/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Protection</h3>
                <p className="text-gray-400 text-sm">
                  Real-time vulnerability scanning and instant deployment of security patches
                </p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Technical <span className="text-purple-400">Architecture</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  Backend Stack
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• <span className="text-green-400">Node.js</span> & Express.js server</li>
                  <li>• <span className="text-blue-400">MongoDB</span> for data persistence</li>
                  <li>• <span className="text-yellow-400">JWT</span> authentication system</li>
                  <li>• <span className="text-purple-400">GitHub API</span> integration</li>
                  <li>• <span className="text-red-400">Real-time</span> vulnerability processing</li>
                </ul>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Frontend Stack
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• <span className="text-cyan-400">Next.js</span> with App Router</li>
                  <li>• <span className="text-pink-400">Tailwind CSS</span> for styling</li>
                  <li>• <span className="text-green-400">Axios</span> for API communication</li>
                  <li>• <span className="text-orange-400">Zustand</span> for state management</li>
                  <li>• <span className="text-purple-400">TypeScript</span> for type safety</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Hackathon Innovation Challenge
            </h2>
            
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              This project tackles the critical cybersecurity challenge of zero-day vulnerability protection 
              through innovative partnerships and automated GitHub integration - representing the future of 
              collaborative security.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">⚡</div>
                <div className="text-sm text-gray-400">Real-time Protection</div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">🤝</div>
                <div className="text-sm text-gray-400">Partner Ecosystem</div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">🔄</div>
                <div className="text-sm text-gray-400">Auto GitHub PRs</div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-400">🛡️</div>
                <div className="text-sm text-gray-400">Zero-Day Shield</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300"
              >
                Join the Beta
              </Link>
              <Link
                href="/contact"
                className="border border-orange-400/50 text-orange-400 px-8 py-3 rounded-xl font-semibold hover:bg-orange-400/10 transition-colors duration-300"
              >
                Partner with Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
