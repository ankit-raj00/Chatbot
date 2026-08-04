import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chat';
import { mcpServerService } from '../../services/mcpServer';
import { ragService } from '../../services/rag'; // Import RAG Service

import { RightPanel } from './RightPanel';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';
import { SettingsPanel } from '../settings/SettingsPanel';
import { ContextFileSelector } from './ContextFileSelector';
import { DocumentUploadModal } from './DocumentUploadModal';

export const ChatPage = () => {
    const { conversations, currentConversation, setCurrentConversation, messages, setMessages, clearMessages, selectedMcpServers, toggleMcpServer, selectedModel, setSelectedModel, selectedTools, setSelectedTools, deleteConversation } = useChat();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [mcpServers, setMcpServers] = useState([]);
    const abortControllerRef = useRef(null);

    // Cancel an in-progress generation. Two independent things happen: abort
    // this tab's own fetch (instant local UI feedback — stops rendering
    // incoming events right away) AND tell the backend to actually cancel
    // the turn (chatService.stopGeneration) — necessary now that generation
    // runs as a detached background task (see turn_manager on the backend)
    // rather than being tied to this fetch; aborting the fetch alone no
    // longer stops the agent, it just stops THIS tab from watching it.
    // useCallback: passed as a prop to MessageInput — without a stable
    // identity it'd force MessageInput to re-render on every ChatPage render
    // (including every streamed token), same issue as onOpenArtifact below.
    const handleStopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (currentConversation?.id) {
            chatService.stopGeneration(currentConversation.id).catch((err) => {
                console.error('Failed to stop generation server-side:', err);
            });
        }
    }, [currentConversation]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);



    // RAG State
    const [isRagEnabled, setIsRagEnabled] = useState(false);
    const [contextFiles, setContextFiles] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Right Panel State
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState(null); // { type, title, data }

    const [fileListVersion, setFileListVersion] = useState(0); // For refreshing the list

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

        // The persisted history above never includes an in-progress turn
        // (it's only saved once the turn finishes) — so a reload landing on
        // a conversation whose generation is still running shows nothing
        // for it unless we explicitly check and reattach.
        try {
            const active = await chatService.checkActiveTurn(id);
            if (active) {
                await resumeGeneration(id);
            }
        } catch (error) {
            console.error('Failed to check/resume active turn:', error);
        }
    };

    // Reattaches to a turn that's already running (see loadMessages above).
    // Mirrors handleSendMessage's streaming plumbing but doesn't send
    // anything new — it just appends a fresh "live" assistant message and
    // feeds it from wherever the backend's turn_manager currently is,
    // replaying everything already generated before continuing live.
    const resumeGeneration = async (id) => {
        setMessages((prev) => [...prev, {
            role: 'assistant',
            content: '',
            timeline: [],
            timestamp: new Date().toISOString(),
            streaming: true,
        }]);
        setLoading(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            await chatService.resumeStream(id, (event) => handleStreamEvent(event), controller.signal);
            setMessages((prev) => {
                const updated = [...prev];
                delete updated[updated.length - 1].streaming;
                return updated;
            });
        } catch (error) {
            const stopped = error?.name === 'AbortError';
            // Narrow race: the turn finished between checkActiveTurn and this
            // call landing — nothing to resume, but the real completed
            // message is already persisted. Drop the empty placeholder and
            // just re-fetch history instead of showing a scary error for
            // something that actually succeeded.
            if (error?.message === 'No active generation to resume.') {
                setMessages((prev) => prev.slice(0, -1));
                await loadMessages(id);
                return;
            }
            if (!stopped) console.error('Failed to resume generation:', error);
            setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === 'assistant') {
                    if (stopped) {
                        lastMsg.stopped = true;
                    } else {
                        lastMsg.content = lastMsg.content || 'Sorry, I encountered an error. Please try again.';
                        lastMsg.error = true;
                    }
                    delete lastMsg.streaming;
                }
                return updated;
            });
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
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

    const handleSelectConversation = useCallback((conversation) => {
        navigate(`/chat/${conversation.id}`);
    }, [navigate]);

    const handleNewConversation = useCallback(() => {
        navigate('/chat');
    }, [navigate]);

    // Appends to a chronologically-ordered timeline (narration text interleaved
    // with tool calls/skills/artifacts in the order they actually happened) —
    // mirrors services/chat_service.py's server-side timeline builder exactly,
    // so the live view and a reloaded conversation render identically.
    // useCallback: pure function of its arguments, stable identity so
    // handleStreamEvent (which closes over it) can also stay stable.
    const appendTimelineEvent = useCallback((timeline, event) => {
        const tl = [...timeline];
        if (event.type === 'text') {
            const last = tl[tl.length - 1];
            if (last && last.type === 'text') {
                tl[tl.length - 1] = { ...last, content: last.content + event.content };
            } else {
                tl.push({ type: 'text', content: event.content });
            }
        } else if (event.type === 'tool_call') {
            tl.push({ type: 'tool', ...event.data, status: 'running' });
        } else if (event.type === 'tool_output') {
            for (let i = tl.length - 1; i >= 0; i--) {
                if (tl[i].type === 'tool' && tl[i].name === event.data.name && tl[i].status === 'running') {
                    tl[i] = { ...tl[i], ...event.data, status: 'completed' };
                    break;
                }
            }
        } else if (event.type === 'skill_used') {
            tl.push({ type: 'skill', ...event.data });
        } else if (event.type === 'artifact_created') {
            tl.push({ type: 'artifact', ...event.data });
        } else if (event.type === 'files_created') {
            tl.push({ type: 'files_created', files: event.data });
        } else if (event.type === 'exec_output') {
            for (let i = tl.length - 1; i >= 0; i--) {
                if (tl[i].type === 'tool' && tl[i].status === 'running' && tl[i].name === event.data.tool) {
                    tl[i] = { ...tl[i], exec_output: [...(tl[i].exec_output || []), event.data] };
                    break;
                }
            }
        }
        return tl;
    }, []);

    const handleStreamEvent = useCallback((event) => {
        // NOTE: deliberately NOT wrapped in flushSync. This used to force a
        // synchronous, unbatched, full-tree re-render on EVERY single event —
        // fine for occasional text chunks, but exec_output (run_python/
        // run_shell streaming stdout) can fire hundreds or thousands of times
        // in a fast burst (e.g. a script iterating many files). flushSync'ing
        // every one of those hammered the main thread with back-to-back
        // blocking renders and froze the whole tab, not just this panel's
        // scrolling (confirmed live). Plain setState lets React 18's
        // automatic batching coalesce a rapid burst into far fewer renders,
        // which is what we actually want here — still feels live, just
        // doesn't block the browser.
        //
        // 'stopped' is handled separately from the timeline reducer below —
        // it's a terminal marker (server-side cancellation, via the Stop
        // button or a stop issued from another tab), not a piece of
        // rendered content, so it just flags the message and clears
        // `streaming` instead of going through appendTimelineEvent.
        if (event.type === 'stopped') {
            setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                const lastMsg = { ...updated[lastIndex] };
                if (lastMsg.role === 'assistant') {
                    lastMsg.stopped = true;
                    delete lastMsg.streaming;
                    updated[lastIndex] = lastMsg;
                }
                return updated;
            });
            return;
        }

        setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            const lastMsg = { ...updated[lastIndex] };
            if (lastMsg.role === 'assistant') {
                lastMsg.timeline = appendTimelineEvent(lastMsg.timeline || [], event);

                // Keep the legacy grouped fields in sync too — some other
                // code (e.g. RightPanel openers) still reads message.content
                // directly for things like copy-to-clipboard of the final text.
                if (event.type === 'text') {
                    lastMsg.content += event.content;
                } else if (event.type === 'files_created') {
                    lastMsg.files_created = [...(lastMsg.files_created || []), ...event.data];
                }

                updated[lastIndex] = lastMsg;
            }
            return updated;
        });
    }, [appendTimelineEvent, setMessages]);

    // useCallback: passed to MessageInput/ChatWindow — its dependency list
    // deliberately excludes `messages`, so this identity stays stable across
    // an entire streaming burst (every token would otherwise force
    // MessageInput and every memoized Message to re-render, defeating
    // React.memo on both).
    const handleSendMessage = useCallback(async (message) => {
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            hasImages: uploadedImages.length > 0,
            attachments: uploadedImages.map(img => ({
                original_name: img.name || img.file?.name,
                mime_type: img.file?.type,
                sandbox_path: `uploads/${img.name || img.file?.name}`
            }))
        };
        setMessages((prev) => [...prev, userMessage]);

        const assistantMessage = {
            role: 'assistant',
            content: '',
            timeline: [],
            timestamp: new Date().toISOString(),
            streaming: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(true);
        const mcpServerIds = selectedMcpServers.map(s => s.id);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            // Auto-enable RAG tools if Toggle is ON
            let activeTools = [...selectedTools];
            if (isRagEnabled) {
                if (!activeTools.includes('search_knowledge_base')) activeTools.push('search_knowledge_base');
                if (!activeTools.includes('read_document_page')) activeTools.push('read_document_page');
            }

            let response;
            const currentImages = [...uploadedImages];
            setUploadedImages([]); // Clear preview immediately

            if (currentImages.length > 0) {
                response = await chatService.sendMessageStreamMultimodal(
                    message,
                    currentConversation?.id,
                    mcpServerIds,
                    selectedModel,
                    currentImages,
                    activeTools,
                    contextFiles, // Pass selected files
                    (event) => handleStreamEvent(event),
                    controller.signal
                );
            } else {
                response = await chatService.sendMessageStream(
                    message,
                    currentConversation?.id,
                    mcpServerIds,
                    selectedModel,
                    activeTools,
                    contextFiles, // Pass selected files
                    (event) => handleStreamEvent(event),
                    controller.signal
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
        } catch (error) {
            const stopped = error?.name === 'AbortError';
            if (!stopped) console.error('Failed to send message:', error);
            setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === 'assistant') {
                    if (stopped) {
                        // Clean user-initiated stop — keep whatever streamed so far,
                        // just mark it as stopped rather than showing an error.
                        lastMsg.stopped = true;
                    } else {
                        lastMsg.content = lastMsg.content || 'Sorry, I encountered an error. Please try again.';
                        lastMsg.error = true;
                    }
                    delete lastMsg.streaming;
                }
                return updated;
            });
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [uploadedImages, selectedMcpServers, selectedTools, isRagEnabled, currentConversation,
        contextFiles, selectedModel, navigate, handleStreamEvent, setMessages]);

    const handleUploadComplete = useCallback((result) => {
        console.log("File indexed:", result);
        setFileListVersion(prev => prev + 1); // Refresh user's file list
    }, []);

    // useCallback: passed to ChatWindow -> every Message — this was the
    // actual bug that silently defeated Message.jsx's React.memo. A new
    // inline function here every render meant every Message's shallow prop
    // comparison always saw "onOpenArtifact changed", so the WHOLE message
    // list still re-rendered on every streamed token even after memoizing
    // Message itself.
    const handleOpenArtifact = useCallback((content) => {
        setRightPanelContent(content);
        setIsRightPanelOpen(true);
    }, []);

    // useCallback: all three are passed into the memoized MessageInput, which
    // now owns the inline model/tools/RAG controls. Inline arrows here would
    // re-render the composer on every streamed token, exactly the bug the
    // memo wrapping exists to prevent.
    const handleToggleRag = useCallback(() => setIsRagEnabled(prev => !prev), []);
    const handleOpenKnowledgeUpload = useCallback(() => setIsUploadModalOpen(true), []);
    const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);

    const conversationTitle = currentConversation?.title || 'New chat';

    return (
        <div className="h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* ───────── Sidebar ───────── */}
            <div
                className={`${isSidebarOpen ? 'w-[268px]' : 'w-0'} flex-shrink-0 transition-all duration-200 overflow-hidden`}
                style={{ backgroundColor: 'var(--bg-sidebar)' }}
            >
                <div className="w-[268px] h-full flex flex-col border-r" style={{ borderColor: 'var(--border-color)' }}>

                    {/* Brand + rail actions */}
                    <div className="px-3 pt-3.5 pb-2">
                        <div className="flex items-center justify-between px-1 pb-3.5">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-6 h-6 rounded-[7px] grid place-items-center flex-none"
                                    style={{
                                        background: 'linear-gradient(145deg, var(--accent), var(--violet))',
                                        color: 'var(--accent-ink)'
                                    }}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M4 17l6-6-6-6M12 19h8" />
                                    </svg>
                                </div>
                                <span className="text-[14.5px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
                                    AgentX
                                </span>
                            </div>

                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={() => navigate('/rag-test')}
                                    className="w-7 h-7 rounded-lg grid place-items-center transition-colors hover:bg-[var(--hover-bg)]"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Test retrieval"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M9 3h6M10 3v6.5L5.5 18a2 2 0 001.7 3h9.6a2 2 0 001.7-3L14 9.5V3M7.5 15h9" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="w-7 h-7 rounded-lg grid place-items-center transition-colors hover:bg-[var(--hover-bg)]"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Collapse sidebar"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="16" rx="2.5" />
                                        <path d="M9.5 4v16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleNewConversation}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] border text-[13.5px] font-medium transition-all duration-150 hover:-translate-y-px"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)',
                                boxShadow: 'var(--shadow-1)'
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" viewBox="0 0 24 24">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            New chat
                        </button>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto px-3 min-h-0">
                        <ConversationSidebar
                            conversations={conversations}
                            currentConversationId={currentConversation?.id}
                            onSelectConversation={handleSelectConversation}
                            onDeleteConversation={deleteConversation}
                        />
                    </div>

                    {/* Knowledge base */}
                    <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div
                            className="rounded-[12px] border px-3 py-2.5"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--border-color)',
                                boxShadow: 'var(--shadow-1)'
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 flex-none" style={{ color: isRagEnabled ? 'var(--accent)' : 'var(--text-tertiary)' }}
                                    fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M4 5.5A2.5 2.5 0 016.5 3H19v18H6.5A2.5 2.5 0 014 18.5zM8 3v18" />
                                </svg>
                                <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Knowledge base
                                </span>
                                <button
                                    onClick={handleOpenKnowledgeUpload}
                                    className="ml-auto w-6 h-6 rounded-md grid place-items-center transition-colors hover:bg-[var(--hover-bg)]"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Upload a document"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M12 20V8m0 0l-4 4m4-4l4 4M4 5h16" />
                                    </svg>
                                </button>
                            </div>

                            {isRagEnabled ? (
                                <div className="mt-1.5 -mx-1">
                                    <ContextFileSelector
                                        key={fileListVersion} // forces re-mount to fetch latest files when bumped
                                        onSelectionChange={setContextFiles}
                                    />
                                </div>
                            ) : (
                                <p className="mt-1.5 text-[11px] leading-snug" style={{ color: 'var(--text-tertiary)' }}>
                                    Turn on <span style={{ color: 'var(--text-secondary)' }}>Agentic RAG</span> in the composer to pick context files.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────── Main ───────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header
                    className="h-[53px] flex-none flex items-center gap-3 px-4 border-b relative z-20"
                    style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--glass)',
                        backdropFilter: 'blur(14px) saturate(140%)'
                    }}
                >
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-8 h-8 rounded-lg grid place-items-center transition-colors hover:bg-[var(--hover-bg)]"
                            style={{ color: 'var(--text-secondary)' }}
                            title="Open sidebar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="16" rx="2.5" />
                                <path d="M9.5 4v16" />
                            </svg>
                        </button>
                    )}

                    <span className="text-[13.5px] font-medium tracking-[-0.015em] truncate min-w-0" style={{ color: 'var(--text-primary)' }}>
                        {conversationTitle}
                    </span>

                    <span
                        className="hidden sm:flex items-center gap-1.5 text-[11.5px] rounded-full border px-2.5 py-[3px] flex-none"
                        style={{
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' }}
                        />
                        Sandbox ready
                    </span>

                    <div className="flex-1" />

                    <button
                        onClick={toggleTheme}
                        className="w-8 h-8 rounded-lg grid place-items-center transition-colors hover:bg-[var(--hover-bg)]"
                        style={{ color: 'var(--text-secondary)' }}
                        title={isDark ? 'Light mode' : 'Dark mode'}
                    >
                        {isDark ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={handleOpenSettings}
                        className="w-8 h-8 rounded-lg grid place-items-center transition-colors hover:bg-[var(--hover-bg)]"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Settings"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 008 19.4a1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H2a2 2 0 110-4h.1A1.6 1.6 0 003.6 8a1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H8a1.6 1.6 0 001-1.5V2a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V8a1.6 1.6 0 001.5 1H22a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
                        </svg>
                    </button>

                    <div className="w-px h-5 mx-0.5" style={{ backgroundColor: 'var(--border-color)' }} />

                    {/* Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] font-semibold transition-transform active:scale-95"
                            style={{
                                background: 'linear-gradient(150deg, #7c6cf0, #4f46e5)',
                                color: 'white'
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </button>

                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <div
                                    className="ax-pop absolute right-0 top-full mt-2 w-60 z-50 p-1.5"
                                >
                                    <div className="px-2.5 py-2 mb-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-[11.5px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                                            {user?.email || ''}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate('/profile');
                                        }}
                                        className="ax-pop-item text-[13px]"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        View profile
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await logout();
                                            navigate('/login');
                                        }}
                                        className="ax-pop-item text-[13px]"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <ChatWindow
                        messages={messages}
                        loading={loading}
                        onOpenArtifact={handleOpenArtifact}
                    />

                    <div className="flex-none px-4 pb-4 pt-1">
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            disabled={loading}
                            isGenerating={loading}
                            onStop={handleStopGeneration}
                            uploadedImages={uploadedImages}
                            onImagesChange={setUploadedImages}
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                            mcpServers={mcpServers}
                            selectedMcpServers={selectedMcpServers}
                            onToggleMcpServer={toggleMcpServer}
                            selectedTools={selectedTools}
                            onToolsChange={setSelectedTools}
                            isRagEnabled={isRagEnabled}
                            onToggleRag={handleToggleRag}
                            contextFileCount={contextFiles.length}
                            onOpenKnowledgeUpload={handleOpenKnowledgeUpload}
                            onOpenSettings={handleOpenSettings}
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            {isRightPanelOpen && (
                <RightPanel
                    content={rightPanelContent}
                    onClose={() => setIsRightPanelOpen(false)}
                />
            )}

            {/* Settings Panel (Slidable) — kept as the deep-settings escape hatch;
                the per-turn controls (model, tools, MCP, RAG) now live inline in
                the composer. */}
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

            {/* Document Upload Modal */}
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadComplete={() => {
                    setFileListVersion(v => v + 1);
                    if (!isRagEnabled) setIsRagEnabled(true);
                }}
            />
        </div>
    );
};
