// src/pages/admin/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/system-admin/forgot-password', { email }, {
                headers: { 'Content-Type': 'application/json' }
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Đã có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '500px' }}>
            <h2>Quên mật khẩu</h2>
            <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <button type="submit">Gửi liên kết</button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            <Link to="/system-admin/login" style={{ marginTop: '20px' }}>Quay lại đăng nhập</Link>
        </div>
    );
};

export default ForgotPasswordPage;