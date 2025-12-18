export const ConversationItem = ({ conversation, isActive, onClick, onDelete }) => {
    return (
        <div
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${isActive
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {conversation.title || 'New Conversation'}
                    </h3>
                    <p className={`text-xs truncate ${isActive ? 'text-purple-100' : 'text-gray-500'}`}>
                        {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conversation.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 ${isActive ? 'text-white hover:bg-red-500' : 'text-red-600'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
