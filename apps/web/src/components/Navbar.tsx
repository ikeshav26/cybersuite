"use client";

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { usePathname } from "next/navigation";

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthPage, setisAuthPage] = useState(false)
  const router = useRouter();
  const pathname=usePathname();
  
  useEffect(()=>{
    if(pathname=="/login" || pathname=="/signup" || pathname=="/terms-and-conditions"){
      setisAuthPage(true);
    }else{
      setisAuthPage(false);
    }
  }, [pathname])

  if(isAuthPage) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();

      clearAuth();
      toast.success("Logged out successfully");
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'serviceProvider':
        return '/provider-dashboard';
      default:
        return '/user-dashboard';
    }
  };

  const getDashboardText = () => {
    if (!user) return 'Dashboard';
    
    switch (user.role) {
      case 'admin':
        return 'Admin Panel';
      case 'serviceProvider':
        return 'Provider Panel';
      default:
        return 'Dashboard';
    }
  };

  

  return (
    <nav className="bg-black/90 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">
                Secure<span className="text-gray-400">Auth</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white/10"
              >
                Home
              </Link>
              
              {user && (
                <Link 
                  href={getDashboardRoute()} 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white/10 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {getDashboardText()}
                </Link>
              )}
              
              <Link 
                href="/about" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white/10"
              >
                About Us
              </Link>
              
              <Link 
                href="/contact" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-white to-gray-300 rounded-full">
                      <span className="text-black text-sm font-bold">
                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {user.username || 'User'}
                      </p>
                      {user.role && (
                        <p className="text-xs text-gray-400 capitalize">
                          {user.role}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                        Logging out...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/50 backdrop-blur-xl rounded-xl mt-2 border border-gray-800/50">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {user && (
                <Link 
                  href={getDashboardRoute()} 
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {getDashboardText()}
                </Link>
              )}
              
              <Link 
                href="/about" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              
              <Link 
                href="/contact" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>

              {user ? (
                <div className="border-t border-gray-700/50 mt-4 pt-4">
                  <div className="flex items-center space-x-3 px-3 py-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-white to-gray-300 rounded-full">
                      <span className="text-black text-sm font-bold">
                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.username || 'User'}
                      </p>
                      {user.role && (
                        <p className="text-xs text-gray-400 capitalize">
                          {user.role}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left text-red-400 hover:text-red-300 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-700/50 mt-4 pt-4 space-y-2">
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white text-black block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 transition-colors duration-200 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
