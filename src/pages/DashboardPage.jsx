import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const DashboardPage = () => {
    const [stats, setStats] = useState({ total_users: 0 });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await apiClient.get('/dashboard/stats');
                setStats(statsRes.data);
                const usersRes = await apiClient.get('/users');
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu dashboard:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <div className="stats-card">
                <h3>Tổng số người dùng</h3>
                <p className="stat-number">{stats.total_users}</p>
            </div>
            <h2>Danh sách người dùng đã đăng ký</h2>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Họ và tên</th>
                        <th>Mã số</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(([name, user_code], index) => (
                        <tr key={index}>
                            <td>{name}</td>
                            <td>{user_code}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardPage;