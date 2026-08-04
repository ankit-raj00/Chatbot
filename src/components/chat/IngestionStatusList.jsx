import { useState, useEffect, useRef } from 'react';
import { ragService } from '../../services/rag';

const POLL_MS = 2000;
// How long a finished (complete/failed) job keeps showing before it's
// dropped from the list — long enough to actually read it, short enough
// that the sidebar doesn't accumulate stale history.
const COMPLETE_LINGER_MS = 8000;
const FAILED_LINGER_MS = 20000;

const STATUS_META = {
    queued: { label: 'Queued' },
    parsing: { label: 'Processing' },
    embedding: { label: 'Processing' },
    complete: { label: 'Indexed' },
    failed: { label: 'Failed' },
};

const Spinner = () => (
    <svg className="w-3.5 h-3.5 flex-none animate-spin" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const StatusIcon = ({ status }) => {
    if (status === 'complete') {
        return (
            <svg className="w-3.5 h-3.5 flex-none" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        );
    }
    if (status === 'failed') {
        return (
            <svg className="w-3.5 h-3.5 flex-none" style={{ color: 'var(--danger, #ef4444)' }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 004.18 21h15.64a2 2 0 001.87-3.86l-8.18-14.18a2 2 0 00-3.42 0z" />
            </svg>
        );
    }
    return <Spinner />;
};

// Persistent "what's happening with my uploads" status — polls for jobs
// regardless of whether the upload modal that started them is still open,
// and regardless of whether Agentic RAG is even toggled on (the file
// selector list below it only renders when RAG is on; this doesn't, since
// the whole point is you shouldn't need to guess whether an upload is still
// running just because you haven't turned RAG on yet).
export const IngestionStatusList = ({ onJobCompleted }) => {
    const [jobs, setJobs] = useState([]);
    const notifiedRef = useRef(new Set());

    useEffect(() => {
        let cancelled = false;
        let timer = null;

        const poll = async () => {
            try {
                const data = await ragService.listJobs();
                if (cancelled) return;
                const now = Date.now();
                const visible = (data.jobs || []).filter((job) => {
                    const updatedMs = job.updated_at ? new Date(job.updated_at).getTime() : now;
                    const age = now - updatedMs;
                    if (job.status === 'complete') return age < COMPLETE_LINGER_MS;
                    if (job.status === 'failed') return age < FAILED_LINGER_MS;
                    return true; // queued/parsing/embedding always shown
                });
                setJobs(visible);

                // Bump the file list exactly once per job that just finished,
                // so ContextFileSelector picks up the newly-indexed file
                // without the user having to do anything.
                for (const job of visible) {
                    if (job.status === 'complete' && !notifiedRef.current.has(job.job_id)) {
                        notifiedRef.current.add(job.job_id);
                        onJobCompleted?.();
                    }
                }
            } catch {
                // Transient poll failure — just try again next tick.
            }
            if (!cancelled) timer = setTimeout(poll, POLL_MS);
        };

        poll();
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [onJobCompleted]);

    if (jobs.length === 0) return null;

    return (
        <div className="flex flex-col gap-1.5 mb-2">
            {jobs.map((job) => {
                const meta = STATUS_META[job.status] || { label: job.status };
                return (
                    <div
                        key={job.job_id}
                        className="flex items-start gap-2 rounded-[10px] border px-2.5 py-2 text-[11.5px]"
                        style={{
                            backgroundColor: 'var(--surface-2)',
                            borderColor: 'var(--border-color)',
                        }}
                    >
                        <StatusIcon status={job.status} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }} title={job.filename}>
                                    {job.filename}
                                </span>
                                <span className="flex-none" style={{ color: 'var(--text-tertiary)' }}>· {meta.label}</span>
                            </div>
                            <p className="mt-0.5 leading-snug" style={{ color: job.status === 'failed' ? 'var(--danger, #ef4444)' : 'var(--text-tertiary)' }}>
                                {job.status === 'failed'
                                    ? (job.error || job.progress_message || 'Ingestion failed')
                                    : job.status === 'complete'
                                        ? `Indexed${typeof job.chunks_count === 'number' ? ` — ${job.chunks_count} chunk${job.chunks_count === 1 ? '' : 's'}` : ''}`
                                        : (job.progress_message || 'Working…')}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
