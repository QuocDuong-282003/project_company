import axios from 'axios';

const apiClient = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

apiClient.interceptors.request.use(
    config => {
        // Sửa lại điều kiện kiểm tra để bao gồm endpoint statistics
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

// Thêm response interceptor để xử lý lỗi 401
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && error.config.url.includes('/system-admin/')) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('admin_access_token');
            window.location.href = '/system-admin/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;