import api from './api';

export const mcpServerService = {
    async getServers() {
        const response = await api.get('/api/v1/mcp-servers');
        return response.data;
    },

    async addServer(name, url, authType = 'none', oauthConfig = null) {
        const response = await api.post('/api/v1/mcp-servers', {
            name,
            url,
            auth_type: authType,
            oauth_config: oauthConfig
        });
        return response.data;
    },

    async updateServer(id, data) {
        const response = await api.put(`/api/v1/mcp-servers/${id}`, data);
        return response.data;
    },

    async deleteServer(id) {
        const response = await api.delete(`/api/v1/mcp-servers/${id}`);
        return response.data;
    },

    async testConnection(id) {
        const response = await api.post(`/api/v1/mcp-servers/${id}/test`);
        return response.data;
    },
};
