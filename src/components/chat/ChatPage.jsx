import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useChat } from '../../context/ChatContext';
import { chatService } from '../../services/chat';
import { mcpServerService } from '../../services/mcpServer';
import { Navbar } from '../shared/Navbar';
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
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const { conversationId } = useParams();
    const navigate = useNavigate();

    // Sync URL with state
    useEffect(() => {
        if (conversationId) {
            if (currentConversation?.id !== conversationId) {
                // If we have the conversation in the list (loaded by sidebar), use it to get title etc.
                // Otherwise just use ID.
                const existing = conversations?.find(c => c.id === conversationId);
                const conv = existing || { id: conversationId };

                setCurrentConversation(conv);
                loadMessages(conversationId);
            }
        } else {
            // New chat route
            if (currentConversation) {
                // Reset state for new chat
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
        // Add user message immediately
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            hasImages: uploadedImages.length > 0,
        };
        setMessages((prev) => [...prev, userMessage]);

        // Add empty assistant message for streaming
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

            console.log('Sending message:', message);
            console.log('Uploaded images:', uploadedImages);
            console.log('Selected model:', selectedModel);

            // Use multimodal endpoint if images are present
            if (uploadedImages.length > 0) {
                console.log('Using multimodal endpoint');
                const mcpServerUrls = selectedMcpServers.map(s => s.url);
                response = await chatService.sendMessageStreamMultimodal(
                    message,
                    currentConversation?.id,
                    mcpServerUrls,
                    selectedModel,
                    uploadedImages,
                    selectedTools,
                    (event) => {
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
                                        toolSteps.push({
                                            ...event.data,
                                            status: 'running'
                                        });
                                        lastMsg.toolSteps = toolSteps;
                                    } else if (event.type === 'tool_output') {
                                        const toolSteps = [...(lastMsg.toolSteps || [])];
                                        // Match by Name and Running status
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
                    }
                );
            } else {
                console.log('Using standard endpoint');
                const mcpServerUrls = selectedMcpServers.map(s => s.url);
                response = await chatService.sendMessageStream(
                    message,
                    currentConversation?.id,
                    mcpServerUrls,
                    selectedModel,
                    selectedTools,
                    (event) => {
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
                                        toolSteps.push({
                                            ...event.data,
                                            status: 'running'
                                        });
                                        lastMsg.toolSteps = toolSteps;
                                    } else if (event.type === 'tool_output') {
                                        const toolSteps = [...(lastMsg.toolSteps || [])];
                                        // Match by Name and Running status
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
                    }
                );
            }

            // Update conversation if it's new
            if (!currentConversation && response.conversation_id) {
                // Navigate to the new conversation URL - this will trigger the effect to set currentConversation
                navigate(`/chat/${response.conversation_id}`, { replace: true });
            }

            // Mark streaming as complete
            setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === 'assistant') {
                    delete lastMsg.streaming;
                }
                return updated;
            });

            // Clear uploaded images after sending
            setUploadedImages([]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Replace streaming message with error
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

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar Toggle Button (Visible when closed) */}
                {!isLeftSidebarOpen && (
                    <button
                        onClick={() => setIsLeftSidebarOpen(true)}
                        className="absolute left-2 top-2 z-20 p-2 bg-white rounded-md shadow-md hover:bg-gray-50 text-gray-500 border border-gray-200"
                        title="Open Sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Left Sidebar */}
                <div
                    className={`${isLeftSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden relative`}
                >
                    {isLeftSidebarOpen && (
                        <>
                            {/* Close Button */}
                            <button
                                onClick={() => setIsLeftSidebarOpen(false)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 z-10"
                                title="Close Sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex-1 overflow-y-auto pt-8">
                                <ConversationSidebar
                                    onSelectConversation={handleSelectConversation}
                                    onNewConversation={handleNewConversation}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-gray-50 relative">
                    <ChatWindow messages={messages} loading={loading} />
                    <MessageInput
                        onSend={handleSendMessage}
                        disabled={loading}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        images={uploadedImages}
                        onImagesChange={setUploadedImages}
                    />
                </div>

                {/* Right Sidebar Toggle Button (Visible when closed) */}
                {!isRightSidebarOpen && (
                    <button
                        onClick={() => setIsRightSidebarOpen(true)}
                        className="absolute right-2 top-2 z-20 p-2 bg-white rounded-md shadow-md hover:bg-gray-50 text-gray-500 border border-gray-200"
                        title="Open Tools"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Right Sidebar: Tools & MCP */}
                <div
                    className={`${isRightSidebarOpen ? 'w-80' : 'w-0'} bg-white border-l border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden relative`}
                >
                    {isRightSidebarOpen && (
                        <>
                            {/* Close Button */}
                            <button
                                onClick={() => setIsRightSidebarOpen(false)}
                                className="absolute top-2 left-2 p-1 text-gray-400 hover:text-gray-600 z-10"
                                title="Close Tools"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                            <div className="flex-1 overflow-y-auto mt-6">
                                <ToolsSidebar
                                    mcpServers={mcpServers}
                                    selectedMcpServers={selectedMcpServers}
                                    onToggleMcpServer={toggleMcpServer}
                                    selectedTools={selectedTools}
                                    onToolsChange={setSelectedTools}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
