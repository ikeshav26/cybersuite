"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { env } from '@/lib/env';
import { useRouter, useSearchParams } from 'next/navigation';

interface Repository {
  id: number;
  name: string;
  full_name?: string;
  description?: string;
  html_url: string;
  private: boolean;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  updated_at: string;
}

interface SecureBotStatus {
  repositories: number;
  scans: number;
}

const AuthorizeGitHubTab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secureBotStatus, setSecureBotStatus] = useState<SecureBotStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);

  useEffect(() => {
    checkGitHubConnection();
    
    const githubConnected = searchParams?.get('github_connected');
    const error = searchParams?.get('error');

    if (githubConnected === 'true') {
      toast.success('GitHub connected successfully!');
      setIsConnected(true);
      checkSecureBotStatus();
      router.replace('/user-dashboard');
    } else if (error) {
      const errorMessages: Record<string, string> = {
        token_exchange_failed: 'Failed to exchange authorization code',
        server_error: 'Server error during GitHub authentication',
      };
      toast.error(errorMessages[error] || 'GitHub connection failed. Please try again.');
      router.replace('/user-dashboard');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (isConnected && githubUser) {
      fetchRepositoriesFromSecureBot();
    }
  }, [isConnected, githubUser]);

  const checkGitHubConnection = async () => {
    try {
      const response = await axios.get(
        `${env.API_URL}/user/github/status`,
        { withCredentials: true }
      );
      setIsConnected(true);
      setGithubUser(response.data.githubUser);
      setSecureBotStatus(response.data.secureBotStatus);

      if (response.data.githubUser) {
        fetchRepositoriesFromSecureBot();
      }
    } catch (error) {
      setIsConnected(false);
      setGithubUser(null);
      setSecureBotStatus(null);
      setRepositories([]);
    }
  };

  const handleGitHubAuth = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${env.API_URL}/user/github/auth`,
        { withCredentials: true }
      );

      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('GitHub auth error:', error);
      toast.error('Failed to initiate GitHub authorization');
    } finally {
      setLoading(false);
    }
  };

  const checkSecureBotStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await axios.get(
        `${env.API_URL}/user/github/status`,
        { withCredentials: true }
      );
      setSecureBotStatus(response.data.secureBotStatus);

      if (response.data.secureBotStatus && githubUser) {
        fetchRepositoriesFromSecureBot();
      }
    } catch (error) {
      console.error('Error checking SecureBot status:', error);
      toast.error('Failed to check SecureBot status');
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchRepositoriesFromSecureBot = async () => {
    if (!githubUser) return;

    try {
      setFetchingRepos(true);
      const response = await axios.get(
        `${env.SECUREBOT_URL}/user/${githubUser}/repositories`
      );

      if (response.data.success) {
        setRepositories(response.data.repositories || []);
        setSecureBotStatus(
          response.data.installed
            ? {
                repositories: response.data.repository_count,
                scans: 0,
              }
            : null
        );
      } else {
        setRepositories([]);
        if (!response.data.installed) {
          toast('Install SecureBot GitHub App to see your repositories');
        }
      }
    } catch (error) {
      console.error('Error fetching repositories from SecureBot:', error);
      setRepositories([]);
    } finally {
      setFetchingRepos(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(
        `${env.API_URL}/user/github/disconnect`,
        {},
        { withCredentials: true }
      );
      setIsConnected(false);
      setGithubUser(null);
      setSecureBotStatus(null);
      setRepositories([]);
      toast.success('GitHub disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      toast.error('Failed to disconnect GitHub');
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Repository Protection
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                GitHub Integration
              </h3>
              <p className="text-gray-400 text-sm">
                Connect your repositories for automatic protection
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isConnected
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}
                ></div>
                <div>
                  <span
                    className={`font-medium ${
                      isConnected ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  {isConnected && githubUser && (
                    <p className="text-gray-400 text-sm">@{githubUser}</p>
                  )}
                </div>
              </div>

              {isConnected ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      checkSecureBotStatus();
                      fetchRepositoriesFromSecureBot();
                    }}
                    disabled={checkingStatus || fetchingRepos}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    {checkingStatus || fetchingRepos ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    {checkingStatus || fetchingRepos
                      ? 'Refreshing...'
                      : 'Refresh'}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGitHubAuth}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  Authorize GitHub
                </button>
              )}
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">
                Why Connect GitHub?
              </h4>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Automatic vulnerability scanning</li>
                <li>• Instant security patch deployment</li>
                <li>• Real-time threat monitoring</li>
                <li>• Zero-day protection via Pull Requests</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  SecureBot Protection
                </h3>
                <p className="text-gray-400 text-sm">
                  AI-powered repository security scanning
                </p>
              </div>
            </div>
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-gray-400 mb-4">
                Connect GitHub to enable SecureBot
              </p>
              <p className="text-gray-500 text-sm">
                SecureBot requires GitHub access to scan and protect your
                repositories
              </p>
            </div>
          ) : secureBotStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <span className="font-medium text-green-400">
                      SecureBot Installed
                    </span>
                    <p className="text-gray-400 text-sm">
                      GitHub App is active and monitoring
                    </p>
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {secureBotStatus.repositories || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Protected Repos</div>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {secureBotStatus.scans || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Security Scans</div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h4 className="text-yellow-400 font-medium mb-2">
                  SecureBot Features
                </h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Real-time vulnerability detection
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Automated security patches via PR
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Dependency security monitoring
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Code quality analysis
                  </li>
                </ul>
              </div>

              {repositories.length > 0 && (
                <div className="p-4 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">
                      Protected Repositories
                    </h4>
                    {fetchingRepos && (
                      <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium truncate text-sm">
                              {repo.name}
                            </p>
                            {repo.private && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Private
                              </span>
                            )}
                            {repo.language && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                {repo.language}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs truncate">
                            {repo.description || 'No description available'}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>⭐ {repo.stargazers_count || 0}</span>
                            <span>🍴 {repo.forks_count || 0}</span>
                            <span>
                              Updated:{' '}
                              {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center ml-3">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors mr-3"
                            title="View on GitHub"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                          <div className="flex items-center text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Protected
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                  <div>
                    <span className="font-medium text-orange-400">
                      SecureBot Not Installed
                    </span>
                    <p className="text-gray-400 text-sm">
                      Install GitHub App to enable protection
                    </p>
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-3">Next Steps</h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs rounded-full mr-3 mt-0.5 flex-shrink-0">
                      1
                    </span>
                    <span>Visit your GitHub account settings</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs rounded-full mr-3 mt-0.5 flex-shrink-0">
                      2
                    </span>
                    <span>Search for &quot;SecureBot&quot; GitHub App</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs rounded-full mr-3 mt-0.5 flex-shrink-0">
                      3
                    </span>
                    <span>Install and authorize the app</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs rounded-full mr-3 mt-0.5 flex-shrink-0">
                      4
                    </span>
                    <span>Return and click &quot;Check Status&quot;</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorizeGitHubTab;
