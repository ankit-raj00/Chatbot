import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ language, children, ...props }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <button
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1 rounded bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                title="Copy code"
            >
                {copied ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                )}
            </button>
            <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-md !my-2 !mt-0"
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    );
};

const ToolStep = ({ step }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isCompleted = step.status === 'completed';

    return (
        <div className="mb-2 bg-white rounded-md border border-gray-200 overflow-hidden text-xs w-full max-w-full">
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {isCompleted ? (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                    <span className="font-medium text-gray-700 font-mono truncate">
                        {step.name}
                    </span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                </svg>
            </div>

            {/* Body */}
            {isOpen && (
                <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="mb-2">
                        <div className="text-gray-500 font-semibold mb-1">Input:</div>
                        <pre className="bg-gray-50 p-2 rounded text-gray-600 overflow-x-auto font-mono whitespace-pre-wrap">
                            {JSON.stringify(step.args, null, 2)}
                        </pre>
                    </div>
                    {step.result && (
                        <div>
                            <div className="text-gray-500 font-semibold mb-1">Result:</div>
                            <pre className="bg-gray-50 p-2 rounded text-gray-600 overflow-x-auto font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {step.result}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const Message = ({ message }) => {
    const isUser = message.role === 'user';
    const [messageCopied, setMessageCopied] = useState(false);

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(message.content);
        setMessageCopied(true);
        setTimeout(() => setMessageCopied(false), 2000);
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
            <div
                className={`max-w-[70%] rounded-lg px-4 py-3 relative ${isUser
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                    }`}
            >
                {message.hasImages && isUser && (
                    <div className="mb-2 text-xs opacity-75 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Image attached</span>
                    </div>
                )}
                <div className={`text-sm break-words ${!isUser ? 'markdown-body' : ''}`}>

                    {/* Tool Steps */}
                    {!isUser && message.toolSteps && message.toolSteps.length > 0 && (
                        <div className="mb-3 space-y-1">
                            {message.toolSteps.map((step, idx) => (
                                <ToolStep key={idx} step={step} />
                            ))}
                        </div>
                    )}

                    {isUser ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                        <CodeBlock
                                            language={match[1]}
                                            children={children}
                                            {...props}
                                        />
                                    ) : (
                                        <code {...props} className={`${className} bg-black/10 rounded px-1 py-0.5`}>
                                            {children}
                                        </code>
                                    )
                                },
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                a: ({ children, href }) => <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">{children}</blockquote>,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                    {message.streaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"></span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className={`text-xs ${isUser ? 'text-purple-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    {!message.streaming && (
                        <button
                            onClick={handleCopyMessage}
                            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'text-purple-100 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            title="Copy message"
                        >
                            {messageCopied ? (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
