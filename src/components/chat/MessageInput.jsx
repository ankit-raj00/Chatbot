import { useState, useRef } from 'react';

export const MessageInput = ({
    onSendMessage,
    disabled,
    uploadedImages,
    onImagesChange,
    selectedModel,
    onModelChange
}) => {
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const isImage = file.type.startsWith('image/');
            const reader = new FileReader();
            
            reader.onloadend = () => {
                onImagesChange(prev => [...prev, {
                    file,
                    preview: isImage ? reader.result : null,
                    base64: reader.result.split(',')[1],
                    isImage,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
    };

    const removeImage = (index) => {
        onImagesChange(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-3xl mx-auto w-full">
            {/* Image Previews */}
            {uploadedImages.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                    {uploadedImages.map((img, index) => (
                        <div key={index} className="relative flex items-center gap-2 p-1 rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            {img.isImage ? (
                                <img
                                    src={img.preview}
                                    alt="Upload preview"
                                    className="w-12 h-12 object-cover rounded-md"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center rounded-md" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                    <svg className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            {!img.isImage && (
                                <span className="text-xs max-w-[100px] truncate pr-2 text-white" title={img.name}>
                                    {img.name}
                                </span>
                            )}
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                style={{ backgroundColor: 'var(--text-secondary)' }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Container */}
            <form onSubmit={handleSubmit}>
                <div
                    className="flex items-end gap-2 p-3 rounded-2xl border"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    {/* Attach Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.txt,.md,.json,.csv,.xlsx,.xls,.doc,.docx"
                        multiple
                        className="hidden"
                    />

                    {/* Text Input */}
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message AgentX..."
                        disabled={disabled}
                        rows={1}
                        className="flex-1 resize-none outline-none text-sm py-2 max-h-32"
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)'
                        }}
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={disabled || !message.trim()}
                        className="p-2 rounded-lg transition-colors disabled:opacity-40"
                        style={{
                            backgroundColor: message.trim() ? 'var(--accent)' : 'transparent',
                            color: message.trim() ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};
