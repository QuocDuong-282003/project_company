import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

import './AdminDashboardPage.css'
const EditUserForm = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        user_code: user.user_code,
        role: user.role,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.id, formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Chỉnh sửa thông tin</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" required />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                    <input type="text" name="user_code" value={formData.user_code} onChange={handleChange} placeholder="Mã số" required />
                    <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Vai trò" required />
                    <div className="button-group">
                        <button type="button" onClick={onCancel}>Hủy</button>
                        <button type="submit" className="primary">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Component con: Thanh phân trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    if (totalPages <= 1) {
        return null; // Không hiển thị nếu chỉ có 1 trang
    }

    return (
        <nav className="pagination-container">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                &laquo; Trước
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={currentPage === number ? 'active' : ''}
                >
                    {number}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Sau &raquo;
            </button>
        </nav>
    );
};


// Component chính: Trang Dashboard
const AdminDashboardPage = ({ view }) => {
    const [allData, setAllData] = useState([]); // State để lưu trữ TOÀN BỘ dữ liệu từ API
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // State cho trang hiện tại
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 15; // Cấu hình số lượng item mỗi trang

    // Lấy ID của admin đang đăng nhập từ token
    let currentAdminId = null;
    try {
        const token = localStorage.getItem('admin_access_token');
        if (token) {
            // Sử dụng jwt-decode để an toàn hơn, nhưng cách này vẫn hoạt động nếu token không hết hạn
            currentAdminId = JSON.parse(atob(token.split('.')[1])).sub;
        }
    } catch (e) {
        console.error("Invalid token format");
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const fetchData = useCallback(async () => {
        const endpoint = view === 'admins' ? '/system-admin/admins' : '/system-admin/users';
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_access_token');
            if (!token) {
                navigate('/system-admin/login');
                return;
            }
            const response = await apiClient.get(endpoint);
            setAllData(response.data); // Lưu toàn bộ dữ liệu vào allData
            setCurrentPage(1); // Reset về trang 1 mỗi khi fetch dữ liệu mới
        } catch (error) {
            console.error(`Failed to fetch ${view}:`, error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('admin_access_token');
                navigate('/system-admin/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, view]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Sử dụng useMemo để tính toán dữ liệu cho trang hiện tại
    // Chỉ tính toán lại khi allData hoặc currentPage thay đổi
    const { currentTableData, totalPages } = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;

        const dataForPage = allData.slice(firstPageIndex, lastPageIndex);
        const pages = Math.ceil(allData.length / ITEMS_PER_PAGE);

        return { currentTableData: dataForPage, totalPages: pages };
    }, [allData, currentPage]);

    const handleDelete = async (userId, userName) => {
        if (window.confirm(`Bạn có chắc muốn xóa tài khoản "${userName}" không?`)) {
            try {
                await apiClient.delete(`/system-admin/users/${userId}`);
                alert("Xóa thành công!");
                fetchData(); // Tải lại toàn bộ dữ liệu
            } catch (error) {
                alert("Xóa thất bại: " + (error.response?.data?.detail || "Lỗi không xác định"));
            }
        }
    };

    const handleSaveEdit = async (userId, updateData) => {
        try {
            await apiClient.put(`/system-admin/users/${userId}`, updateData);
            alert("Cập nhật thành công!");
            setEditingUser(null);
            fetchData(); // Tải lại toàn bộ dữ liệu
        } catch (error) {
            alert("Cập nhật thất bại: " + (error.response?.data?.detail || "Lỗi không xác định"));
        }
    };

    const pageTitle = view === 'admins' ? 'Quản lý tài khoản Admin' : 'Quản lý tài khoản User';

    if (loading) return <div className="loading-message"><h2>Đang tải dữ liệu...</h2></div>;

    return (
        <div className="dashboard-page-container">
            {editingUser && (
                <EditUserForm user={editingUser} onSave={handleSaveEdit} onCancel={() => setEditingUser(null)} />
            )}
            <h2>{pageTitle}</h2>
            {allData.length > 0 ? (
                <>
                    <div className="table-wrapper">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ảnh</th>
                                    <th>Tên & Mã số</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Ngày tạo</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTableData.map((item, index) => {
                                    // Tính toán STT đúng cho mỗi trang
                                    const overallIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                                    return (
                                        <tr key={item.id}>
                                            <td>{overallIndex}</td>
                                            <td>
                                                {item.face_image_base64 ? (
                                                    <img src={`data:image/jpeg;base64,${item.face_image_base64}`} alt={item.name} width="50" height="50" className="table-avatar" />
                                                ) : (
                                                    <div className="table-avatar-placeholder">{item.role}</div>
                                                )}
                                            </td>
                                            <td>{item.name}<br /><small>{item.user_code}</small></td>
                                            <td>{item.email}</td>
                                            <td>{item.role}</td>
                                            <td>{formatDate(item.created_at)}</td>
                                            <td>
                                                {/* Chỉ hiển thị nút Sửa cho trang Quản lý User */}
                                                {view === 'users' && (
                                                    <button onClick={() => setEditingUser(item)} className="edit-btn">Sửa</button>
                                                )}
                                                {/* Không cho phép admin tự xóa tài khoản của mình */}
                                                {item.id !== currentAdminId && (
                                                    <button onClick={() => handleDelete(item.id, item.name)} className="delete-btn">Xóa</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={page => setCurrentPage(page)}
                    />
                </>
            ) : (
                <div className="no-users-message">
                    <p>Không có dữ liệu.</p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;