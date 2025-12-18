
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
        <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
                <span className="text-xs font-mono text-slate-400">{language || 'text'}</span>
                <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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
            </div>
            <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: 0, background: 'rgba(0, 0, 0, 0.3)' }}
                className="!mt-0"
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
        <div className="mb-2 bg-black/20 rounded-lg border border-white/10 overflow-hidden text-xs w-full max-w-full backdrop-blur-sm">
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-2 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {isCompleted ? (
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-primary-400 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                    <span className="font-medium text-slate-200 font-mono truncate">
                        {step.name}
                    </span>
                </div>
                <svg className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                </svg>
            </div>

            {/* Body */}
            {isOpen && (
                <div className="p-3 border-t border-white/10 bg-black/20">
                    <div className="mb-2">
                        <div className="text-slate-400 font-semibold mb-1">Input:</div>
                        <pre className="bg-black/30 p-2 rounded text-slate-300 overflow-x-auto font-mono whitespace-pre-wrap border border-white/5">
                            {JSON.stringify(step.args, null, 2)}
                        </pre>
                    </div>
                    {step.result && (
                        <div>
                            <div className="text-slate-400 font-semibold mb-1">Result:</div>
                            <pre className="bg-black/30 p-2 rounded text-green-300 overflow-x-auto font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border border-white/5">
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
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
            <div
                className={`max-w-[75%] rounded-2xl px-6 py-4 relative shadow-md transition-all ${isUser
                    ? 'bg-aurora-gradient text-white rounded-tr-sm'
                    : 'bg-white/5 text-slate-200 border border-white/10 backdrop-blur-md rounded-tl-sm'
                    }`}
            >
                {message.hasImages && isUser && (
                    <div className="mb-2 text-xs opacity-90 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg w-fit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Image attached</span>
                    </div>
                )}
                <div className={`text-base leading-relaxed break-words ${!isUser ? 'markdown-body dark-markdown' : ''}`}>

                    {/* Tool Steps */}
                    {!isUser && message.toolSteps && message.toolSteps.length > 0 && (
                        <div className="mb-4 space-y-2">
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
                                        <code {...props} className={`${className} bg-primary-500/20 text-primary-200 rounded px-1.5 py-0.5 font-mono text-sm`}>
                                            {children}
                                        </code>
                                    )
                                },
                                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc ml-4 mb-3 marker:text-primary-400">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 marker:text-primary-400">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                a: ({ children, href }) => <a href={href} className="text-primary-400 hover:text-primary-300 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary-500/50 pl-4 italic my-3 text-slate-400 bg-white/5 py-2 pr-2 rounded-r-lg">{children}</blockquote>,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                    {message.streaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-primary-400 animate-pulse rounded-full"></span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 opacity-75">
                    <div className={`text-xs ${isUser ? 'text-purple-200' : 'text-slate-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {!message.streaming && (
                        <button
                            onClick={handleCopyMessage}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isUser ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                            title="Copy message"
                        >
                            {messageCopied ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
