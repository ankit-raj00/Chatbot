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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Add MCP Server</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Server Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="My MCP Server"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Server URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="input-field"
                            placeholder="https://example.com/mcp"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Authentication Type
                        </label>
                        <select
                            value={authType}
                            onChange={(e) => setAuthType(e.target.value)}
                            className="input-field"
                        >
                            <option value="none">None</option>
                            <option value="oauth">OAuth 2.0</option>
                        </select>
                    </div>

                    {authType === 'oauth' && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <h3 className="font-medium text-sm text-gray-900">OAuth Configuration</h3>

                            <input
                                type="text"
                                value={oauthConfig.client_id}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, client_id: e.target.value })}
                                className="input-field text-sm"
                                placeholder="Client ID"
                                required
                            />

                            <input
                                type="password"
                                value={oauthConfig.client_secret}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, client_secret: e.target.value })}
                                className="input-field text-sm"
                                placeholder="Client Secret"
                                required
                            />

                            <input
                                type="url"
                                value={oauthConfig.auth_url}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, auth_url: e.target.value })}
                                className="input-field text-sm"
                                placeholder="Authorization URL"
                                required
                            />

                            <input
                                type="url"
                                value={oauthConfig.token_url}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, token_url: e.target.value })}
                                className="input-field text-sm"
                                placeholder="Token URL"
                                required
                            />

                            <input
                                type="text"
                                value={oauthConfig.scopes}
                                onChange={(e) => setOauthConfig({ ...oauthConfig, scopes: e.target.value })}
                                className="input-field text-sm"
                                placeholder="Scopes (space-separated)"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
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
    );
};
