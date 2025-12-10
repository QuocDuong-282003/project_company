import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';
const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/system-admin/forgot-password', { email }, {
                headers: { 'Content-Type': 'application/json' }
            });
            setMessage('Đã gửi thành công! Vui lòng kiểm tra email');
        } catch (error) {
            setMessage('Đã có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    return (
        <div className="admin-forgot-container">
            <h2 className="admin-forgot-title">Quên mật khẩu</h2>
            <p style={{ textAlign: 'center', marginBottom: '16px' }}>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
            <form className="admin-forgot-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                </div>
                <button className="admin-forgot-btn" type="submit">Gửi liên kết</button>
            </form>
            {message && <p className="admin-forgot-message success" style={{ marginTop: '16px', color: 'green' }}>{message}</p>}
            <Link className="admin-forgot-link" to="/system-admin/login">Quay lại đăng nhập</Link>
        </div>
    );
};

export default ForgotPasswordPage;