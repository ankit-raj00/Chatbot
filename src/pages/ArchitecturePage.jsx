// AgentX — Architecture & Flow showcase.
// This page also establishes the app's future dark developer-tool design
// language. Everything is scoped under `.arch-root` (see architecture.css)
// so it is fully self-contained and always renders in its dark treatment,
// independent of the app's light/dark theme toggle.

import { Link } from 'react-router-dom';
import '../components/architecture/architecture.css';
import { TopBar, ProgressRail } from '../components/architecture/Nav';
import { Hero } from '../components/architecture/Hero';
import { AgentLoop } from '../components/architecture/AgentLoop';
import { Tools } from '../components/architecture/Tools';
import { Sandbox } from '../components/architecture/Sandbox';
import { Skills } from '../components/architecture/Skills';
import { MCP } from '../components/architecture/MCP';
import { Rag } from '../components/architecture/Rag';
import { Memory } from '../components/architecture/Memory';
import { RequestFlow } from '../components/architecture/RequestFlow';
import { IconArrowRight } from '../components/architecture/icons';

export const ArchitecturePage = () => {
    return (
        <div className="arch-root">
            <TopBar />
            <ProgressRail />

            <main className="max-w-6xl mx-auto px-5 md:px-8">
                <Hero />

                <div className="space-y-28 md:space-y-36 pb-8">
                    <AgentLoop />
                    <Tools />
                    <Sandbox />
                    <Skills />
                    <MCP />
                    <Rag />
                    <Memory />
                    <RequestFlow />
                </div>

                {/* Closing CTA */}
                <section className="py-24 text-center">
                    <hr className="arch-rule mb-16" />
                    <h2 className="arch-h text-[clamp(1.8rem,4vw,3rem)] font-semibold max-w-2xl mx-auto">
                        Stop prompting a chatbot.
                        <br />
                        <span style={{ color: 'var(--arch-text-dim)' }}>Start delegating to an agent.</span>
                    </h2>
                    <div className="mt-9 flex items-center justify-center gap-3">
                        <Link
                            to="/chat"
                            className="arch-lift group inline-flex items-center gap-2 text-[14px] font-medium px-6 py-3 rounded-lg"
                            style={{ background: 'var(--arch-accent)', color: '#12100a' }}
                        >
                            Open the workspace
                            <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            to="/"
                            className="arch-lift inline-flex items-center text-[14px] font-medium px-6 py-3 rounded-lg"
                            style={{ border: '1px solid var(--arch-line-strong)', color: 'var(--arch-text)' }}
                        >
                            Back to home
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-10 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid var(--arch-line)' }}>
                    <span className="arch-mono text-[11.5px]" style={{ color: 'var(--arch-text-faint)' }}>
                        AgentX · single ReAct agent · Graph Builder v3
                    </span>
                    <span className="arch-mono text-[11.5px]" style={{ color: 'var(--arch-text-faint)' }}>
                        LangGraph · FastAPI · Qdrant · OmniRoute → Gemini
                    </span>
                </footer>
            </main>
        </div>
    );
};

export default ArchitecturePage;
