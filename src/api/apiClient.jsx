// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

apiClient.interceptors.request.use(
    config => {
        if (config.url.includes('/system-admin/')) {
            const token = localStorage.getItem('admin_access_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default apiClient;