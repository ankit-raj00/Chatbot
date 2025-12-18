import api from './api';

export const mcpService = {
    async connectAndListTools(mcpServerUrl = null) {
        const response = await api.post('/mcp/connect', {
            mcp_server_url: mcpServerUrl,
        });
        return response.data;
    },
};
