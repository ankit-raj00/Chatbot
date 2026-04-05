import React, { useState, useEffect } from 'react';
import { ragService } from '../../services/rag';

export const ContextFileSelector = ({ onSelectionChange, disabled = false }) => {
    const [files, setFiles] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await ragService.listFiles();
            // Data format: { files: ["a.pdf", "b.pdf"] }
            // Sort them purely for aesthetics
            const sorted = (data.files || []).sort();
            setFiles(sorted);
        } catch (err) {
            console.error("Failed to load context files:", err);
            setError("Failed to load files.");
        } finally {
            setLoading(false);
        }
    };

    const toggleFile = (file) => {
        if (disabled) return;

        const newSelection = selected.includes(file)
            ? selected.filter(f => f !== file)
            : [...selected, file];

        setSelected(newSelection);
        onSelectionChange(newSelection);
    };

    const selectAll = () => {
        if (disabled) return;
        if (selected.length === files.length) {
            setSelected([]);
            onSelectionChange([]);
        } else {
            setSelected([...files]);
            onSelectionChange([...files]);
        }
    }

    if (loading) {
        return <div className="p-4 text-xs text-[var(--text-secondary)] animate-pulse">Loading files...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-xs text-red-400">
                {error}
                <button onClick={loadFiles} className="ml-2 underline">Retry</button>
            </div>
        );
    }

    if (files.length === 0) {
        return <div className="p-4 text-xs text-[var(--text-secondary)]">No files indexed yet.</div>;
    }

    return (
        <div className="flex flex-col border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="p-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Context Files ({selected.length})
                </span>
                <button
                    onClick={selectAll}
                    disabled={disabled}
                    className="text-xs hover:underline disabled:opacity-50"
                    style={{ color: 'var(--accent)' }}
                >
                    {selected.length === files.length ? 'None' : 'All'}
                </button>
            </div>

            <div className="max-h-48 overflow-y-auto px-2 pb-2 custom-scrollbar">
                {files.map((file) => (
                    <label
                        key={file}
                        className={`
                            flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)]'}
                        `}
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(file)}
                            onChange={() => toggleFile(file)}
                            disabled={disabled}
                            className="w-4 h-4 rounded border-gray-600 text-[var(--accent)] focus:ring-[var(--accent)] bg-transparent"
                        />
                        <span className="truncate" style={{ color: 'var(--text-primary)' }} title={file}>
                            {file}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};
