import { useState, useEffect } from 'react';
import { mcpServerService } from '../../services/mcpServer';

export const ToolsSidebar = ({
    mcpServers,
    selectedMcpServers,
    onToggleMcpServer,
    selectedTools,
    onToolsChange
}) => {
    const [mcpTools, setMcpTools] = useState({});
    const [nativeTools, setNativeTools] = useState([]);

    useEffect(() => {
        loadNativeTools();
    }, []);

    // Load tools for selected MCP servers
    useEffect(() => {
        selectedMcpServers.forEach(server => {
            if (!mcpTools[server.id]) {
                loadMcpToolsForServer(server);
            }
        });
    }, [selectedMcpServers]);

    const loadNativeTools = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/tools`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setNativeTools(data.tools || data || []);
            }
        } catch (error) {
            console.error('Failed to load native tools:', error);
        }
    };

    const loadMcpToolsForServer = async (server) => {
        setMcpTools(prev => ({
            ...prev,
            [server.id]: { tools: [], loading: true, name: server.name }
        }));

        try {
            const result = await mcpServerService.testConnection(server.id);
            setMcpTools(prev => ({
                ...prev,
                [server.id]: {
                    tools: result.tools || [],
                    loading: false,
                    name: server.name,
                    status: result.status
                }
            }));
        } catch (error) {
            console.error(`Failed to load tools from ${server.name}:`, error);
            setMcpTools(prev => ({
                ...prev,
                [server.id]: { tools: [], loading: false, name: server.name, error: true }
            }));
        }
    };

    const toggleTool = (toolName) => {
        if (selectedTools.includes(toolName)) {
            onToolsChange(selectedTools.filter(t => t !== toolName));
        } else {
            onToolsChange([...selectedTools, toolName]);
        }
    };

    return (
        <div className="space-y-4">
            {/* MCP Servers */}
            {mcpServers.length > 0 && (
                <div>
                    <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        MCP Servers
                    </div>
                    <div className="space-y-2">
                        {mcpServers.map((server) => {
                            const isSelected = selectedMcpServers.some(s => s.id === server.id);
                            const serverTools = mcpTools[server.id];

                            return (
                                <div key={server.id}>
                                    <label
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm"
                                        style={{
                                            backgroundColor: isSelected ? 'var(--hover-bg)' : 'transparent',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleMcpServer(server)}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="truncate flex-1">{server.name}</span>
                                        {isSelected && serverTools?.tools?.length > 0 && (
                                            <span
                                                className="text-xs px-1.5 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: 'var(--accent)',
                                                    color: 'white'
                                                }}
                                            >
                                                {serverTools.tools.length}
                                            </span>
                                        )}
                                    </label>

                                    {/* Show MCP tools as tags (read-only) */}
                                    {isSelected && serverTools && (
                                        <div className="ml-7 mt-1">
                                            {serverTools.loading ? (
                                                <p className="text-xs py-1" style={{ color: 'var(--text-secondary)' }}>
                                                    Loading tools...
                                                </p>
                                            ) : serverTools.error ? (
                                                <p className="text-xs py-1 text-red-500">
                                                    Failed to load tools
                                                </p>
                                            ) : serverTools.tools.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {serverTools.tools.map((tool, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs px-2 py-1 rounded"
                                                            style={{
                                                                backgroundColor: 'var(--input-bg)',
                                                                color: 'var(--text-primary)'
                                                            }}
                                                        >
                                                            {tool.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs py-1" style={{ color: 'var(--text-secondary)' }}>
                                                    No tools available
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Native Tools */}
            {nativeTools.length > 0 && (
                <div>
                    <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Native Tools
                    </div>
                    <div className="space-y-1">
                        {nativeTools.map((tool) => {
                            // Use tool_id for backend compatibility, name for display
                            const toolId = tool.tool_id || tool.name;
                            const displayName = tool.name || tool.tool_id;
                            const isSelected = selectedTools.includes(toolId);
                            return (
                                <label
                                    key={toolId}
                                    className="flex items-start gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm"
                                    style={{
                                        backgroundColor: isSelected ? 'var(--hover-bg)' : 'transparent',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleTool(toolId)}
                                        className="w-4 h-4 rounded mt-0.5"
                                    />
                                    <div className="min-w-0">
                                        <div className="truncate">{displayName}</div>
                                        {tool.description && (
                                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                {tool.description}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {mcpServers.length === 0 && nativeTools.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                    No tools available
                </p>
            )}
        </div>
    );
};
