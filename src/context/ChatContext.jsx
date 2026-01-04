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

    // Initialize selectedTools from localStorage (filter out old/invalid entries)
    const [selectedTools, setSelectedTools] = useState(() => {
        try {
            const saved = localStorage.getItem('selectedTools');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Filter out:
                // 1. Old mcp: prefixed entries
                // 2. Old Title Case entries (keep only snake_case)
                // Valid tool_ids are snake_case like: roll_dice, get_weather
                return parsed.filter(t =>
                    !t.startsWith('mcp:') &&
                    !t.includes(' ') && // Title Case has spaces
                    t === t.toLowerCase() // Must be lowercase
                );
            }
            return [];
        } catch (e) {
            console.error('Failed to parse selectedTools from localStorage', e);
            return [];
        }
    });

    // Initialize selectedModel from localStorage
    const [selectedModel, setSelectedModel] = useState(() => {
        return localStorage.getItem('selectedModel') || 'gemini-2.5-flash';
    });

    // Persist to localStorage whenever selection changes
    useEffect(() => {
        localStorage.setItem('selectedMcpServers_v2', JSON.stringify(selectedMcpServers));
    }, [selectedMcpServers]);

    useEffect(() => {
        localStorage.setItem('selectedTools', JSON.stringify(selectedTools));
    }, [selectedTools]);

    useEffect(() => {
        localStorage.setItem('selectedModel', selectedModel);
    }, [selectedModel]);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/conversations`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                // Transform _id to id for frontend compatibility
                const transformed = data.map(conv => ({
                    ...conv,
                    id: conv._id || conv.id
                }));
                setConversations(transformed);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };


    const addMessage = (message) => {
        setMessages((prev) => [...prev, message]);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    const deleteConversation = async (conversationId) => {
        console.log('Deleting conversation:', conversationId);
        try {
            const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            console.log('Delete response status:', response.status);
            if (response.ok) {
                // Remove from local state
                setConversations(prev => prev.filter(c => c.id !== conversationId));
                // Clear current if deleted
                if (currentConversation?.id === conversationId) {
                    setCurrentConversation(null);
                    setMessages([]);
                }
                console.log('Conversation deleted successfully');
            } else {
                const errorData = await response.text();
                console.error('Delete failed:', response.status, errorData);
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    const toggleMcpServer = (server) => {
        if (!server) {
            setSelectedMcpServers([]);
            return;
        }

        setSelectedMcpServers((prev) => {
            const exists = prev.find(s => s.id === server.id);
            if (exists) {
                // Remove server from selection
                return prev.filter(s => s.id !== server.id);
            } else {
                // Add server to selection
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
        deleteConversation,
        selectedMcpServers,
        toggleMcpServer,
        selectedModel,
        setSelectedModel,
        selectedTools,
        setSelectedTools,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
