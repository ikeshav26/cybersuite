'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  
  const getDashboardRoute = () => {
    if (!user) return '/user-dashboard';
    return user.role === 'serviceProvider' ? '/provider-dashboard' : '/user-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative">
      <div className="fixed inset-0 z-0">
        <img 
          src="/background-auth.webp" 
          alt="Background" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Zero-Day 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> Protection</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                Bridge the critical security gap. Get vulnerability fixes from service providers 
                <span className="text-red-400 font-semibold"> before public patches</span> are released, 
                protecting your users during the most dangerous vulnerability window.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {!user ? (
                  <Link
                    href="/signup"
                    className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/20"
                  >
                    Start Free Protection
                  </Link>
                ) : (
                  <Link
                    href={getDashboardRoute()}
                    className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/20"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">FREE Plan Available • Premium Subscriptions Coming Soon</span>
              </div>
            </div>
          </div>
        </section>

        {/* Critical Security Gap Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                The Critical <span className="text-red-400">Security Gap</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                When servers discover vulnerabilities, there's a dangerous window between discovery and public patch release. 
                We eliminate this gap by providing immediate protection.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center hover:border-red-400/50 transition-all duration-300">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Vulnerability Discovered</h3>
                <p className="text-gray-400">
                  Server providers (Ubuntu, AWS, Vercel) discover security vulnerabilities in their systems before public disclosure.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center hover:border-blue-400/50 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Private Sharing</h3>
                <p className="text-gray-400">
                  Partners share vulnerability details and tested fixes with SecureAuth immediately - before working on public patches.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center hover:border-green-400/50 transition-all duration-300">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Instant Protection</h3>
                <p className="text-gray-400">
                  We automatically apply fixes to registered users' GitHub repos via Pull Requests - protecting them during the critical window.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Developers Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                For <span className="text-green-400">Developers</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Authorize your GitHub repos and get instant protection during critical vulnerability windows. 
                Stay secure while service providers work on official patches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-green-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Zero-Day Protection</h3>
                <p className="text-gray-400 text-sm">
                  Get security fixes immediately when vulnerabilities are discovered, not weeks later when patches are public.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m13 0h-6m-2-5L7 3m0 0L2 3m5 0v6m8 4v6m-2-2l2 2 2-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">GitHub Integration</h3>
                <p className="text-gray-400 text-sm">
                  Simple GitHub OAuth authorization. We automatically create Pull Requests with security fixes for your repositories.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Transparent Process</h3>
                <p className="text-gray-400 text-sm">
                  Review all Pull Requests before merging. Full visibility into what fixes are being applied and why.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Revolutionize Your Security?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Join the future of automated cybersecurity and protect what matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <Link
                  href="/signup"
                  className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300"
                >
                  Start Free Protection
                </Link>
              ) : (
                <Link
                  href={getDashboardRoute()}
                  className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
              )}
              <Link
                href="/about"
                className="border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
