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
        const validImages = files.filter(file => file.type.startsWith('image/'));

        validImages.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImagesChange(prev => [...prev, {
                    file,
                    preview: reader.result,
                    base64: reader.result.split(',')[1]
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
                        <div key={index} className="relative">
                            <img
                                src={img.preview}
                                alt="Upload preview"
                                className="w-16 h-16 object-cover rounded-lg border"
                                style={{ borderColor: 'var(--border-color)' }}
                            />
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
                        accept="image/*"
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
