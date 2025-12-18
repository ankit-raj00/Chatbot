
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Add MCP Server</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Server Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-glass w-full"
                            placeholder="My MCP Server"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Server URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="input-glass w-full"
                            placeholder="https://example.com/mcp"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Authentication Type
                        </label>
                        <select
                            value={authType}
                            onChange={(e) => setAuthType(e.target.value)}
                            className="input-glass w-full appearance-none bg-[#0f172a]"
                        >
                            <option value="none">None</option>
                            <option value="oauth">OAuth 2.0</option>
                        </select>
                    </div>

                    {authType === 'oauth' && (
                        <div className="p-4 bg-white/5 rounded-xl space-y-4 border border-white/10">
                            <h3 className="font-semibold text-sm text-primary-300 uppercase tracking-wider mb-2">OAuth Configuration</h3>

                            <input
                                type="text"
                                value={oauthConfig.client_id}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, client_id: e.target.value })}
                                className="input-glass w-full text-sm"
                                placeholder="Client ID"
                                required
                            />

                            <input
                                type="password"
                                value={oauthConfig.client_secret}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, client_secret: e.target.value })}
                                className="input-glass w-full text-sm"
                                placeholder="Client Secret"
                                required
                            />

                            <input
                                type="url"
                                value={oauthConfig.auth_url}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, auth_url: e.target.value })}
                                className="input-glass w-full text-sm"
                                placeholder="Authorization URL"
                                required
                            />

                            <input
                                type="url"
                                value={oauthConfig.token_url}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, token_url: e.target.value })}
                                className="input-glass w-full text-sm"
                                placeholder="Token URL"
                                required
                            />

                            <input
                                type="text"
                                value={oauthConfig.scopes}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, scopes: e.target.value })}
                                className="input-glass w-full text-sm"
                                placeholder="Scopes (space-separated)"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium text-sm"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary px-6 py-2 shadow-lg shadow-primary/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </span>
                            ) : 'Add Server'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
