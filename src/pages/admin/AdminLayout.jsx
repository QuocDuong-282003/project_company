// src/pages/admin/AdminLayout.jsx (Đã cập nhật)

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import thư viện giải mã token

const AdminLayout = () => {
    const [adminName, setAdminName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('admin_access_token');
        if (token) {
            try {
                // Giải mã token để lấy thông tin payload
                const decodedToken = jwtDecode(token);
                // Lấy tên từ payload và set vào state
                setAdminName(decodedToken.name || 'Admin');
            } catch (error) {
                console.error("Failed to decode token:", error);
                // Nếu token lỗi, xử lý đăng xuất
                handleLogout();
            }
        } else {
            // Nếu không có token, chuyển về trang đăng nhập
            navigate('/system-admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_access_token');
        navigate('/system-admin/login');
    };

    return (
        <div className="admin-layout">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                {/* === THAY ĐỔI Ở ĐÂY === */}
                <div className="admin-header-actions">
                    {adminName && (
                        <span className="admin-welcome-message">
                            Chào mừng, <strong>{adminName}</strong>
                        </span>
                    )}
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </div>
                {/* === KẾT THÚC THAY ĐỔI === */}
            </header>
            <div className="admin-body">
                <nav className="admin-sidebar">
                    <NavLink to="/system-admin/dashboard/users" className="sidebar-link">
                        Quản lý User
                    </NavLink>
                    <NavLink to="/system-admin/dashboard/admins" className="sidebar-link">
                        Quản lý Admin
                    </NavLink>
                </nav>
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;