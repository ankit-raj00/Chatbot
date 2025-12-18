
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
                <div className="text-slate-400">Loading servers...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">MCP Servers</h1>
                    <p className="text-slate-400">Manage your Model Context Protocol connections</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Server
                </button>
            </div>

            {servers.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="h-10 w-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-xl font-medium text-white">No MCP servers</h3>
                    <p className="mt-2 text-slate-400 max-w-sm mx-auto">Extend Gemini's capabilities by connecting to external tools and data sources.</p>
                    <div className="mt-8">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all font-medium border border-white/10"
                        >
                            Connect Your First Server
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
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
