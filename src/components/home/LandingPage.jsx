import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const LandingPage = () => {
    const { user, loading } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const isLoggedIn = !loading && user;

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>AgentX</span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg"
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
                        <Link to="/chat" className="btn-primary text-sm">
                            Open Chat
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                Sign in
                            </Link>
                            <Link to="/signup" className="btn-primary text-sm">
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Hero */}
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="text-center max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Your AI assistant with tools
                    </h1>
                    <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                        Chat with AI that can connect to your files, Google Drive, and custom tools through MCP.
                    </p>
                    <Link
                        to={isLoggedIn ? "/chat" : "/signup"}
                        className="btn-primary inline-block text-base px-6 py-3"
                    >
                        {isLoggedIn ? 'Start chatting' : 'Try for free'}
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="h-16 flex items-center justify-center border-t" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    © 2025 AgentX
                </p>
            </footer>
        </div>
    );
};
