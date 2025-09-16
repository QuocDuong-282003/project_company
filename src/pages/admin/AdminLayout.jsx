
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
const AdminLayout = () => {
    const [adminName, setAdminName] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('admin_access_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                console.log('Decoded token:', decodedToken);
                console.log('Name from token:', decodedToken.name);
                setAdminName(decodedToken.name || 'Admin');
            } catch (error) {
                console.error("Failed to decode token:", error);
                handleLogout();
            }
        } else {
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
                <div className="admin-header-actions">
                    {adminName && (
                        <span className="admin-welcome-message">
                            Chào mừng, <strong>{adminName}</strong>
                        </span>
                    )}
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </div>
            </header>
            <div className="admin-body">
                <nav className="admin-sidebar">
                    <NavLink to="/system-admin/dashboard/statistics" className="sidebar-link">
                        Thống kê điểm danh
                    </NavLink>
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