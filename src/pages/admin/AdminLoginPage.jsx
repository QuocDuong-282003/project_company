
import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('username', username);
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
        <div className='page-container-login'>
            <div className="admin-login-container">
                <h2 className="admin-login-title">Đăng nhập Admin</h2>
                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Tên đăng nhập hoặc Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="toggle-password-btn"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <button className="admin-login-btn" type="submit">Đăng nhập</button>
                </form>

                {error && <p className="admin-login-message error">{error}</p>}

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '1rem' }}>
                    <Link className="admin-login-link" to="/system-admin/forgot-password">Quên mật khẩu?</Link>
                    <span style={{ margin: '0 8px' }}></span>
                    <Link className="admin-login-link" to="/system-admin/register">Đăng ký Admin</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
