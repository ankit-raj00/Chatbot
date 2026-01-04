export const ConversationSidebar = ({
    conversations,
    currentConversationId,
    onSelectConversation,
    onDeleteConversation
}) => {
    if (!conversations || conversations.length === 0) {
        return (
            <div className="px-3 py-4 text-center">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No conversations yet
                </p>
            </div>
        );
    }

    const handleDelete = (e, conv) => {
        e.stopPropagation();
        e.preventDefault();

        const title = conv.title || 'this conversation';
        if (window.confirm(`Delete "${title}"?`)) {
            console.log('Deleting conversation:', conv.id);
            onDeleteConversation(conv.id);
        }
    };

    return (
        <div className="space-y-1 py-2">
            {conversations.map((conv) => (
                <div
                    key={conv.id}
                    className={`group flex items-center gap-1 px-2 py-2 rounded-lg text-sm transition-colors ${currentConversationId === conv.id ? 'font-medium' : ''
                        }`}
                    style={{
                        backgroundColor: currentConversationId === conv.id ? 'var(--hover-bg)' : 'transparent',
                    }}
                >
                    <button
                        onClick={() => onSelectConversation(conv)}
                        className="flex-1 text-left truncate"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {conv.title || 'New conversation'}
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={(e) => handleDelete(e, conv)}
                        className="p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Delete"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};
