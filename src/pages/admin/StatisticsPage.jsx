import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import './StatisticsPage.css';

const StatisticsPage = () => {
    const [checkins, setCheckins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Đổi endpoint cho đúng backend
        apiClient.get('/event/checkins')
            .then(res => {
                setCheckins(res.data);
            })
            .catch(() => setCheckins([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="statistics-page-container">
            <h2>Thống kê điểm danh sự kiện</h2>
            {loading ? (
                <div>Đang tải dữ liệu...</div>
            ) : (
                <div className="table-wrapper">
                    <table className="statistics-table">
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Tên</th>
                                <th>Chức vụ</th>
                                <th>Trạng thái</th>
                                <th>Thời gian check-in</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkins.length === 0 ? (
                                <tr><td colSpan={5}>Không có dữ liệu điểm danh.</td></tr>
                            ) : (
                                checkins.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.name} width={48} height={48} style={{ borderRadius: '50%' }} />
                                            ) : (
                                                <div className="table-avatar-placeholder">?</div>
                                            )}
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.position}</td>
                                        <td>{item.status === 'checked' ? 'Đã điểm danh' : 'Chưa điểm danh'}</td>
                                        <td>{item.checkin_time ? new Date(item.checkin_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StatisticsPage;
