import { useEffect, useRef } from 'react';
import { Message } from './Message';

export const ChatWindow = ({ messages, loading }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-4">
                        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            What can I help with?
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Ask me anything or use tools to interact with your files and services.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto w-full py-4 px-4">
                    {messages.map((msg, index) => (
                        <Message key={index} message={msg} />
                    ))}
                    {loading && (
                        <div className="flex gap-3 py-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                                <span className="text-white text-xs font-medium">AI</span>
                            </div>
                            <div className="flex items-center gap-1 pt-2">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-secondary)', animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-secondary)', animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
    );
};
