import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../config';
import { MermaidDiagram } from './MermaidDiagram';

const FileCreatedStep = ({ file, onClick }) => {
    return (
        <div
            className="w-full rounded-lg border flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--hover-bg)] cursor-pointer group"
            style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border-color)'
            }}
            onClick={(e) => {
                e.preventDefault();
                onClick({ type: 'file_preview', title: file.name, url: file.download_url, ext: file.ext });
            }}
            title="Click to preview"
        >
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement('a');
                    const fullUrl = file.download_url.startsWith('http') ? file.download_url : `${API_BASE_URL}${file.download_url.startsWith('/') ? '' : '/'}${file.download_url}`;
                    a.href = fullUrl;
                    a.download = file.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }}
                className="w-8 h-8 rounded bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center flex-shrink-0 transition-colors"
                title="Download file"
            >
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </button>
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {file.name}
                </span>
                <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {(file.size_bytes / 1024).toFixed(1)} KB • {file.ext ? file.ext.toUpperCase() : 'FILE'}
                </span>
            </div>
        </div>
    );
};

const LiveTerminal = ({ outputs }) => {
    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [outputs]);

    if (!outputs || outputs.length === 0) return null;

    return (
        <div 
            className="mt-2 rounded overflow-hidden flex flex-col font-mono text-[11px] leading-snug"
            style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', border: '1px solid var(--border-color)' }}
        >
            <div className="flex items-center px-3 py-1.5 bg-[#2d2d2d] border-b border-[#404040]">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="ml-3 text-[#858585] font-sans text-[10px] uppercase tracking-wider">Terminal</span>
            </div>
            <div ref={terminalRef} className="p-3 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {outputs.map((out, idx) => (
                    <div key={idx} style={{ color: out.stream === 'stderr' ? '#f14c4c' : 'inherit' }}>
                        {out.line}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ToolStep = ({ step }) => {
    const isCompleted = step.status === 'completed';
    const isRunning   = step.status === 'running';
    const isExecTool  = step.name === 'run_python' || step.name === 'run_shell';

    // Auto-expand while running, allow manual toggle once done
    const [manualExpanded, setManualExpanded] = useState(null); // null = follow auto
    const expanded = manualExpanded !== null ? manualExpanded : isRunning;

    // Reset manual state when a new run starts
    useEffect(() => {
        if (isRunning) setManualExpanded(null);
    }, [isRunning]);

    const toggleExpand = () => setManualExpanded(prev => !(prev !== null ? prev : isRunning));

    // Format args for display — for code tools, extract just the code field nicely
    const formatArgs = (args) => {
        if (!args) return null;
        if (typeof args === 'string') return args;
        if (isExecTool && args.code) return args.code;
        return JSON.stringify(args, null, 2);
    };

    const formattedArgs = formatArgs(step.args);

    return (
        <div
            className="rounded-lg border overflow-hidden transition-all"
            style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: isRunning ? 'var(--accent)' : 'var(--border-color)',
                boxShadow: isRunning ? '0 0 0 1px var(--accent)20' : 'none'
            }}
        >
            {/* Header */}
            <button
                onClick={toggleExpand}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--hover-bg)] transition-colors"
            >
                {/* Status Icon */}
                {isCompleted ? (
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}

                {/* Tool Name */}
                <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {step.name}
                </span>

                {/* Running badge */}
                {isRunning && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent)20', color: 'var(--accent)' }}>
                        RUNNING
                    </span>
                )}

                {/* Expand Arrow */}
                <svg
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Details — shown while running OR when manually expanded */}
            {expanded && (
                <div className="border-t space-y-0" style={{ borderColor: 'var(--border-color)' }}>
                    {/* Input */}
                    {formattedArgs && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider px-3 pt-2 pb-1" style={{ color: 'var(--text-secondary)' }}>
                                {isExecTool ? '⌨ Code' : '⌨ Input'}
                            </p>
                            <pre
                                className="text-xs px-3 pb-2 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed"
                                style={{ color: 'var(--text-primary)', maxHeight: '200px', overflowY: 'auto' }}
                            >
                                {formattedArgs}
                            </pre>
                        </div>
                    )}

                    {/* Live Terminal — shown while running AND after complete */}
                    {isExecTool && step.exec_output && step.exec_output.length > 0 && (
                        <LiveTerminal outputs={step.exec_output} />
                    )}

                    {/* Result — shown after completion */}
                    {step.result && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider px-3 pt-2 pb-1" style={{ color: 'var(--text-secondary)' }}>
                                ✓ Result
                            </p>
                            <pre
                                className="text-xs px-3 pb-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed"
                                style={{ color: 'var(--accent)', maxHeight: '150px', overflowY: 'auto' }}
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

const SkillStep = ({ skill, onClick }) => {
    return (
        <button
            onClick={() => onClick({ type: 'skill', title: skill.name, data: skill.content })}
            className="w-full rounded-lg border flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--hover-bg)]"
            style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border-color)'
            }}
        >
            <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                Using skill: {skill.name}
            </span>
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
};

const ArtifactStep = ({ artifact, onClick }) => {
    return (
        <button
            onClick={() => onClick({ type: 'artifact', title: artifact.name, data: artifact.content })}
            className="w-full rounded-lg border flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--hover-bg)]"
            style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border-color)'
            }}
        >
            <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                Generated artifact: {artifact.name}
            </span>
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
};

export const Message = ({ message, onOpenArtifact }) => {
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
                {/* Hallucination Warning */}
                {message.hallucination_warning && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <strong>Possible Hallucination Detected</strong>
                            <p className="opacity-80 mt-1">The system could not fully verify this answer against your retrieved context. Please double-check the sources.</p>
                        </div>
                    </div>
                )}

                {/* Tool Steps */}
                {message.toolSteps && message.toolSteps.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {message.toolSteps.map((step, index) => (
                            <ToolStep key={index} step={step} />
                        ))}
                    </div>
                )}

                {/* Skills used */}
                {message.skills && message.skills.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {message.skills.map((skill, index) => (
                            <SkillStep key={index} skill={skill} onClick={onOpenArtifact} />
                        ))}
                    </div>
                )}

                {/* Artifacts Created */}
                {message.artifacts && message.artifacts.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {message.artifacts.map((artifact, index) => (
                            <ArtifactStep key={index} artifact={artifact} onClick={onOpenArtifact} />
                        ))}
                    </div>
                )}

                {/* Files Created */}
                {message.files_created && message.files_created.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {message.files_created.map((file, index) => (
                            <FileCreatedStep key={index} file={file} onClick={onOpenArtifact} />
                        ))}
                    </div>
                )}

                {/* Message Content */}
                <div
                    className="prose prose-sm max-w-none"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {message.content ? (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const lang = match?.[1] || '';
                                const codeString = String(children).replace(/\n$/, '');

                                // Render mermaid diagrams inline
                                if (!inline && lang === 'mermaid') {
                                    return <MermaidDiagram chart={codeString} isDark={isDark} />;
                                }

                                if (!inline && match) {
                                    return (
                                        <details className="mb-4 rounded-lg overflow-hidden border border-[var(--border-color)] group">
                                            <summary 
                                                className="px-4 py-2 cursor-pointer bg-[var(--bg-secondary)] font-medium text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors flex items-center justify-between select-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-[var(--text-secondary)] transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    Code Snippet ({lang})
                                                </div>
                                            </summary>
                                            <div className="border-t border-[var(--border-color)]">
                                                <SyntaxHighlighter
                                                    style={isDark ? oneDark : oneLight}
                                                    language={lang}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: 0,
                                                        borderRadius: 0,
                                                        fontSize: '0.875rem'
                                                    }}
                                                    {...props}
                                                >
                                                    {codeString}
                                                </SyntaxHighlighter>
                                            </div>
                                        </details>
                                    );
                                }
                                return (
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
                            a: ({ node, ...props }) => {
                                const href = props.href || '';
                                // Check if it's explicitly a sandbox file or looks like a relative file link
                                const isSandboxFile = href.includes('/api/outputs/my/') || 
                                    (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#') && href.includes('.'));

                                if (isSandboxFile) {
                                    // Strip any leading path segments (e.g. "outputs/") — the route only needs the filename
                                    let filename = href.includes('/api/outputs/my/') 
                                        ? href 
                                        : href.replace(/^\/?outputs\//, '').replace(/^\/+/, '');
                                    const url = href.includes('/api/outputs/my/') ? href : `/api/outputs/my/${filename}`;
                                        
                                    return (
                                        <a
                                            {...props}
                                            href={url}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const label = Array.isArray(props.children) ? props.children[0] : props.children || 'File';
                                                const ext = url.split('.').pop() || '';
                                                onOpenArtifact({ type: 'file_preview', title: label, url: url, ext: ext.toLowerCase() });
                                            }}
                                            style={{ color: 'var(--accent)' }}
                                            className="underline"
                                        >
                                            {props.children}
                                        </a>
                                    );
                                }
                                return (
                                    <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }} className="underline">
                                        {props.children}
                                    </a>
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
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                    ) : (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            {message.streaming ? 'Working...' : ''}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
