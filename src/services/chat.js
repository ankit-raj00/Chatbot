import api from './api';
import { API_BASE_URL } from '../config';

export const chatService = {
    async sendMessage(message, conversationId = null, mcpServerUrl = null) {
        const response = await api.post('/chat', {
            message,
            conversation_id: conversationId,
            mcp_server_url: mcpServerUrl,
        });
        return response.data;
    },

    async sendMessageStream(message, conversationId = null, mcpServerUrls = [], model = "gemini-2.5-flash", enabledTools = [], onChunk) {
        const response = await fetch(`${API_BASE_URL}/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                message,
                conversation_id: conversationId,
                mcp_server_urls: mcpServerUrls,
                model: model,
                enabled_tools: enabledTools
            }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        let finalConversationId = conversationId;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    if (data.chunk) {
                        fullResponse += data.chunk;
                        onChunk({ type: 'text', content: data.chunk });
                    }
                    if (data.tool_call) {
                        onChunk({ type: 'tool_call', data: data.tool_call });
                    }
                    if (data.tool_output) {
                        onChunk({ type: 'tool_output', data: data.tool_output });
                    }

                    if (data.done) {
                        finalConversationId = data.conversation_id;
                    }
                }
            }
        }

        return {
            response: fullResponse,
            conversation_id: finalConversationId,
        };
    },

    async sendMessageStreamMultimodal(message, conversationId = null, mcpServerUrls = [], model = 'gemini-2.5-flash', images = [], enabledTools = [], onChunk) {
        const formData = new FormData();
        formData.append('message', message);
        if (conversationId) formData.append('conversation_id', conversationId);
        if (mcpServerUrls && mcpServerUrls.length > 0) {
            formData.append('mcp_server_urls', JSON.stringify(mcpServerUrls));
        }
        formData.append('model', model);
        if (enabledTools && enabledTools.length > 0) {
            formData.append('enabled_tools', JSON.stringify(enabledTools));
        }

        images.forEach((image) => {
            formData.append('images', image);
        });

        const response = await fetch(`${API_BASE_URL}/chat/stream/multimodal`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        let finalConversationId = conversationId;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    if (data.chunk) {
                        fullResponse += data.chunk;
                        onChunk({ type: 'text', content: data.chunk });
                    }
                    if (data.tool_call) {
                        onChunk({ type: 'tool_call', data: data.tool_call });
                    }
                    if (data.tool_output) {
                        onChunk({ type: 'tool_output', data: data.tool_output });
                    }

                    if (data.done) {
                        finalConversationId = data.conversation_id;
                    }
                }
            }
        }

        return {
            response: fullResponse,
            conversation_id: finalConversationId,
        };
    },

    async getConversations() {
        const response = await api.get('/conversations');
        return response.data;
    },

    async getMessages(conversationId) {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        return response.data;
    },

    async deleteConversation(conversationId) {
        const response = await api.delete(`/conversations/${conversationId}`);
        return response.data;
    },
};
