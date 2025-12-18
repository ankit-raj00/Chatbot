
import { useState, useRef, useEffect } from 'react';

export const MessageInput = ({
    onSendMessage,
    disabled,
    selectedModel,
    onModelChange,
    uploadedImages = [],
    onImagesChange
}) => {
    const [message, setMessage] = useState('');
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((message.trim() || uploadedImages.length > 0) && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const allowedFiles = files.filter(file =>
            file.type.startsWith('image/') || file.type === 'application/pdf'
        );
        onImagesChange([...uploadedImages, ...allowedFiles]);
    };

    const removeImage = (index) => {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const models = [
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
        { id: 'gemini-flash-latest', name: 'Gemini Flash (Latest)' }
    ];

    const currentModelName = models.find(m => m.id === selectedModel)?.name || selectedModel;

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsModelMenuOpen(false);
            }
        };

        if (isModelMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModelMenuOpen]);

    return (
        <div className="w-full relative">
            {/* Image Previews */}
            {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 px-2">
                    {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group">
                            <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center backdrop-blur-md">
                                {file.type === 'application/pdf' ? (
                                    <span className="text-xs text-center p-1 break-all text-slate-300">{file.name}</span>
                                ) : (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs backdrop-blur-sm shadow-lg transform scale-90 group-hover:scale-100"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 items-end bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg relative z-20">
                {/* File Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex-shrink-0"
                    title="Attach files"
                    disabled={disabled}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Custom Model Selector */}
                <div ref={dropdownRef} className="relative flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        disabled={disabled}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-sm font-medium min-w-[140px] justify-between
                            ${isModelMenuOpen
                                ? 'bg-white/10 border-primary/50 text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span className="truncate max-w-[120px]">{currentModelName}</span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180 text-primary-400' : 'text-slate-500'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isModelMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-56 p-1 bg-[#1a1a1c]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl animate-scale-in origin-bottom-left z-50 overflow-hidden">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5 mb-1">
                                Select Model
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {models.map((model) => (
                                    <button
                                        key={model.id}
                                        type="button"
                                        onClick={() => {
                                            onModelChange(model.id);
                                            setIsModelMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between group transition-all
                                            ${selectedModel === model.id
                                                ? 'bg-primary-500/20 text-white'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <span>{model.name}</span>
                                        {selectedModel === model.id && (
                                            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Text Input */}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask AgentX..."
                    className="flex-1 w-full bg-transparent border-0 text-white placeholder-slate-500 focus:ring-0 px-2 py-3 min-w-0"
                    disabled={disabled}
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={disabled || (!message.trim() && uploadedImages.length === 0)}
                    className="p-3 bg-aurora-gradient text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};
