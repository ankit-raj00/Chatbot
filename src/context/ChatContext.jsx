import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const ChatContext = createContext(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);

    // Initialize from localStorage
    const [selectedMcpServers, setSelectedMcpServers] = useState(() => {
        try {
            const saved = localStorage.getItem('selectedMcpServers_v2');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse selectedMcpServers_v2 from localStorage', e);
            return [];
        }
    });

    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

    // Persist to localStorage whenever selection changes
    useEffect(() => {
        localStorage.setItem('selectedMcpServers_v2', JSON.stringify(selectedMcpServers));
    }, [selectedMcpServers]);

    // NOTE: Pre-connect removed - we now use native tools instead of built-in MCP servers
    // External MCP servers (if any) will connect on-demand when used in chat


    const addMessage = (message) => {
        setMessages((prev) => [...prev, message]);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    const toggleMcpServer = async (server) => {
        if (!server) {
            setSelectedMcpServers([]);
            return;
        }

        setSelectedMcpServers((prev) => {
            const exists = prev.find(s => s.id === server.id);
            if (exists) {
                // Remove server - call disconnect endpoint
                fetch(`${API_BASE_URL}/mcp/disconnect`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        mcp_server_url: server.url
                    })
                }).catch(err => console.error('Failed to disconnect MCP server:', err));

                return prev.filter(s => s.id !== server.id);
            } else {
                // Add server - call pre-connect endpoint to establish connection immediately
                fetch(`${API_BASE_URL}/mcp/pre-connect`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        mcp_server_url: server.url
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            console.log(`✅ Pre-connected to ${server.name}: ${data.resources_count} resources cached`);
                        } else {
                            console.error(`❌ Failed to pre-connect to ${server.name}`);
                        }
                    })
                    .catch(err => console.error('Failed to pre-connect MCP server:', err));

                return [...prev, server];
            }
        });
    };

    const value = {
        currentConversation,
        setCurrentConversation,
        messages,
        setMessages,
        addMessage,
        clearMessages,
        conversations,
        setConversations,
        selectedMcpServers,
        toggleMcpServer,
        selectedModel,
        setSelectedModel,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
