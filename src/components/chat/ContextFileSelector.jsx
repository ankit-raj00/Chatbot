import React, { useState, useEffect } from 'react';
import { ragService } from '../../services/rag';

/**
 * ContextFileSelector
 * Displays uploaded files as checkboxes.
 * Backend now returns: [{ file_id: "uuid", filename: "report.pdf" }]
 * - Shows: filename  (human-readable)
 * - Selects by: file_id (UUID for Qdrant filter)
 */
export const ContextFileSelector = ({ onSelectionChange, disabled = false }) => {
    const [files, setFiles] = useState([]);       // [{ file_id, filename }]
    const [selected, setSelected] = useState([]); // [file_id, ...]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ragService.listFiles();
            // Backend returns { files: [{ file_id, filename }, ...] }
            const sorted = (data.files || []).sort((a, b) =>
                (a.filename || '').localeCompare(b.filename || '')
            );
            setFiles(sorted);
        } catch (err) {
            console.error("Failed to load context files:", err);
            setError("Failed to load files.");
        } finally {
            setLoading(false);
        }
    };

    const toggleFile = (fileId) => {
        if (disabled) return;
        const newSelection = selected.includes(fileId)
            ? selected.filter(id => id !== fileId)
            : [...selected, fileId];
        setSelected(newSelection);
        onSelectionChange(newSelection); // passes UUIDs to parent → sent as selected_file_ids
    };

    const selectAll = () => {
        if (disabled) return;
        if (selected.length === files.length) {
            setSelected([]);
            onSelectionChange([]);
        } else {
            const allIds = files.map(f => f.file_id);
            setSelected(allIds);
            onSelectionChange(allIds);
        }
    };

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
                        key={file.file_id}
                        className={`
                            flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)]'}
                        `}
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(file.file_id)}
                            onChange={() => toggleFile(file.file_id)}
                            disabled={disabled}
                            className="w-4 h-4 rounded border-gray-600 text-[var(--accent)] focus:ring-[var(--accent)] bg-transparent"
                        />
                        <span
                            className="truncate"
                            style={{ color: 'var(--text-primary)' }}
                            title={`${file.filename} (${file.file_id})`}
                        >
                            {file.filename}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};
