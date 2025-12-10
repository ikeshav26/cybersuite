'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { env } from '@/lib/env';
import * as aiService from '@/services/ai.service';
import ScanLogsModal from './ScanLogsModal';

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

interface RepositoryWithStatus extends Repository {
  isProtected: boolean;
  lastScan?: Date;
  vulnerabilitiesCount?: number;
  openPR?: {
    number: number;
    title: string;
    url: string;
    created_at: string;
  };
}

interface AppStatus {
  repositories: number;
  scans: number;
}

const AuthorizeGitHubTab = () => {
  const [githubUsername, setGithubUsername] = useState<string>('');
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);
  const [repositories, setRepositories] = useState<RepositoryWithStatus[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [installationId, setInstallationId] = useState<string>('');
  const [appInstalled, setAppInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const hasFetchedRef = useRef(false);
  const [scanningRepos, setScanningRepos] = useState<Set<number>>(new Set());
  const [fixingRepos, setFixingRepos] = useState<Set<number>>(new Set());
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Handler for viewing scan logs
  const handleScanLogs = async () => {
    setLoadingLogs(true);
    setShowLogsModal(true);
    try {
      const response = await fetch('http://localhost:4000/api/scan/logs');
      const data = await response.json();
      if (data.success) {
        setScanLogs(data.scan_logs);
      } else {
        toast.error('Failed to fetch scan logs');
      }
    } catch (error) {
      console.error('Error fetching scan logs:', error);
      toast.error('Failed to fetch scan logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Handler for SecureBot scan
  const handleSecureBotScan = async (repoId: number, repoName: string) => {
    if (!githubUsername) {
      toast.error('GitHub username not found');
      return;
    }

    setScanningRepos((prev) => new Set(prev).add(repoId));
    const toastId = toast.loading(`Scanning ${repoName}...`);

    try {
      const result = await aiService.secureBotScan(repoId, githubUsername);

      toast.success(`Found ${result.scan_results.summary.total} issues in ${repoName}`, {
        id: toastId,
      });

      // Update repository with scan results
      setRepositories((prev) =>
        prev.map((repo) =>
          repo.id === repoId
            ? { ...repo, vulnerabilitiesCount: result.scan_results.summary.total }
            : repo
        )
      );
    } catch (error) {
      console.error('Error scanning repository:', error);
      toast.error(`Failed to scan ${repoName}`, { id: toastId });
    } finally {
      setScanningRepos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(repoId);
        return newSet;
      });
    }
  };

  // Handler for SecureBot fix
  const handleSecureBotFix = async (repoId: number, repoName: string) => {
    if (!githubUsername) {
      toast.error('GitHub username not found');
      return;
    }

    setFixingRepos((prev) => new Set(prev).add(repoId));
    const toastId = toast.loading(`Fixing security issues in ${repoName}...`);

    try {
      const result = await aiService.secureBotFix(repoId, githubUsername);

      if (result.pull_request) {
        toast.success(
          <div>
            <p>Fixed {result.summary.fixes_applied} issues!</p>
            <a
              href={result.pull_request.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              View PR #{result.pull_request.number}
            </a>
          </div>,
          { id: toastId, duration: 5000 }
        );

        // Update repository with PR info
        setRepositories((prev) =>
          prev.map((repo) =>
            repo.id === repoId
              ? {
                  ...repo,
                  openPR: {
                    number: result.pull_request!.number,
                    title: result.pull_request!.title,
                    url: result.pull_request!.html_url,
                    created_at: new Date().toISOString(),
                  },
                }
              : repo
          )
        );
      } else {
        toast(`No fixes applied for ${repoName}`, { id: toastId });
      }
    } catch (error) {
      console.error('Error fixing repository:', error);
      toast.error(`Failed to fix ${repoName}`, { id: toastId });
    } finally {
      setFixingRepos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(repoId);
        return newSet;
      });
    }
  };

  const fetchRepositories = useCallback(
    async (username?: string, instId?: string) => {
      const user = username || githubUsername;
      const id = instId || installationId;

      if (!user.trim() || !id.trim()) {
        return;
      }

      try {
        setFetchingRepos(true);
        const response = await aiService.fetchUserRepositories(user, Number(id));

        console.log('Repository fetch response:', response);

        if (response && 'repositories' in response && response.repositories) {
          localStorage.setItem('github_username', user);
          localStorage.setItem('github_installation_id', id);

          console.log('Fetching status for repositories:', response.repositories);

          const reposWithStatus = await Promise.all(
            response.repositories.map(async (repo) => {
              try {
                const [owner, repoName] = repo.full_name!.split('/');
                console.log('Fetching status for:', owner, repoName);
                const status = await aiService.getRepositoryStatus(owner, repoName);
                return {
                  ...repo,
                  isProtected: true,
                  lastScan: status.lastScan,
                  vulnerabilitiesCount: status.vulnerabilitiesCount,
                  openPR: status.openPR,
                };
              } catch (error) {
                console.error('Error fetching status for', repo.full_name, error);
                return {
                  ...repo,
                  isProtected: true,
                  vulnerabilitiesCount: 0,
                };
              }
            })
          );

          console.log('Repos with status:', reposWithStatus);

          setRepositories(reposWithStatus);
          setAppStatus({
            repositories: response.repository_count,
            scans: reposWithStatus.filter((r) => 'lastScan' in r && r.lastScan).length,
          });
          setAppInstalled(true);

          // Only show success toast if we haven't shown it before
          if (!hasFetchedRef.current) {
            toast.success(`Found ${response.repository_count} protected repositories`);
            hasFetchedRef.current = true;
          }
        } else {
          console.log('No repositories found or app not installed:', {
            success: response && 'success' in response ? response.success : false,
            installed: response && 'installed' in response ? response.installed : false,
            count: response && 'repository_count' in response ? response.repository_count : 0,
          });
          setAppInstalled(false);
          setAppStatus(null);

          // Only show error toast once
          if (!hasFetchedRef.current) {
            if (response && 'success' in response && !response.success) {
              toast.error('Failed to fetch repositories from GitHub. Check AI service logs.');
            } else if (
              response &&
              'repository_count' in response &&
              response.repository_count === 0
            ) {
              toast.error(
                'No repositories found. Please grant repository access to the GitHub App.'
              );
            }
            hasFetchedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setRepositories([]);
        setAppInstalled(false);
        setAppStatus(null);

        // Only show error toast once
        if (!hasFetchedRef.current) {
          toast.error('Failed to fetch repositories. Make sure the AI service is running.');
          hasFetchedRef.current = true;
        }
      } finally {
        setFetchingRepos(false);
      }
    },
    [githubUsername, installationId]
  );

  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedRef.current) {
      return;
    }

    // Check for OAuth callback params
    const urlParams = new URLSearchParams(window.location.search);
    const githubAuth = urlParams.get('github_auth');
    const username = urlParams.get('username');
    const instId = urlParams.get('installation_id');
    const error = urlParams.get('error');
    const debugSlugs = urlParams.get('debug_slugs');

    console.log('OAuth callback params:', { githubAuth, username, instId, error, debugSlugs });

    if (githubAuth === 'error' && error) {
      toast.error(`GitHub OAuth failed: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (githubAuth === 'success' && username) {
      setGithubUsername(username);
      setIsConnected(true);
      localStorage.setItem('github_username', username);

      if (instId) {
        setInstallationId(instId);
        localStorage.setItem('github_installation_id', instId);
        toast.success('GitHub connected successfully!');
        fetchRepositories(username, instId);
      } else {
        if (debugSlugs && debugSlugs !== 'none') {
          toast.error(`GitHub App "hacknauts-cybersec" not found. Available: ${debugSlugs}`);
        } else {
          toast.success('GitHub connected! Please install the GitHub App to continue.');
        }
      }

      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Check for saved credentials
    const savedUsername = localStorage.getItem('github_username');
    const savedInstallationId = localStorage.getItem('github_installation_id');

    console.log('Saved credentials:', { savedUsername, savedInstallationId });

    if (savedUsername) {
      setGithubUsername(savedUsername);
      setIsConnected(true);
    }
    if (savedInstallationId) {
      setInstallationId(savedInstallationId);
    }

    if (savedUsername && savedInstallationId) {
      fetchRepositories(savedUsername, savedInstallationId);
    }
  }, []);

  const handleGitHubConnect = () => {
    const authUrl = `${env.API_URL}/auth/oauth/github`;
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    setGithubUsername('');
    setInstallationId('');
    setIsConnected(false);
    setAppInstalled(false);
    setRepositories([]);
    setAppStatus(null);
    localStorage.removeItem('github_username');
    localStorage.removeItem('github_installation_id');
    toast.success('GitHub disconnected');
  };


  const handleLogs=()=>{
    try{

    }catch(err){

    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Repository Protection</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">GitHub App Setup</h3>
              <p className="text-gray-400 text-sm">Connect repositories for automatic protection</p>
            </div>
          </div>

          <div className="space-y-4">
            {!isConnected ? (
              <>
                <div className="text-center py-8 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                  <button
                    onClick={handleGitHubConnect}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Connect with GitHub
                  </button>
                  <p className="text-gray-500 text-sm mt-3">Authorize with GitHub to get started</p>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">What happens next?</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Connect your GitHub account via OAuth</li>
                    <li>• Install the GitHub App on your repositories</li>
                    <li>• Automatic vulnerability scanning begins</li>
                    <li>• Receive AI-powered security patches</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 font-medium">GitHub Connected</span>
                      </div>
                      <p className="text-gray-300 text-sm">@{githubUsername}</p>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {!installationId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm mb-4 text-center">
                        GitHub App not installed yet
                      </p>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <a
                          href={`https://github.com/apps/${env.GITHUB_APP_NAME}/installations/new`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-2/3 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          <span className="truncate">Install GitHub App</span>
                        </a>
                        <button
                          onClick={handleGitHubConnect}
                          className="w-2/3 inline-flex items-cen`ter justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
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
                          <span className="truncate">Check Installation</span>
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs mt-3 text-center">
                        Click Install, then Check Installation to sync
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">GitHub App Installed</span>
                    </div>
                    <p className="text-gray-300 text-sm">Installation ID: {installationId}</p>
                  </div>
                )}

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">Features</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Automatic vulnerability scanning</li>
                    <li>• AI-powered security patches</li>
                    <li>• Real-time threat monitoring</li>
                    <li>• Zero-day protection via Pull Requests</li>
                  </ul>
                </div>
              </>
            )}
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
                <h3 className="text-lg font-semibold text-white">Protection Status</h3>
                <p className="text-gray-400 text-sm">AI-powered repository security</p>
              </div>
            </div>
          </div>

          {appInstalled && appStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {appStatus.repositories}
                  </div>
                  <div className="text-gray-400 text-sm">Protected Repos</div>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{appStatus.scans}</div>
                  <div className="text-gray-400 text-sm">Security Scans</div>
                </div>
              </div>

              {/* Debug info */}
              <div className="text-xs text-gray-500">
                Debug: repositories.length = {repositories.length}, appInstalled ={' '}
                {String(appInstalled)}
              </div>

              {repositories.length > 0 ? (
                <div className="p-4 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Protected Repositories</h4>
                    <button
                      onClick={() => fetchRepositories()}
                      disabled={fetchingRepos}
                      className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                      aria-label="Refresh repositories"
                    >
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
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-medium truncate text-sm">{repo.name}</p>
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
                            <p className="text-gray-400 text-xs truncate mb-2">
                              {repo.description || 'No description'}
                            </p>

                            {repo.vulnerabilitiesCount !== undefined &&
                              repo.vulnerabilitiesCount > 0 && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                    ⚠️ {repo.vulnerabilitiesCount} vulnerabilities
                                  </span>
                                </div>
                              )}

                            {repo.openPR && (
                              <div className="flex items-center gap-2 mb-2">
                                <a
                                  href={repo.openPR.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                                >
                                  🔧 PR #{repo.openPR.number}: {repo.openPR.title}
                                </a>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>⭐ {repo.stargazers_count || 0}</span>
                              <span>🍴 {repo.forks_count || 0}</span>
                              {repo.lastScan && (
                                <span>
                                  Last scan: {new Date(repo.lastScan).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleSecureBotScan(repo.id, repo.name)}
                                disabled={scanningRepos.has(repo.id) || fixingRepos.has(repo.id)}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                              >
                                {scanningRepos.has(repo.id) ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Scanning...
                                  </>
                                ) : (
                                  <>🔍 Scan</>
                                )}
                              </button>

                              <button
                                onClick={() => handleSecureBotFix(repo.id, repo.name)}
                                disabled={scanningRepos.has(repo.id) || fixingRepos.has(repo.id)}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                              >
                                {fixingRepos.has(repo.id) ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Fixing...
                                  </>
                                ) : (
                                  <>🔧 Auto-Fix</>
                                )}
                              </button>
                               <button
                                onClick={() => handleScanLogs()}
                                disabled={scanningRepos.has(repo.id) || fixingRepos.has(repo.id)}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                              >
                                {fixingRepos.has(repo.id) ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Checking logs..
                                  </>
                                ) : (
                                  <>🔧 Check-logs</>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center ml-3 gap-2">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-white transition-colors"
                              title="View on GitHub"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </a>
                            <div className="flex items-center text-green-400">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                              <span className="text-xs font-medium">Protected</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                  <p className="text-yellow-400 text-sm">No repositories found</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Make sure you&apos;ve granted repository access to the GitHub App
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-gray-400 mb-2">No repositories loaded</p>
              <p className="text-gray-500 text-sm">
                Install the GitHub App and enter your details to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scan Logs Modal */}
      <ScanLogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        logs={scanLogs}
        loading={loadingLogs}
      />
    </div>
  );
};

export default AuthorizeGitHubTab;
