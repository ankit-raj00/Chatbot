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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-4xl">G</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start a Conversation</h2>
                        <p className="text-gray-500">Send a message to begin chatting with Gemini AI</p>
                    </div>
                </div>
            ) : (
                <>
                    {messages.map((msg, index) => (
                        <Message key={index} message={msg} />
                    ))}
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
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
