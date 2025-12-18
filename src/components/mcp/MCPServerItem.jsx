import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

export const MCPServerItem = ({ server, onDelete, onTest }) => {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [oauthStatus, setOauthStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check OAuth status for Google Drive MCP
    useEffect(() => {
        if (server.name === 'Google Drive MCP') {
            checkOAuthStatus();
        }
    }, [server.name]);

    const checkOAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/oauth/google/status', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setOauthStatus(data);
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
            const response = await fetch('http://localhost:8000/oauth/google/disconnect', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                setOauthStatus(null);
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{server.name}</h3>
                    <p className="text-sm text-gray-500 break-all">{server.url}</p>
                    {oauthStatus?.connected && (
                        <p className="text-sm text-green-600 mt-1">
                            ✓ Connected as: {oauthStatus.email}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => onDelete(server.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete server"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={handleTest}
                    disabled={testing}
                    className="btn-secondary text-sm"
                >
                    {testing ? 'Testing...' : 'Test Connection'}
                </button>

                {server.name === 'Google Drive MCP' && (
                    oauthStatus?.connected ? (
                        <button
                            onClick={handleDisconnect}
                            disabled={loading}
                            className="btn-secondary text-sm bg-red-50 text-red-600 hover:bg-red-100"
                        >
                            {loading ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                const redirectUri = `${API_BASE_URL}/oauth/google/callback`;
                                window.location.href = `${API_BASE_URL}/oauth/google/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;
                            }}
                            className="btn-primary text-sm"
                        >
                            Connect Google Drive
                        </button>
                    )
                )}

                {testResult && (
                    <span className={`text-sm font-medium ${testResult.status === 'connected' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {testResult.status === 'connected'
                            ? `✓ ${testResult.tools?.length || 0} tools`
                            : '✗ Connection failed'}
                    </span>
                )}
            </div>

            {testResult?.status === 'connected' && testResult.tools?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Tools:</p>
                    <div className="space-y-1">
                        {testResult.tools.map((tool, idx) => (
                            <div key={idx} className="text-sm">
                                <span className="font-medium text-primary-600">{tool.name}</span>
                                {tool.description && (
                                    <span className="text-gray-500"> - {tool.description}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {testResult?.status === 'error' && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {testResult.error}
                </div>
            )}
        </div>
    );
};
