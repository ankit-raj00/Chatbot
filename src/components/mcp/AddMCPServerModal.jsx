
import { useState } from 'react';

export const AddMCPServerModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [authType, setAuthType] = useState('none');
    const [oauthConfig, setOauthConfig] = useState({
        client_id: '',
        client_secret: '',
        auth_url: '',
        token_url: '',
        scopes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onAdd(name, url, authType, authType === 'oauth' ? oauthConfig : null);
            setName('');
            setUrl('');
            setAuthType('none');
            setOauthConfig({ client_id: '', client_secret: '', auth_url: '', token_url: '', scopes: '' });
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add server');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="w-full max-w-md rounded-xl border shadow-lg p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
                    style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Add MCP Server
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                Server Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-minimal"
                                placeholder="My MCP Server"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                Server URL
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="input-minimal"
                                placeholder="https://example.com/mcp"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                Authentication
                            </label>
                            <select
                                value={authType}
                                onChange={(e) => setAuthType(e.target.value)}
                                className="input-minimal"
                            >
                                <option value="none">None</option>
                                <option value="oauth">OAuth 2.0</option>
                            </select>
                        </div>

                        {authType === 'oauth' && (
                            <div
                                className="p-4 rounded-lg border space-y-3"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    OAuth Configuration
                                </p>
                                <input
                                    type="text"
                                    value={oauthConfig.client_id}
                                    onChange={(e) => setOauthConfig({ ...oauthConfig, client_id: e.target.value })}
                                    className="input-minimal text-sm"
                                    placeholder="Client ID"
                                    required
                                />
                                <input
                                    type="password"
                                    value={oauthConfig.client_secret}
                                    onChange={(e) => setOauthConfig({ ...oauthConfig, client_secret: e.target.value })}
                                    className="input-minimal text-sm"
                                    placeholder="Client Secret"
                                    required
                                />
                                <input
                                    type="url"
                                    value={oauthConfig.auth_url}
                                    onChange={(e) => setOauthConfig({ ...oauthConfig, auth_url: e.target.value })}
                                    className="input-minimal text-sm"
                                    placeholder="Authorization URL"
                                    required
                                />
                                <input
                                    type="url"
                                    value={oauthConfig.token_url}
                                    onChange={(e) => setOauthConfig({ ...oauthConfig, token_url: e.target.value })}
                                    className="input-minimal text-sm"
                                    placeholder="Token URL"
                                    required
                                />
                                <input
                                    type="text"
                                    value={oauthConfig.scopes}
                                    onChange={(e) => setOauthConfig({ ...oauthConfig, scopes: e.target.value })}
                                    className="input-minimal text-sm"
                                    placeholder="Scopes (space-separated)"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg text-sm text-red-500" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Server'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
