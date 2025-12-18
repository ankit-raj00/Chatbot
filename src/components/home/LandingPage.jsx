
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background text-white relative overflow-x-hidden selection:bg-primary-500/30 selection:text-white flex flex-col font-sans">
            {/* Animated Background Orbs (Aurora Effect) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-900/20 rounded-full blur-[120px] animate-float opacity-70" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-900/20 rounded-full blur-[120px] animate-float opacity-70" style={{ animationDelay: '-3s' }} />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse-slow opacity-50" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 w-full border-b border-white/5 bg-white/5 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
                            AX
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">AgentX</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link
                                to="/chat"
                                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg font-semibold transition-all backdrop-blur-md border border-white/10 text-sm"
                            >
                                Launch App
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-primary/25 text-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col">
                <div className="text-center px-4 py-24 sm:py-32 max-w-5xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-300 animate-fade-in-up backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        v1.0 Now Live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Your Intelligent <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-purple-400 to-secondary-400 animate-gradient-x">
                            AI Workspace
                        </span>
                    </h1>

                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Ditch the isolated chatbots. AgentX integrates directly with your files and local tools via MCP, turning conversation into action.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link
                            to={user ? "/chat" : "/signup"}
                            className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center shadow-lg shadow-primary-500/25 transition-all"
                        >
                            {user ? 'Open Dashboard' : 'Start Free Trial'}
                        </Link>
                        <a href="#features" className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold flex items-center justify-center transition-all backdrop-blur-sm">
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Features (Available) */}
                <div id="features" className="max-w-7xl mx-auto px-6 pb-24 w-full">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Powering Your Workflow</h2>
                        <p className="text-slate-400">Everything you need to be productive, available today.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PremiumCard
                            icon={
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            }
                            title="Advanced Chat"
                            description="Gemini 2.5 Pro & Flash models with massive context windows for complex reasoning."
                            color="bg-blue-500"
                        />
                        <PremiumCard
                            icon={
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            }
                            title="MCP Integration"
                            description="The core engine. Connect local scripts, databases, and APIs directly to the chat context."
                            color="bg-purple-500"
                        />
                        <PremiumCard
                            icon={
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            }
                            title="Multimodal Vision"
                            description="Drag and drop images or PDFs. AgentX sees what you see and analyzes documents instantly."
                            color="bg-pink-500"
                        />
                    </div>
                </div>

                {/* Roadmap */}
                <div className="w-full bg-black/20 backdrop-blur-md border-t border-white/5 py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Future Roadmap</h2>
                                <p className="text-slate-400">Expanding the capabilities of your workspace.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wide">In Development</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RoadmapCard
                                title="Universal Connectors"
                                description="Deep two-way integration with Google Workspace. Draft emails, edit sheets, and organize Drive files directly from chat."
                                icon="🔌"
                            />
                            <RoadmapCard
                                title="Knowledge Base (RAG)"
                                description="A persistent memory layer. Upload your entire wiki or documentation, and AgentX will cite it in every answer."
                                icon="🧠"
                            />
                            <RoadmapCard
                                title="Studio Mode"
                                description="Craft, test, and save custom system prompts. Share your 'Agents' with your team or keep them for personal workflows."
                                icon="✨"
                            />
                            <RoadmapCard
                                title="Voice & Real-time"
                                description="Speak naturally to AgentX. Real-time voice processing for hands-free productivity on the go."
                                icon="🎙️"
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-white/5 bg-black/40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white font-bold text-xs border border-white/10">AX</div>
                        <span className="text-sm font-semibold text-slate-400">© 2025 AgentX</span>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const PremiumCard = ({ icon, title, description, color }) => (
    <div className="relative group p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
        <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/5 rounded-[20px] p-8 overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-lg shadow-${color.replace('bg-', '')}/20`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-300 leading-relaxed text-sm">{description}</p>
        </div>
    </div>
);

const RoadmapCard = ({ title, description, icon }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex gap-5 hover:bg-white/10 transition-colors group">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    </div>
);
