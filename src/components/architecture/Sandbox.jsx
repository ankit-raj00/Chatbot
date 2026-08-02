import { Section, SectionHead, Reveal, Tag } from './primitives';
import { IconUser, IconFolder, IconVenv, IconLock } from './icons';

function WorkspaceCell({ user, active }) {
    const folders = [
        { name: 'uploads/', note: 'what the user sends in' },
        { name: 'outputs/', note: 'artifacts the agent produces' },
        { name: 'work/', note: 'scratch space for the run' },
    ];
    return (
        <div
            className="arch-panel relative overflow-hidden p-5 flex-1"
            style={active ? { borderColor: 'var(--arch-accent-line)' } : undefined}
        >
            {/* scanning shimmer only on the active cell */}
            {active && (
                <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
                    style={{
                        background: 'linear-gradient(180deg, var(--arch-accent-wash), transparent)',
                        animation: 'archScan 3.5s ease-in-out infinite',
                    }} />
            )}
            <div className="flex items-center gap-2.5 relative">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--arch-bg-inset)', border: '1px solid var(--arch-line)', color: 'var(--arch-text-dim)' }}>
                    <IconUser width={16} height={16} />
                </div>
                <div>
                    <div className="arch-mono text-[12.5px]" style={{ color: 'var(--arch-text)' }}>{user}</div>
                    <div className="arch-mono text-[10.5px]" style={{ color: 'var(--arch-text-faint)' }}>~/agentx_workspace/{user}</div>
                </div>
            </div>

            <div className="mt-4 space-y-1.5 relative">
                {folders.map((f) => (
                    <div key={f.name} className="arch-panel-inset flex items-center gap-2.5 px-3 py-2">
                        <IconFolder width={15} height={15} style={{ color: 'var(--arch-accent)' }} />
                        <span className="arch-mono text-[12px]" style={{ color: 'var(--arch-text)' }}>{f.name}</span>
                        <span className="text-[11px] ml-auto hidden sm:block" style={{ color: 'var(--arch-text-faint)' }}>{f.note}</span>
                    </div>
                ))}
                <div className="arch-panel-inset flex items-center gap-2.5 px-3 py-2" style={{ borderColor: 'var(--arch-accent-line)' }}>
                    <IconVenv width={15} height={15} style={{ color: 'var(--arch-accent)' }} />
                    <span className="arch-mono text-[12px]" style={{ color: 'var(--arch-text)' }}>venv/</span>
                    <span className="text-[11px] ml-auto" style={{ color: 'var(--arch-text-faint)' }}>private interpreter</span>
                </div>
            </div>
        </div>
    );
}

export function Sandbox() {
    return (
        <Section id="sandbox">
            <SectionHead
                index={3}
                eyebrow="Per-user sandbox"
                title="Every user gets a real machine of their own."
                lede="On first use, AgentX provisions a persistent workspace under WORKSPACE_ROOT with its own folders and a lazily-created Python venv. run_python and run_shell execute inside that root — and is_path_within_sandbox() refuses anything that tries to climb out."
            />

            <Reveal delay={80}>
                <div className="mt-10 flex flex-col md:flex-row items-stretch gap-4">
                    <WorkspaceCell user="user_a1f" active />

                    {/* isolation divider */}
                    <div className="flex md:flex-col items-center justify-center gap-3 py-2 md:py-0 md:px-1">
                        <div className="hidden md:block flex-1 w-px" style={{ background: 'linear-gradient(var(--arch-line), transparent)' }} />
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--arch-line-strong)', background: 'var(--arch-bg-raised)', color: 'var(--arch-text-dim)' }}>
                            <IconLock width={16} height={16} />
                        </div>
                        <div className="hidden md:block flex-1 w-px" style={{ background: 'linear-gradient(transparent, var(--arch-line))' }} />
                        <div className="md:hidden flex-1 h-px" style={{ background: 'var(--arch-line)' }} />
                    </div>

                    <WorkspaceCell user="user_9c3" />
                </div>
            </Reveal>

            <div className="mt-5 flex flex-wrap gap-2">
                <Tag>isolated pip installs</Tag>
                <Tag>path-escape guarded</Tag>
                <Tag>persistent between sessions</Tag>
                <Tag tone="accent">idle workspaces reaped in background</Tag>
            </div>
        </Section>
    );
}
