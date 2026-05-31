import React, { useState, useEffect } from 'react';
import { ragService } from '../../services/rag';

export const DocumentUploadModal = ({ isOpen, onClose, onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setUploading(false);
            setStatus('');
            setProgress(0);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const pollJobStatus = async (jobId) => {
        try {
            const data = await ragService.pollIngestionJob(jobId);
            setStatus(data.status);

            if (data.status === 'completed' || data.status === 'complete') {
                setProgress(100);
                setTimeout(() => {
                    onUploadComplete();
                    onClose();
                }, 1000);
            } else if (data.status === 'failed') {
                setError(data.error || 'Ingestion failed');
                setUploading(false);
            } else if (data.status === 'processing' || data.status === 'embedding') {
                setProgress(prev => Math.min(prev + 10, 90)); // Fake progress up to 90%
                setTimeout(() => pollJobStatus(jobId), 2000); // Poll every 2 seconds
            } else {
                // 'pending' or 'queued'
                setTimeout(() => pollJobStatus(jobId), 2000);
            }
        } catch (err) {
            console.error('Polling error', err);
            setError('Failed to get status. Process might still be running.');
            setUploading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setUploading(true);
        setStatus('uploading');
        setProgress(10);
        setError(null);

        try {
            const data = await ragService.uploadFile(file);
            if (data.job_id) {
                setStatus('queued');
                setProgress(20);
                pollJobStatus(data.job_id);
            } else {
                // Synchronous processing fallback (if backend changes)
                setStatus('completed');
                setProgress(100);
                setTimeout(() => {
                    onUploadComplete();
                    onClose();
                }, 1000);
            }
        } catch (err) {
            setError('Failed to upload file. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Upload Knowledge Document</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    {!uploading ? (
                        <>
                            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('file-upload').click()}>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf,.txt,.md,.json,.csv"
                                />
                                <div className="text-4xl mb-4">📄</div>
                                <p className="text-gray-300 font-medium">
                                    {file ? file.name : "Click to select a file"}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Supports PDF, TXT, MD
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Upload
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center space-y-4">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            
                            <div>
                                <p className="text-white font-medium capitalize">{status}...</p>
                                <p className="text-sm text-gray-400 mt-1">This may take a minute for large files</p>
                            </div>

                            <div className="w-full bg-gray-700 rounded-full h-2 mt-4 overflow-hidden">
                                <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
