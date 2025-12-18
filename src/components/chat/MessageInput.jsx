import { useState, useRef } from 'react';

export const MessageInput = ({
    onSend,
    disabled,
    selectedModel,
    onModelChange,
    images = [],
    onImagesChange
}) => {
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((message.trim() || images.length > 0) && !disabled) {
            onSend(message);
            setMessage('');
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const allowedFiles = files.filter(file =>
            file.type.startsWith('image/') || file.type === 'application/pdf'
        );
        onImagesChange([...images, ...allowedFiles]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const models = [
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
        { id: 'gemini-flash-latest', name: 'Gemini Flash (Latest)' }
    ];

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            {/* Image Previews */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {images.map((file, index) => (
                        <div key={index} className="relative group">
                            <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                {file.type === 'application/pdf' ? (
                                    <span className="text-xs text-center p-1 break-all">{file.name}</span>
                                ) : (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                {/* File Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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

                {/* Model Selector (Compact) */}
                <div className="relative">
                    <select
                        value={selectedModel}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 pr-8 cursor-pointer max-w-[150px] truncate"
                        disabled={disabled}
                        title="Select Model"
                    >
                        {models.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>

                {/* Text Input */}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-field flex-1 !mb-0"
                    disabled={disabled}
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={disabled || (!message.trim() && images.length === 0)}
                    className="btn-primary px-6 py-2.5"
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};
