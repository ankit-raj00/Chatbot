import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../context/ThemeContext';

const ToolStep = ({ step }) => {
    const [expanded, setExpanded] = useState(false);
    const isCompleted = step.status === 'completed';

    return (
        <div
            className="rounded-lg border overflow-hidden"
            style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border-color)'
            }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left"
            >
                {/* Status Icon */}
                {isCompleted ? (
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}

                {/* Tool Name */}
                <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {step.name}
                </span>

                {/* Expand Arrow */}
                <svg
                    className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Details */}
            {expanded && (
                <div className="px-3 pb-3 space-y-2">
                    {/* Input */}
                    {step.args && (
                        <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Input:</p>
                            <pre
                                className="text-xs p-2 rounded overflow-x-auto"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {typeof step.args === 'string' ? step.args : JSON.stringify(step.args, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Result */}
                    {step.result && (
                        <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Result:</p>
                            <pre
                                className="text-xs p-2 rounded overflow-x-auto"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--accent)'
                                }}
                            >
                                {typeof step.result === 'string' ? step.result : JSON.stringify(step.result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const Message = ({ message }) => {
    const { isDark } = useTheme();
    const isUser = message.role === 'user';

    return (
        <div className="flex gap-4 py-4">
            {/* Avatar */}
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
                style={{
                    backgroundColor: isUser ? 'var(--text-secondary)' : 'var(--accent)',
                    color: 'white'
                }}
            >
                {isUser ? 'U' : 'AI'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Tool Steps */}
                {message.toolSteps && message.toolSteps.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {message.toolSteps.map((step, index) => (
                            <ToolStep key={index} step={step} />
                        ))}
                    </div>
                )}

                {/* Message Content */}
                <div
                    className="prose prose-sm max-w-none"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={isDark ? oneDark : oneLight}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{
                                            margin: '1rem 0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code
                                        className="px-1.5 py-0.5 rounded text-sm"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            p({ children }) {
                                return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                            },
                            ul({ children }) {
                                return <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>;
                            },
                            ol({ children }) {
                                return <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>;
                            },
                            a({ href, children }) {
                                return (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--accent)' }}
                                        className="underline"
                                    >
                                        {children}
                                    </a>
                                );
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
