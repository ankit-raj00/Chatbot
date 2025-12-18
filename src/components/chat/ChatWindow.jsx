
import { useEffect, useRef } from 'react';
import { Message } from './Message';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const ChatWindow = ({ messages, loading }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-transparent custom-scrollbar">
            {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center p-8 glass-panel rounded-3xl animate-float">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow transform rotate-3 hover:rotate-6 transition-transform duration-500">
                            <span className="text-white font-bold text-3xl tracking-tighter">AX</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">How can I help you?</h2>
                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                            I'm AgentX, enhanced with MCP tools. Ask me to manage files, check context, or just chat.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {messages.map((msg, index) => (
                        <Message key={index} message={msg} />
                    ))}
                    {loading && (
                        <div className="flex justify-start mb-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-6 py-4 backdrop-blur-md shadow-lg">
                                <LoadingSpinner />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
};
