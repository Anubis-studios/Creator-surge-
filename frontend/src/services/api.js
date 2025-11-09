import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

export const conversationAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE}/conversations`);
    return response.data;
  },
  
  getMessages: async (id) => {
    const response = await axios.get(`${API_BASE}/conversations/${id}/messages`);
    return response.data;
  },
  
  create: async (title) => {
    const response = await axios.post(`${API_BASE}/conversations`, { title });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_BASE}/conversations/${id}`);
    return response.data;
  }
};

export const chatAPI = {
  sendMessage: async (conversationId, message, agentType = null) => {
    const response = await axios.post(`${API_BASE}/chat`, { 
      conversationId, 
      message,
      agentType 
    });
    return response.data;
  }
};
