
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useChat } from '../../context/ChatContext';
import { chatService } from '../../services/chat';
import { mcpServerService } from '../../services/mcpServer';

import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';
import { ToolsSidebar } from './ToolsSidebar';


export const ChatPage = () => {
    const { conversations, currentConversation, setCurrentConversation, messages, setMessages, clearMessages, selectedMcpServers, toggleMcpServer, selectedModel, setSelectedModel } = useChat();
    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [mcpServers, setMcpServers] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);

    // Sidebar states
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    // Mobile specific states
    const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false);
    const [isMobileRightOpen, setIsMobileRightOpen] = useState(false);

    const { conversationId } = useParams();
    const navigate = useNavigate();

    // Auto-close mobile sidebars on route change
    useEffect(() => {
        setIsMobileLeftOpen(false);
        setIsMobileRightOpen(false);
    }, [conversationId]);

    // Sync URL with state
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
        setIsMobileLeftOpen(false);
    };

    const handleNewConversation = () => {
        navigate('/chat');
        setIsMobileLeftOpen(false);
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
        <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)] flex gap-4 md:gap-6 relative">

            {/* Mobile Sidebar Overlays */}
            {(isMobileLeftOpen || isMobileRightOpen) && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => {
                        setIsMobileLeftOpen(false);
                        setIsMobileRightOpen(false);
                    }}
                />
            )}

            {/* Left Sidebar (Conversations) */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
                    md:relative md:transform-none md:inset-auto md:z-0
                    ${isMobileLeftOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isLeftSidebarOpen ? 'md:w-80' : 'md:w-0'}
                    flex-shrink-0
                `}
            >
                <div className="h-full glass-panel md:rounded-2xl flex flex-col border-r border-white/10 md:border-none">
                    <ConversationSidebar
                        conversations={conversations}
                        currentConversationId={currentConversation?.id}
                        onSelectConversation={handleSelectConversation}
                        onNewConversation={handleNewConversation}
                    />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 min-w-0 flex flex-col glass-card h-full relative overflow-hidden p-0 rounded-2xl border-white/10">

                {/* Mobile Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/5 md:hidden bg-white/5 backdrop-blur-md">
                    <button
                        onClick={() => setIsMobileLeftOpen(true)}
                        className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-bold text-white">AgentX</span>
                    <button
                        onClick={() => setIsMobileRightOpen(true)}
                        className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <ChatWindow
                        messages={messages}
                        loading={loading}
                    />
                </div>

                <div className="shrink-0 p-4 bg-black/20 border-t border-white/5 backdrop-blur-md z-10 transition-all duration-300">
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

            {/* Desktop Right Toggle */}
            <div className="hidden md:block absolute right-6 top-6 z-20">
                {!isRightSidebarOpen && (
                    <button
                        onClick={() => setIsRightSidebarOpen(true)}
                        className="p-2 glass-panel hover:bg-white/10 text-slate-300 transition-colors rounded-lg"
                        title="Open Tools"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Right Sidebar: Tools */}
            <div
                className={`
                    fixed inset-y-0 right-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
                    md:relative md:transform-none md:inset-auto md:z-0
                    ${isMobileRightOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                    ${isRightSidebarOpen ? 'md:w-80' : 'md:w-0'}
                    flex-shrink-0
                `}
            >
                <div className="h-full glass-panel md:rounded-2xl overflow-hidden flex flex-col border-l border-white/10 md:border-none md:ml-0 bg-[#0a0a0b] md:bg-transparent">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-semibold text-white">Tool Settings</h3>
                        <button
                            onClick={() => {
                                setIsRightSidebarOpen(false);
                                setIsMobileRightOpen(false);
                            }}
                            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <ToolsSidebar
                            mcpServers={mcpServers}
                            selectedMcpServers={selectedMcpServers}
                            onToggleMcpServer={toggleMcpServer}
                            selectedTools={selectedTools}
                            onToolsChange={setSelectedTools}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
