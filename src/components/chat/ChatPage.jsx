import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chat';
import { mcpServerService } from '../../services/mcpServer';

import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';
import { SettingsPanel } from '../settings/SettingsPanel';

export const ChatPage = () => {
    const { conversations, currentConversation, setCurrentConversation, messages, setMessages, clearMessages, selectedMcpServers, toggleMcpServer, selectedModel, setSelectedModel, selectedTools, setSelectedTools, deleteConversation } = useChat();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [mcpServers, setMcpServers] = useState([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { conversationId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (conversationId) {
            if (currentConversation?.id !== conversationId) {
                const existing = conversations?.find(c => c.id === conversationId);
                const conv = existing || { id: conversationId };
                setCurrentConversation(conv);
                loadMessages(conversationId);
            }
        } else {
            if (currentConversation) {
                setCurrentConversation(null);
                clearMessages();
            }
        }
    }, [conversationId]);

    const loadMessages = async (id) => {
        setLoading(true);
        try {
            const data = await chatService.getMessages(id);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMcpServers();
    }, []);

    const loadMcpServers = async () => {
        try {
            const data = await mcpServerService.getServers();
            const transformedData = data.map(server => ({
                ...server,
                id: server._id
            }));
            setMcpServers(transformedData);
        } catch (error) {
            console.error('Failed to load MCP servers:', error);
        }
    };

    const handleSelectConversation = (conversation) => {
        navigate(`/chat/${conversation.id}`);
    };

    const handleNewConversation = () => {
        navigate('/chat');
    };

    const handleSendMessage = async (message) => {
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            hasImages: uploadedImages.length > 0,
        };
        setMessages((prev) => [...prev, userMessage]);

        const assistantMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            streaming: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(true);

        try {
            let response;
            const mcpServerUrls = selectedMcpServers.map(s => s.url);

            if (uploadedImages.length > 0) {
                response = await chatService.sendMessageStreamMultimodal(
                    message,
                    currentConversation?.id,
                    mcpServerUrls,
                    selectedModel,
                    uploadedImages,
                    selectedTools,
                    (event) => handleStreamEvent(event)
                );
            } else {
                response = await chatService.sendMessageStream(
                    message,
                    currentConversation?.id,
                    mcpServerUrls,
                    selectedModel,
                    selectedTools,
                    (event) => handleStreamEvent(event)
                );
            }

            if (!currentConversation && response.conversation_id) {
                navigate(`/chat/${response.conversation_id}`, { replace: true });
            }

            setMessages((prev) => {
                const updated = [...prev];
                delete updated[updated.length - 1].streaming;
                return updated;
            });

            setUploadedImages([]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === 'assistant') {
                    lastMsg.content = 'Sorry, I encountered an error. Please try again.';
                    delete lastMsg.streaming;
                }
                return updated;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStreamEvent = (event) => {
        flushSync(() => {
            setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                const lastMsg = { ...updated[lastIndex] };
                if (lastMsg.role === 'assistant') {
                    if (event.type === 'text') {
                        lastMsg.content += event.content;
                    } else if (event.type === 'tool_call') {
                        const toolSteps = [...(lastMsg.toolSteps || [])];
                        toolSteps.push({ ...event.data, status: 'running' });
                        lastMsg.toolSteps = toolSteps;
                    } else if (event.type === 'tool_output') {
                        const toolSteps = [...(lastMsg.toolSteps || [])];
                        const targetIdx = toolSteps.findIndex(
                            visit => visit.name === event.data.name && visit.status === 'running'
                        );
                        if (targetIdx !== -1) {
                            toolSteps[targetIdx] = {
                                ...toolSteps[targetIdx],
                                result: event.data.result,
                                status: 'completed'
                            };
                            lastMsg.toolSteps = toolSteps;
                        }
                    }
                    updated[lastIndex] = lastMsg;
                }
                return updated;
            });
        });
    };

    return (
        <div className="h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-200 overflow-hidden`}
                style={{ backgroundColor: 'var(--bg-sidebar)' }}
            >
                <div className="w-64 h-full flex flex-col border-r" style={{ borderColor: 'var(--border-color)' }}>
                    {/* Sidebar Header */}
                    <div className="p-3 flex items-center justify-between">
                        <button
                            onClick={handleNewConversation}
                            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors"
                            style={{
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New chat
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="ml-2 p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto px-2">
                        <ConversationSidebar
                            conversations={conversations}
                            currentConversationId={currentConversation?.id}
                            onSelectConversation={handleSelectConversation}
                            onDeleteConversation={deleteConversation}
                        />
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>AgentX</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            title={isDark ? 'Light mode' : 'Dark mode'}
                        >
                            {isDark ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Settings */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* Profile */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                                style={{
                                    backgroundColor: 'var(--accent)',
                                    color: 'white'
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div
                                        className="absolute right-0 top-full mt-2 w-56 rounded-lg border shadow-lg z-50 py-1"
                                        style={{
                                            backgroundColor: 'var(--bg-primary)',
                                            borderColor: 'var(--border-color)'
                                        }}
                                    >
                                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {user?.name || 'User'}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                {user?.email || ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate('/profile');
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--hover-bg)]"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await logout();
                                                navigate('/login');
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--hover-bg)]"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            Log out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <ChatWindow messages={messages} loading={loading} />

                    <div className="p-4">
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            disabled={loading}
                            uploadedImages={uploadedImages}
                            onImagesChange={setUploadedImages}
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                        />
                    </div>
                </div>
            </div>

            {/* Settings Panel (Slidable) */}
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                mcpServers={mcpServers}
                selectedMcpServers={selectedMcpServers}
                onToggleMcpServer={toggleMcpServer}
                selectedTools={selectedTools}
                onToolsChange={setSelectedTools}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
            />
        </div>
    );
};
