import { useState, useEffect } from 'react';
import api from '../../services/api';

export const ModelSelector = ({ selectedModel, onModelChange }) => {
    const [models, setModels] = useState([
        {
            id: 'gemini-2.5-pro',
            name: 'Gemini 2.5 Pro',
            description: 'Most capable, best for complex tasks'
        },
        {
            id: 'gemini-2.5-flash',
            name: 'Gemini 2.5 Flash',
            description: 'Fast and efficient'
        },
        {
            id: 'gemini-2.5-flash-lite',
            name: 'Gemini 2.5 Flash Lite',
            description: 'Lightweight and fast'
        },
        {
            id: 'gemini-flash-latest',
            name: 'Gemini Flash (Latest)',
            description: 'Latest features'
        }
    ]);

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
            </label>
            <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="input-field"
            >
                {models.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                    </option>
                ))}
            </select>
        </div>
    );
};
