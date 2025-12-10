'use client';

import React from 'react';

interface ScanLog {
  timestamp: string;
  repoId: number | null;
  username: string | null;
  status: 'failed' | 'scanned' | 'scanning' | 'cloning';
  message: string;
}

interface ScanLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ScanLog[];
  loading: boolean;
}

const ScanLogsModal: React.FC<ScanLogsModalProps> = ({ isOpen, onClose, logs, loading }) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'failed':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'scanned':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'scanning':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'cloning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'failed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'scanned':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'scanning':
        return (
          <svg
            className="w-5 h-5 animate-spin"
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
        );
      case 'cloning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-black/95 border border-gray-800/50 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 p-6 border-b border-gray-800/50">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Scan Activity Logs</h3>
                <p className="text-sm text-gray-400">Real-time repository scanning status</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-400 font-medium">Loading scan logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No Scan Logs Yet</h4>
              <p className="text-gray-400 text-center max-w-md">
                Start scanning repositories to see detailed activity logs here. Each scan will be
                tracked with timestamps and status updates.
              </p>
            </div>
          ) : (
            <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
              {/* Log Header */}
              <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <span className="font-semibold">TIMESTAMP</span>
                  <span>•</span>
                  <span className="font-semibold">STATUS</span>
                  <span>•</span>
                  <span className="font-semibold">MESSAGE</span>
                </div>
                <div className="text-xs text-gray-500">{logs.length} entries</div>
              </div>

              {/* Log Lines */}
              <div className="divide-y divide-gray-900">
                {logs.map((log, index) => {
                  const timestamp = new Date(log.timestamp).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3,
                  });
                  
                  const getLogColor = (status: string) => {
                    switch (status) {
                      case 'failed':
                        return 'text-red-400';
                      case 'scanned':
                        return 'text-green-400';
                      case 'scanning':
                        return 'text-blue-400';
                      case 'cloning':
                        return 'text-yellow-400';
                      default:
                        return 'text-gray-400';
                    }
                  };

                  const getLogPrefix = (status: string) => {
                    switch (status) {
                      case 'failed':
                        return '✗';
                      case 'scanned':
                        return '✓';
                      case 'scanning':
                        return '⟳';
                      case 'cloning':
                        return '↓';
                      default:
                        return '•';
                    }
                  };

                  return (
                    <div
                      key={index}
                      className="group hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 px-4 py-2 font-mono text-xs">
                        {/* Line Number */}
                        <span className="text-gray-600 select-none w-8 text-right flex-shrink-0">
                          {String(index + 1).padStart(3, '0')}
                        </span>

                        {/* Timestamp */}
                        <span className="text-gray-500 flex-shrink-0 w-24">
                          {timestamp}
                        </span>

                        {/* Status */}
                        <span className={`${getLogColor(log.status)} flex-shrink-0 w-20 flex items-center gap-1`}>
                          <span>{getLogPrefix(log.status)}</span>
                          <span className="uppercase font-semibold">{log.status}</span>
                        </span>

                        {/* Message */}
                        <span className="text-gray-300 flex-1">
                          {log.message}
                        </span>

                        {/* Metadata */}
                        <div className="flex items-center gap-2 text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px]">
                            repo:{log.repoId || 'N/A'}
                          </span>
                          <span>|</span>
                          <span className="text-[10px]">
                            user:{log.username || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 p-6 border-t border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Total Logs:</span>
              </div>
              <span className="text-white font-bold text-base">{logs.length}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .bg-grid-white {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default ScanLogsModal;
