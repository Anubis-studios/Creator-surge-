import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

export const projectsAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE}/projects`);
    return response.data;
  },
  
  getOne: async (id) => {
    const response = await axios.get(`${API_BASE}/projects/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axios.post(`${API_BASE}/projects`, data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axios.patch(`${API_BASE}/projects/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_BASE}/projects/${id}`);
    return response.data;
  }
};

export const chatsAPI = {
  getChats: async (projectId) => {
    const response = await axios.get(`${API_BASE}/projects/${projectId}/chats`);
    return response.data;
  },
  
  sendMessage: async (projectId, message) => {
    const response = await axios.post(`${API_BASE}/projects/${projectId}/chats`, {
      projectId,
      message
    });
    return response.data;
  }
};

export const deploymentsAPI = {
  getDeployments: async (projectId) => {
    const response = await axios.get(`${API_BASE}/projects/${projectId}/deployments`);
    return response.data;
  },
  
  deploy: async (projectId) => {
    const response = await axios.post(`${API_BASE}/projects/${projectId}/deploy`);
    return response.data;
  }
};

export const collaborationAPI = {
  getCollaborators: async (projectId) => {
    const response = await axios.get(`${API_BASE}/projects/${projectId}/collaborators`);
    return response.data;
  },
  
  addCollaborator: async (projectId, email, role) => {
    const response = await axios.post(`${API_BASE}/projects/${projectId}/collaborators`, {
      projectId,
      email,
      role
    });
    return response.data;
  },
  
  getActivities: async (projectId) => {
    const response = await axios.get(`${API_BASE}/projects/${projectId}/activities`);
    return response.data;
  },
  
  getComments: async (projectId) => {
    const response = await axios.get(`${API_BASE}/projects/${projectId}/comments`);
    return response.data;
  },
  
  addComment: async (projectId, content) => {
    const response = await axios.post(`${API_BASE}/projects/${projectId}/comments`, {
      projectId,
      content
    });
    return response.data;
  }
};
