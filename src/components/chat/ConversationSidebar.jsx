
import { useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { chatService } from '../../services/chat';
import { ConversationItem } from './ConversationItem';

export const ConversationSidebar = ({ onSelectConversation, onNewConversation }) => {
    const { conversations, setConversations, currentConversation, setCurrentConversation } = useChat();

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            const transformedData = data.map(conv => ({
                ...conv,
                id: conv._id
            }));
            setConversations(transformedData);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const handleDelete = async (conversationId) => {
        try {
            await chatService.deleteConversation(conversationId);
            setConversations(conversations.filter((c) => c.id !== conversationId));
            if (currentConversation?.id === conversationId) {
                setCurrentConversation(null);
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
                <button
                    onClick={onNewConversation}
                    className="btn-primary w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {conversations.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-500">No conversations yet</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isActive={currentConversation?.id === conv.id}
                            onClick={() => onSelectConversation(conv)}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
