
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

export const ToolsSidebar = ({
    mcpServers,
    selectedMcpServers,
    onToggleMcpServer,
    selectedTools,
    onToolsChange
}) => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [googleDriveAuth, setGoogleDriveAuth] = useState(false);

    useEffect(() => {
        const init = async () => {
            await checkGoogleDriveAuth();
            await fetchTools();
        };
        init();
    }, []);

    const fetchTools = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/tools`);
            const data = await response.json();
            setTools(data.tools);

            if (selectedTools.length === 0 && data.tools.length > 0) {
                const toolsToEnable = data.tools.filter(tool => {
                    if (!tool.requires_auth) return true;
                    if (tool.category === 'google_drive') return googleDriveAuth;
                    return false;
                }).map(t => t.tool_id);
                onToolsChange(toolsToEnable);
            }
        } catch (error) {
            console.error('Failed to fetch tools:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkGoogleDriveAuth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/google-drive/status`, {
                credentials: 'include'
            });
            const data = await response.json();
            setGoogleDriveAuth(data.authenticated);
        } catch (error) {
            console.error('Failed to check Google Drive auth:', error);
        }
    };

    const handleConnectGoogleDrive = () => {
        const redirectUri = `${API_BASE_URL}/oauth/google/callback`;
        window.location.href = `${API_BASE_URL}/oauth/google/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;
    };

    const handleDisconnectGoogleDrive = async () => {
        if (!confirm('Are you sure you want to disconnect your Google Drive account?')) {
            return;
        }
        try {
            await fetch(`${API_BASE_URL}/oauth/google/disconnect`, {
                method: 'POST',
                credentials: 'include'
            });
            setGoogleDriveAuth(false);
            const nonGoogleDriveTools = selectedTools.filter(toolId => {
                const tool = tools.find(t => t.tool_id === toolId);
                return tool?.category !== 'google_drive';
            });
            onToolsChange(nonGoogleDriveTools);
        } catch (error) {
            console.error('Failed to disconnect Google Drive:', error);
            alert('Failed to disconnect Google Drive');
        }
    };

    const toggleTool = (toolId) => {
        const newSelected = selectedTools.includes(toolId)
            ? selectedTools.filter(id => id !== toolId)
            : [...selectedTools, toolId];
        onToolsChange(newSelected);
    };

    const toggleAllTools = () => {
        if (selectedTools.length === tools.length) {
            onToolsChange([]);
        } else {
            onToolsChange(tools.map(t => t.tool_id));
        }
    };

    const groupedTools = tools.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {});

    return (
        <div className="h-full flex flex-col">
            <div className="space-y-6">

                {/* Section 1: MCP Servers */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest pl-1">MCP Servers</h3>
                    {mcpServers.length === 0 ? (
                        <div className="text-sm text-slate-400 italic bg-white/5 p-3 rounded-xl border border-white/10">
                            No MCP servers configured. Add servers URL via the MCP Servers page.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {mcpServers.map((server) => {
                                const isActive = selectedMcpServers.some(s => s.id === server.id);
                                return (
                                    <label
                                        key={server.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isActive
                                            ? 'bg-primary-500/20 border-primary-500/50 shadow-lg shadow-primary/10'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={() => onToggleMcpServer(server)}
                                            className="mt-1 h-4 w-4 text-primary bg-black/20 border-white/20 rounded focus:ring-primary focus:ring-offset-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate shadow-sm">
                                                {server.name}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate font-mono" title={server.url}>
                                                {server.url}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <span className="flex h-2 w-2 relative mt-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-glow-sm"></span>
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Section 2: Native Tools */}
                <div>
                    <div className="flex items-center justify-between mb-3 pl-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Native Tools</h3>
                        <button
                            onClick={toggleAllTools}
                            className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            {selectedTools.length === tools.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-4 text-center text-slate-400 animate-pulse">Loading tools...</div>
                    ) : tools.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">No tools available</div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedTools).map(([category, categoryTools]) => (
                                <div key={category} className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                                        <div className="text-xs font-bold text-slate-300 uppercase">
                                            {category.replace('_', ' ')}
                                        </div>
                                        {category === 'google_drive' && (
                                            <button
                                                onClick={googleDriveAuth ? handleDisconnectGoogleDrive : handleConnectGoogleDrive}
                                                className={`text-xs px-2 py-0.5 rounded-lg font-medium transition-all ${googleDriveAuth
                                                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                                                    }`}
                                            >
                                                {googleDriveAuth ? 'Disconnect' : 'Connect'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {categoryTools.map(tool => {
                                            const isGoogleDrive = tool.category === 'google_drive';
                                            const isDisabled = isGoogleDrive && !googleDriveAuth;

                                            return (
                                                <label
                                                    key={tool.tool_id}
                                                    className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${isDisabled
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : 'hover:bg-white/5 cursor-pointer'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTools.includes(tool.tool_id)}
                                                        onChange={() => toggleTool(tool.tool_id)}
                                                        disabled={isDisabled}
                                                        className="mt-0.5 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-slate-200 leading-tight">{tool.name}</div>
                                                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{tool.description}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
