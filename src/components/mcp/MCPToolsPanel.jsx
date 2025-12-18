import { useState, useEffect } from 'react';
import { mcpService } from '../../services/mcp';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const MCPToolsPanel = () => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await mcpService.connectAndListTools();
            setTools(data.tools || []);
        } catch (error) {
            console.error('Failed to load MCP tools:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
            <div className="h-full flex flex-col">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">MCP Tools</h3>
                            <button
                                onClick={loadTools}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                disabled={loading}
                            >
                                <svg className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        {loading ? (
                            <LoadingSpinner />
                        ) : tools.length === 0 ? (
                            <p className="text-sm text-gray-500">No tools available</p>
                        ) : (
                            <div className="space-y-2">
                                {tools.map((tool, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-900">{tool.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
