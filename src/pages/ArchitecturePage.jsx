import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const ArchitecturePage = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const FlowArrow = () => (
        <svg className="w-6 h-6 text-indigo-500 animate-pulse mx-auto my-2 md:my-0 md:-rotate-90 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
    );

    return (
        <div className="min-h-screen pb-20 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            
            {/* Header Navigation */}
            <header className="border-b sticky top-0 z-50 backdrop-blur-md bg-opacity-80 transition-colors duration-300" style={{ borderColor: 'var(--border-color)', backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            AgentX Architecture
                        </h1>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full border transition-all duration-300 hover:shadow-lg"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        {isDark ? (
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-12 space-y-24">
                
                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 mb-4 border border-indigo-200 dark:border-indigo-800">
                        END-TO-END PIPELINE
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        An Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Agentic RAG</span> System
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl" style={{ color: 'var(--text-secondary)' }}>
                        AgentX is not just a chatbot. It is a highly orchestrable AI agent powered by LangGraph, capable of reasoning, retrieving contextual knowledge via Qdrant, and executing dynamic tools via the Model Context Protocol (MCP).
                    </p>
                </section>

                {/* Pipeline Flowchart Visualization */}
                <section>
                    <h3 className="text-2xl font-bold mb-8 text-center">Data & Execution Flow</h3>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-8 rounded-3xl border shadow-xl relative overflow-hidden"
                         style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

                        {/* Step 1 */}
                        <div className="z-10 flex flex-col items-center w-full md:w-1/4 p-6 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                            </div>
                            <h4 className="font-bold text-lg mb-2">User Query</h4>
                            <p className="text-sm text-center text-slate-500 dark:text-slate-400">React Frontend sends prompt via streaming API</p>
                        </div>

                        <FlowArrow />

                        {/* Step 2 */}
                        <div className="z-10 flex flex-col items-center w-full md:w-1/4 p-6 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-lg border-indigo-500/30 transition-transform hover:-translate-y-1">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-center">LangGraph Orchestrator</h4>
                            <p className="text-sm text-center text-slate-500 dark:text-slate-400">Determines if RAG or Tools are needed to answer</p>
                        </div>

                        <FlowArrow />

                        {/* Step 3 (Split path) */}
                        <div className="z-10 flex flex-col gap-4 w-full md:w-1/4">
                            <div className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
                                <h4 className="font-semibold text-sm mb-1 text-emerald-600 dark:text-emerald-400">RAG Engine (Qdrant)</h4>
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400">Performs Semantic Search on indexed docs</p>
                            </div>
                            <div className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
                                <h4 className="font-semibold text-sm mb-1 text-amber-600 dark:text-amber-400">MCP / Native Tools</h4>
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400">Executes Drive, Web Search, or custom APIs</p>
                            </div>
                        </div>

                        <FlowArrow />

                        {/* Step 4 */}
                        <div className="z-10 flex flex-col items-center w-full md:w-1/4 p-6 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </div>
                            <h4 className="font-bold text-lg mb-2">Gemini 2.5 Flash</h4>
                            <p className="text-sm text-center text-slate-500 dark:text-slate-400">Synthesizes context and streams final answer</p>
                        </div>
                    </div>
                </section>

                {/* Core Architecture Components Grid */}
                <section>
                    <h3 className="text-2xl font-bold mb-8">Deep Dive into Architecture</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        
                        {/* RAG Engine */}
                        <div className="p-8 rounded-3xl border hover:shadow-lg transition-shadow bg-gradient-to-br from-transparent to-slate-50 dark:to-slate-800/50 md:col-span-2" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3">1. Multi-Modal RAG Ingestion Pipeline</h4>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                A state-of-the-art document processing engine that doesn't just read text, but actually "sees" and understands complex PDF structures, charts, and images using a multi-library orchestration flow.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6 mt-6">
                                <ul className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded">
                                            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                        </div>
                                        <div>
                                            <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">Agentic Extraction (LlamaParse)</strong>
                                            The primary engine. We use <code>llama-parse</code> in 'agentic' mode to intelligently extract text, complex tables (as HTML), and identify bounding boxes for embedded images inside PDFs.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 p-1 rounded">
                                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                        </div>
                                        <div>
                                            <strong className="text-blue-700 dark:text-blue-400 block mb-1">Vision Analysis (Gemini 2.5 Flash Lite)</strong>
                                            When LlamaParse detects an image/chart, it is downloaded and passed to the <code>google.genai</code> vision model to generate a rich, contextual text summary of what the image contains.
                                        </div>
                                    </li>
                                </ul>
                                <ul className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-orange-100 dark:bg-orange-900/30 p-1 rounded">
                                            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                        </div>
                                        <div>
                                            <strong className="text-orange-700 dark:text-orange-400 block mb-1">Cloud Storage & Compilation</strong>
                                            Extracted images are uploaded to <code>Cloudinary</code> for permanent hosting. The system then compiles the text, tables, and AI-generated image summaries into a single, cohesive Markdown document.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-purple-100 dark:bg-purple-900/30 p-1 rounded">
                                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                                        </div>
                                        <div>
                                            <strong className="text-purple-700 dark:text-purple-400 block mb-1">Vector Search & Fallback</strong>
                                            The compiled Markdown is chunked via <code>RecursiveCharacterTextSplitter</code> and embedded into <code>Qdrant</code>. If cloud parsing fails, the system safely falls back to local parsing using <code>langchain_unstructured</code>.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* LangGraph */}
                        <div className="p-8 rounded-3xl border hover:shadow-lg transition-shadow bg-gradient-to-br from-transparent to-indigo-50 dark:to-indigo-900/20" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3">2. LangGraph Orchestration</h4>
                            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    <span><strong>State Management:</strong> Maintains conversation history and tool execution results in a typed `StateGraph`.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    <span><strong>Intelligent Routing:</strong> LLM decides dynamically whether to query the vector DB, call an external API, or answer directly.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    <span><strong>Dynamic Binding:</strong> Tools are hot-swapped into the LLM context per request based on user configuration.</span>
                                </li>
                            </ul>
                        </div>

                        {/* MCP Ecosystem */}
                        <div className="p-8 rounded-3xl border hover:shadow-lg transition-shadow bg-gradient-to-br from-transparent to-purple-50 dark:to-purple-900/20" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3">3. Extensible Tool Ecosystem (MCP)</h4>
                            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    <span><strong>Model Context Protocol:</strong> Supports seamless connection to standardized external servers (e.g., GitHub, Postgres) without hardcoding logic.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    <span><strong>Native API Integrations:</strong> Features custom built native tools for Google Drive Docs extraction and Tavily Web Search.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Database & Security */}
                        <div className="p-8 rounded-3xl border hover:shadow-lg transition-shadow bg-gradient-to-br from-transparent to-orange-50 dark:to-orange-900/20" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3">4. Database & Security</h4>
                            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    <span><strong>MongoDB Motor:</strong> Fully async document storage for Users, Conversations, Messages, and OAuth credentials.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    <span><strong>JWT Authentication:</strong> Secure bearer token middleware protecting all API routes and websocket connections.</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </section>

                {/* Tech Stack Marquee / List */}
                <section className="pb-12 text-center">
                    <h3 className="text-lg font-semibold mb-6 text-slate-500 uppercase tracking-widest">Built With Modern Technologies</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['React', 'TailwindCSS', 'Vite', 'FastAPI', 'LangGraph', 'LangChain', 'MongoDB', 'Qdrant', 'Google Gemini 2.5', 'LlamaParse', 'Model Context Protocol (MCP)'].map(tech => (
                            <span key={tech} className="px-4 py-2 rounded-full border text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};
