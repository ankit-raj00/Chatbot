import { useState, useEffect } from 'react';
import { mcpServerService } from '../../services/mcpServer';
import { MCPServerItem } from './MCPServerItem';
import { AddMCPServerModal } from './AddMCPServerModal';

export const MCPServerManager = () => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadServers();
    }, []);

    const loadServers = async () => {
        try {
            const data = await mcpServerService.getServers();
            // Map _id to id for frontend compatibility
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

    const handleAddServer = async (name, url, authType, oauthConfig) => {
        const newServer = await mcpServerService.addServer(name, url, authType, oauthConfig);
        setServers([{ ...newServer, id: newServer._id }, ...servers]);
    };

    const handleDeleteServer = async (id) => {
        if (!confirm('Are you sure you want to delete this server?')) return;

        try {
            await mcpServerService.deleteServer(id);
            setServers(servers.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete server:', error);
            alert('Failed to delete server');
        }
    };

    const handleTestConnection = async (id) => {
        return await mcpServerService.testConnection(id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading servers...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">MCP Servers</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    + Add Server
                </button>
            </div>

            {servers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No MCP servers</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new MCP server.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary"
                        >
                            + Add Your First Server
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {servers.map((server) => (
                        <MCPServerItem
                            key={server.id}
                            server={server}
                            onDelete={handleDeleteServer}
                            onTest={handleTestConnection}
                        />
                    ))}
                </div>
            )}

            <AddMCPServerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddServer}
            />
        </div>
    );
};
