// src/pages/admin/AdminRegisterPage.jsx
import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { Link, useNavigate } from 'react-router-dom';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', user_code: '', email: '', role: 'Admin', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await apiClient.post('/system-admin/register', formData);
            setMessage(response.data.message + " Tự động chuyển đến trang đăng nhập sau 3 giây.");
            setTimeout(() => {
                navigate('/system-admin/login');
            }, 3000);
        } catch (err) {
            // SỬA ĐỔI: Hiển thị lỗi chi tiết từ server
            setError(err.response?.data?.detail || 'Đã có lỗi xảy ra.');
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '500px' }}>
            <h2>Tạo tài khoản Admin</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Họ và tên" value={formData.name} onChange={handleChange} required />
                <input type="text" name="user_code" placeholder="Mã nhân viên (ví dụ: AD001)" value={formData.user_code} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="text" name="role" placeholder="Vai trò" value={formData.role} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
                <button type="submit">Tạo tài khoản</button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            <Link to="/system-admin/login" style={{ marginTop: '20px', display: 'block' }}>Đến trang đăng nhập</Link>
        </div>
    );
};

export default AdminRegisterPage;