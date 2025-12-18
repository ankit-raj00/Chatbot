import { useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { chatService } from '../../services/chat';
import { ConversationItem } from './ConversationItem';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const ConversationSidebar = ({ onSelectConversation, onNewConversation }) => {
    const { conversations, setConversations, currentConversation, setCurrentConversation } = useChat();

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            // Map _id to id for frontend compatibility
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
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <button onClick={onNewConversation} className="btn-primary w-full">
                    + New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversations.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No conversations yet</p>
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
