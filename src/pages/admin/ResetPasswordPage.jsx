// src/pages/admin/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token không hợp lệ hoặc đã thiếu.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }
        setError('');
        setMessage('');

        try {
            const response = await apiClient.post('/system-admin/reset-password', { token, new_password: password }, {
                headers: { 'Content-Type': 'application/json' }
            });
            setMessage(response.data.message + " Bạn sẽ được chuyển hướng sau 3 giây.");
            setTimeout(() => navigate('/system-admin/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Token không hợp lệ hoặc đã hết hạn.');
        }
    };

    if (!token && !error) return <div>Đang kiểm tra token...</div>;

    return (
        <div className="page-container" style={{ maxWidth: '500px' }}>
            <h2>Đặt lại mật khẩu mới</h2>
            <form onSubmit={handleSubmit}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu mới" required />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu mới" required />
                <button type="submit" disabled={!token}>Đặt lại</button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};

export default ResetPasswordPage;