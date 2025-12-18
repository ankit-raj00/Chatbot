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

            // Enable tools by default logic (copied from ToolsSelector)
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

    // Group native tools
    const groupedTools = tools.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {});

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Tool Settings</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Section 1: MCP Servers */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">MCP Servers</h3>
                    {mcpServers.length === 0 ? (
                        <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                            No MCP servers configured. Add servers URL via /mcp-servers page.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {mcpServers.map((server) => {
                                const isActive = selectedMcpServers.some(s => s.id === server.id);
                                return (
                                    <label
                                        key={server.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isActive
                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={() => onToggleMcpServer(server)}
                                            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {server.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate" title={server.url}>
                                                {server.url}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <span className="flex h-2 w-2 relative mt-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
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
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Native Tools</h3>
                        <button
                            onClick={toggleAllTools}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {selectedTools.length === tools.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading tools...</div>
                    ) : tools.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No tools available</div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedTools).map(([category, categoryTools]) => (
                                <div key={category} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                                        <div className="text-xs font-bold text-gray-700 uppercase">
                                            {category.replace('_', ' ')}
                                        </div>
                                        {category === 'google_drive' && (
                                            <button
                                                onClick={googleDriveAuth ? handleDisconnectGoogleDrive : handleConnectGoogleDrive}
                                                className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${googleDriveAuth
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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
                                                    className={`flex items-start gap-2 p-1.5 rounded transition-colors ${isDisabled
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-white cursor-pointer'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTools.includes(tool.tool_id)}
                                                        onChange={() => toggleTool(tool.tool_id)}
                                                        disabled={isDisabled}
                                                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-gray-900 leading-tight">{tool.name}</div>
                                                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{tool.description}</p>
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
