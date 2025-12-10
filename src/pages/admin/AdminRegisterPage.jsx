
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import './AdminRegisterPage.css';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', user_code: '', email: '', role: 'super_admin', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isFirstAdmin, setIsFirstAdmin] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkFirstAdmin = async () => {
            try {
                const response = await apiClient.get('/system-admin/setup-status');

                if (response.data.super_admin_exists) {
                    setIsFirstAdmin(false);
                    setFormData((prev) => ({ ...prev, role: 'admin' }));
                } else {
                    setIsFirstAdmin(true);
                    setFormData((prev) => ({ ...prev, role: 'super_admin' }));
                }
            } catch (err) {
                console.error("Error checking setup status:", err);
                setIsFirstAdmin(true);
                setFormData((prev) => ({ ...prev, role: 'super_admin' }));
            }
        };
        checkFirstAdmin();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await apiClient.post('/system-admin/register', formData);
            setMessage(response.data.message + " Đang chuyển về trang Quản lý Admin...");
            setTimeout(() => {

                navigate('/system-admin/dashboard/admins');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Đã có lỗi xảy ra.');
        }
    };
    return (
        <div className="admin-register-container">
            <h2 className="admin-register-title">
                {isFirstAdmin ? "Tạo tài khoản Super Admin đầu tiên" : "Tạo tài khoản Admin"}
            </h2>
            <form className="admin-register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="text" name="name" placeholder="Họ và tên" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <input type="text" name="user_code" placeholder="Mã nhân viên (ví dụ: AD001)" value={formData.user_code} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    {isFirstAdmin ? (
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                        </select>
                    ) : (
                        <input
                            type="text"
                            name="role"
                            value="admin"
                            readOnly
                            disabled
                            style={{ background: "#f7fafd", color: "#888", fontWeight: 600 }}
                        />
                    )}
                </div>
                <div className="form-group">
                    <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
                </div>
                <button className="admin-register-btn" type="submit">Tạo tài khoản</button>
            </form>
            {message && <p className="admin-register-message success">{message}</p>}
            {error && <p className="admin-register-message error">{error}</p>}
            <Link className="admin-register-link" to="/system-admin/login">Đến trang đăng nhập</Link>
        </div>
    );
};

export default AdminRegisterPage;

