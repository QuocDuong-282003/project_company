import axios from 'axios';

const apiClient = axios.create({
    baseURL: "https://face.webie.com.vn/api", // hoặc https://face.webie.com.vn:8000 nếu muốn bypass proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        if (config.url.includes('/system-admin/')) {
            const token = localStorage.getItem('admin_access_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Gửi FormData (upload ảnh) → multipart
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        // Gửi URLSearchParams (login) → x-www-form-urlencoded
        else if (config.data instanceof URLSearchParams) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

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
