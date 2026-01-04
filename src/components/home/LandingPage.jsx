import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const LandingPage = () => {
    const { user, loading } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const isLoggedIn = !loading && user;

    const features = [
        {
            title: 'Advanced Chat',
            description: 'Experience fluid conversations with Gemini 2.5 Flash, optimized for speed and context awareness.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            )
        },
        {
            title: 'MCP Tools Integration',
            description: 'Connect to external worlds using Model Context Protocol. Use Google Drive, Local Files, and more.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            title: 'Vision & File Uploads',
            description: 'Upload images and documents directly. Analyze, summarize, and chat with your content.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: 'Hybrid Tool Selection',
            description: 'Seamlessly switch between native tools and MCP servers with our intuitive selection system.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            )
        }
    ];

    const upcoming = [
        {
            title: 'RAG Knowledge Base',
            description: 'Build your own knowledge base. Chat with entire document libraries with high accuracy.',
            date: 'Coming Soon'
        },
        {
            title: 'Voice Mode',
            description: 'Real-time voice conversations for hands-free interaction.',
            date: 'Coming Soon'
        },
        {
            title: 'Custom Prompts',
            description: 'Save and reuse your favorite prompts for consistent workflows.',
            date: 'Coming Soon'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--bg-primary)' }}>

            {/* Background Decorations */}
            <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-10 pointer-events-none"
                style={{ background: 'var(--accent)' }} />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-10 pointer-events-none"
                style={{ background: 'var(--accent)' }} />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 border-b z-50"
                style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'rgba(var(--bg-primary-rgb), 0.8)',
                    backdropFilter: 'blur(10px)'
                }}>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    AX AgentX
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--hover-bg)]"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {isDark ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    {isLoggedIn ? (
                        <Link to="/chat" className="btn-primary text-sm px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20">
                            Open Workspace
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                                Sign in
                            </Link>
                            <Link to="/signup" className="btn-primary text-sm px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center px-6 pt-32 pb-16 z-10 w-full max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mb-24">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6 border"
                        style={{
                            borderColor: 'var(--accent)',
                            color: 'var(--accent)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }}>
                        v1.1 Now Available
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Your Intelligent <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">AI Workspace</span>
                    </h1>
                    <p className="text-xl mb-10 leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        AgentX bridges the gap between AI and your digital world. Connect to files, tools, and MCP servers in a beautiful, unified interface.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            to={isLoggedIn ? "/chat" : "/signup"}
                            className="btn-primary text-lg px-8 py-3 rounded-xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform"
                        >
                            {isLoggedIn ? 'Launch Workspace' : 'Start for Free'}
                        </Link>
                        <a href="#features" className="px-8 py-3 rounded-xl text-lg font-medium border hover:bg-[var(--hover-bg)] transition-colors"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            Explore Features
                        </a>
                    </div>
                </div>

                {/* Current Features Grid */}
                <div id="features" className="max-w-6xl w-full mb-24">
                    <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
                        Powerful Features
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-6 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)'
                                }}>
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                    style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--accent)' }}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Features */}
                <div className="max-w-4xl w-full mb-16">
                    <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
                        Coming Soon to AgentX
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {upcoming.map((item, idx) => (
                            <div key={idx} className="relative p-6 rounded-2xl border overflow-hidden group"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)'
                                }}>
                                <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-bl-xl">
                                    {item.date}
                                </div>
                                <h3 className="text-lg font-semibold mb-3 mt-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="py-8 border-t text-center relative z-10"
                style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-primary)'
                }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    © 2025 AgentX. Powering the future of intelligent work.
                </p>
            </footer>
        </div>
    );
};
