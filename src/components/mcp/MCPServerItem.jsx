
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const MCPServerItem = ({ server, onDelete, onTest }) => {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [oauthStatus, setOauthStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (server.name === 'Google Drive MCP') {
            checkOAuthStatus();
        }
    }, [server.name]);

    const checkOAuthStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/google-drive/status`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setOauthStatus({ connected: data.authenticated, email: data.email });
            }
        } catch (error) {
            console.error('Failed to check OAuth status:', error);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your Google Drive account? This will delete your stored credentials.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/oauth/google/disconnect`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                setOauthStatus({ connected: false });
                alert('Google Drive disconnected successfully');
            }
        } catch (error) {
            alert('Failed to disconnect');
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            const result = await onTest(server.id);
            setTestResult(result);
        } catch (error) {
            setTestResult({ status: 'error', error: 'Failed to test connection' });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">{server.name}</h3>
                    <p className="text-sm text-slate-400 font-mono break-all opacity-80">{server.url}</p>
                    {oauthStatus?.connected && (
                        <p className="text-sm text-green-400 mt-2 flex items-center gap-1.5 bg-green-500/10 w-fit px-2 py-1 rounded-lg border border-green-500/20">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Connected
                        </p>
                    )}
                </div>
                <button
                    onClick={() => onDelete(server.id)}
                    className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Delete server"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center flex-wrap gap-3">
                <button
                    onClick={handleTest}
                    disabled={testing}
                    className="btn-secondary text-sm py-2 px-4 shadow-none hover:shadow-lg"
                >
                    {testing ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Testing...
                        </span>
                    ) : 'Test Connection'}
                </button>

                {server.name === 'Google Drive MCP' && (
                    oauthStatus?.connected ? (
                        <button
                            onClick={handleDisconnect}
                            disabled={loading}
                            className="btn-secondary text-sm bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
                        >
                            {loading ? 'Disconnecting...' : 'Disconnect Drive'}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                const redirectUri = `${API_BASE_URL}/oauth/google/callback`;
                                window.location.href = `${API_BASE_URL}/oauth/google/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;
                            }}
                            className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Connect Google Drive
                        </button>
                    )
                )}

                {testResult && (
                    <span className={`text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-2 ${testResult.status === 'connected'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {testResult.status === 'connected'
                            ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {testResult.tools?.length || 0} tools found
                                </>
                            )
                            : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Connection failed
                                </>
                            )}
                    </span>
                )}
            </div>

            {testResult?.status === 'connected' && testResult.tools?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Available Tools</p>
                    <div className="space-y-2">
                        {testResult.tools.map((tool, idx) => (
                            <div key={idx} className="text-sm bg-black/20 p-2 rounded-lg border border-white/5">
                                <span className="font-semibold text-primary-300 block mb-0.5">{tool.name}</span>
                                {tool.description && (
                                    <span className="text-slate-400 text-xs block leading-relaxed">{tool.description}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {testResult?.status === 'error' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
                    Error: {testResult.error}
                </div>
            )}
        </div>
    );
};
