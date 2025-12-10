import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPasswordPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [emailForResend, setEmailForResend] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            window.history.replaceState({}, document.title, location.pathname);
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
            const detail = err.response?.data?.detail;
            if (detail && (detail.toLowerCase().includes('hết hạn') || detail.toLowerCase().includes('expired'))) {
                setError('Liên kết đã hết hạn. Vui lòng gửi lại email để đặt lại mật khẩu.');
                setShowResend(true);
            } else {
                setError(detail || 'Token không hợp lệ hoặc đã hết hạn.');
            }
        }
    };

    const handleResend = async () => {
        if (!emailForResend) {
            setMessage('Vui lòng nhập email để gửi lại.');
            return;
        }
        setMessage('');
        try {
            await apiClient.post('/system-admin/forgot-password', { email: emailForResend }, {
                headers: { 'Content-Type': 'application/json' }
            });
            setMessage('Đã gửi lại email đặt lại mật khẩu! Vui lòng kiểm tra email.');
            setShowResend(false);
        } catch {
            setMessage('Gửi lại email thất bại. Vui lòng thử lại.');
        }
    };

    if (!token && !error) return <div>Đang kiểm tra token...</div>;

    return (
        <div className="page-container-reset-password">
            <h2>Đặt lại mật khẩu mới</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-password-group">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mật khẩu mới"
                        required
                        className={showPassword ? 'show-password' : ''}
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
                <div className="input-password-group">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu mới"
                        required
                        className={showConfirmPassword ? 'show-password' : ''}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="toggle-password-btn"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <button type="submit" disabled={!token}>Đặt lại</button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {showResend && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <input
                        type="email"
                        value={emailForResend}
                        onChange={e => setEmailForResend(e.target.value)}
                        placeholder="Nhập email để gửi lại"
                        style={{ marginRight: '8px', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        required
                    />
                    <button type="button" onClick={handleResend} style={{ padding: '8px 16px', borderRadius: '6px', background: '#3182ce', color: '#fff', border: 'none', cursor: 'pointer' }}>Gửi lại email</button>
                </div>
            )}
        </div>
    );
};

export default ResetPasswordPage;