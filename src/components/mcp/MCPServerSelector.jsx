import { useEffect, useState } from 'react';
import { mcpServerService } from '../../services/mcpServer';

export const MCPServerSelector = ({ selectedServer, onSelectServer }) => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServers();
    }, []);

    const loadServers = async () => {
        try {
            const data = await mcpServerService.getServers();
            const transformedData = data.map(server => ({
                ...server,
                id: server._id
            }));
            setServers(transformedData);
        } catch (error) {
            console.error('Failed to load servers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-sm text-gray-500">Loading servers...</div>;
    }

    return (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                MCP Server (Optional)
            </label>
            <select
                value={selectedServer?.id || ''}
                onChange={(e) => {
                    const server = servers.find(s => s.id === e.target.value);
                    onSelectServer(server || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
                <option value="">None (Local tools only)</option>
                {servers.map((server) => (
                    <option key={server.id} value={server.id}>
                        {server.name} - {server.url}
                    </option>
                ))}
            </select>
            {selectedServer && (
                <p className="mt-2 text-xs text-gray-600">
                    Using: <span className="font-medium">{selectedServer.name}</span>
                </p>
            )}
        </div>
    );
};
