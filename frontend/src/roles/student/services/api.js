    import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const assignmentService = {
    getAssignmentById: (id) => api.get(`/assignments/${id}`),
    checkSubmission: (assignmentId) => api.get(`/submissions/check/${assignmentId}`)
};

export const submissionService = {
    submitOnline: (data) => api.post('/submissions/online', data)
};

export default api;