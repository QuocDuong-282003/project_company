// src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await apiClient.post('/system-admin/login-form', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('admin_access_token', response.data.access_token);
            navigate('/system-admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Đăng nhập thất bại.');
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '500px' }}>
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Đăng nhập</button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            <div style={{ marginTop: '20px' }}>
                <Link to="/system-admin/forgot-password">Quên mật khẩu?</Link> | <Link to="/system-admin/register">Đăng ký Admin</Link>
            </div>
        </div>
    );
};

export default AdminLoginPage;