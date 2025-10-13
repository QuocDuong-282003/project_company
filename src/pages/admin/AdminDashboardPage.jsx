

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import apiClient from '../../api/apiClient';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';

// import './AdminDashboardPage.css';

// const EditUserForm = ({ user, onSave, onCancel }) => {
//     const [formData, setFormData] = useState({
//         name: user.name,
//         email: user.email,
//         user_code: user.user_code,
//         role: user.role,
//     });
//     const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
//     const handleSubmit = (e) => { e.preventDefault(); onSave(user.id || user._id, formData); }; // <-- Sửa nhỏ ở đây
//     return (
//         <div className="modal-overlay">
//             <div className="modal-content">
//                 <h2>Chỉnh sửa thông tin</h2>
//                 <form onSubmit={handleSubmit}>
//                     <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" required />
//                     <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
//                     <input type="text" name="user_code" value={formData.user_code} onChange={handleChange} placeholder="Mã số" required />
//                     <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Vai trò" required />
//                     <div className="button-group">
//                         <button type="button" onClick={onCancel}>Hủy</button>
//                         <button type="submit" className="primary">Lưu thay đổi</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//     const pageNumbers = [];
//     for (let i = 1; i <= totalPages; i++) { pageNumbers.push(i); }
//     if (totalPages <= 1) { return null; }
//     return (
//         <nav className="pagination-container">
//             <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Trước</button>
//             {pageNumbers.map(number => (
//                 <button key={number} onClick={() => onPageChange(number)} className={currentPage === number ? 'active' : ''}>{number}</button>
//             ))}
//             <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau &raquo;</button>
//         </nav>
//     );
// };

// const AdminDashboardPage = ({ view }) => {
//     const [allData, setAllData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [editingUser, setEditingUser] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const navigate = useNavigate();

//     const ITEMS_PER_PAGE = 15;
//     const [currentAdminId, setCurrentAdminId] = useState(null);

//     useEffect(() => {
//         try {
//             const token = localStorage.getItem('admin_access_token');
//             if (token) {
//                 const decodedToken = jwtDecode(token);
//                 setCurrentAdminId(decodedToken.sub);
//             }
//         } catch (e) {
//             console.error("Invalid token format:", e);
//         }
//     }, []);

//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         return `${date.toLocaleTimeString('vi-VN')} ${date.toLocaleDateString('vi-VN')}`;
//     };

//     const fetchData = useCallback(async () => {
//         const endpoint = view === 'admins' ? '/system-admin/admins' : '/system-admin/users';
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('admin_access_token');
//             if (!token) { navigate('/system-admin/login'); return; }
//             const cacheBuster = `?_t=${new Date().getTime()}`;
//             const response = await apiClient.get(endpoint + cacheBuster);
//             setAllData(response.data);
//             setCurrentPage(1);
//         } catch (error) {
//             console.error(`Failed to fetch ${view}:`, error);
//             if (error.response && error.response.status === 401) {
//                 localStorage.removeItem('admin_access_token');
//                 navigate('/system-admin/login');
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [navigate, view]);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     const { currentTableData, totalPages } = useMemo(() => {
//         const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//         const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
//         const dataForPage = allData.slice(firstPageIndex, lastPageIndex);
//         const pages = Math.ceil(allData.length / ITEMS_PER_PAGE);
//         return { currentTableData: dataForPage, totalPages: pages };
//     }, [allData, currentPage]);

//     const handleDelete = async (userToDelete) => {
//         const userId = userToDelete.id || userToDelete._id; // <-- SỬA CHÍNH Ở ĐÂY
//         const userName = userToDelete.name;

//         if (!userId) {
//             alert("Lỗi: Không tìm thấy ID của người dùng.");
//             return;
//         }

//         if (window.confirm(`Bạn có chắc muốn xóa tài khoản "${userName}" không?`)) {
//             try {
//                 const deleteEndpoint = view === 'admins'
//                     ? `/system-admin/admins/${userId}`
//                     : `/system-admin/users/${userId}`;
//                 await apiClient.delete(deleteEndpoint);
//                 alert("Xóa thành công!");
//                 setAllData(currentData => currentData.filter(item => (item.id || item._id) !== userId));
//             } catch (error) {
//                 alert("Xóa thất bại: " + (error.response?.data?.detail || "Lỗi không xác định"));
//             }
//         }
//     };

//     const handleSaveEdit = async (userId, updateData) => {
//         try {
//             const updateEndpoint = view === 'admins'
//                 ? `/system-admin/admins/${userId}`
//                 : `/system-admin/users/${userId}`;
//             const response = await apiClient.put(updateEndpoint, updateData);
//             alert("Cập nhật thành công!");
//             setEditingUser(null);
//             setAllData(currentData => currentData.map(item => ((item.id || item._id) === userId ? response.data : item)));
//         } catch (error) {
//             alert("Cập nhật thất bại: " + (error.response?.data?.detail || "Lỗi không xác định"));
//         }
//     };

//     const pageTitle = view === 'admins' ? 'Quản lý tài khoản Admin' : 'Quản lý tài khoản User';

//     if (loading) return <div className="loading-message"><h2>Đang tải dữ liệu...</h2></div>;

//     return (
//         <div className="dashboard-page-container">
//             {editingUser && (
//                 <EditUserForm user={editingUser} onSave={handleSaveEdit} onCancel={() => setEditingUser(null)} />
//             )}
//             <h2 style={{ textAlign: 'center', marginBottom: '24px', fontWeight: 700 }}>{pageTitle}</h2>
//             {allData.length > 0 ? (
//                 <>
//                     <div className="table-wrapper wide-table">
//                         <table className="user-table">
//                             <thead>
//                                 <tr>
//                                     <th>STT</th>
//                                     <th>Ảnh</th>
//                                     <th>Tên & Mã số</th>
//                                     <th>Email</th>
//                                     <th>Vai trò</th>
//                                     <th>Ngày tạo</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {currentTableData.map((item, index) => {
//                                     const overallIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
//                                     const itemId = item.id || item._id; // <-- SỬA CHÍNH Ở ĐÂY
//                                     return (
//                                         <tr key={itemId}>
//                                             <td>{overallIndex}</td>
//                                             <td>
//                                                 {item.face_image_base64 ? (
//                                                     <img src={`data:image/jpeg;base64,${item.face_image_base64}`} alt={item.name} width="50" height="50" className="table-avatar" />
//                                                 ) : (
//                                                     <div className="table-avatar-placeholder">{item.role === 'super_admin' ? 'SA' : (view === 'admins' ? 'AD' : item.role.charAt(0).toUpperCase())}</div>
//                                                 )}
//                                             </td>
//                                             <td>{item.name}<br /><small>{item.user_code}</small></td>
//                                             <td>{item.email}</td>
//                                             <td>{item.role}</td>
//                                             <td>{formatDate(item.created_at)}</td>
//                                             <td>
//                                                 <button onClick={() => setEditingUser(item)} className="edit-btn">Sửa</button>
//                                                 {itemId !== currentAdminId && (
//                                                     <button onClick={() => handleDelete(item)} className="delete-btn">Xóa</button> // <-- SỬA CHÍNH Ở ĐÂY
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                     <Pagination
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         onPageChange={page => setCurrentPage(page)}
//                     />
//                 </>
//             ) : (
//                 <div className="no-users-message">
//                     <p>Không có dữ liệu.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AdminDashboardPage;




import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import './AdminDashboardPage.css';
import { toast } from 'react-toastify';


const EditUserForm = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        user_code: user.user_code,
        role: user.role,
    });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(user.id || user._id, formData); };
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) { pageNumbers.push(i); }
    if (totalPages <= 1) { return null; }
    return (
        <nav className="pagination-container">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Trước</button>
            {pageNumbers.map(number => (
                <button key={number} onClick={() => onPageChange(number)} className={currentPage === number ? 'active' : ''}>{number}</button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau &raquo;</button>
        </nav>
    );
};

const AdminDashboardPage = ({ view }) => {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 15;
    const [currentAdminId, setCurrentAdminId] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('admin_access_token');
            if (token) {
                const decodedToken = jwtDecode(token);
                setCurrentAdminId(decodedToken.sub);
            }
        } catch (e) {
            console.error("Invalid token format:", e);
        }
    }, []);

    // const formatDate = (dateString) => {
    //     if (!dateString) return '';
    //     const date = new Date(dateString);
    //     return `${date.toLocaleTimeString('vi-VN')} ${date.toLocaleDateString('vi-VN')}`;
    // };
    // const formatDate = (dateString) => {
    //     if (!dateString) return '';

    //     const date = new Date(dateString);

    //     // Kiểm tra xem date có hợp lệ không
    //     if (isNaN(date.getTime())) {
    //         return 'Ngày không hợp lệ';
    //     }

    //     const options = {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         day: '2-digit',
    //         month: '2-digit',
    //         year: 'numeric',

    //         timeZone: 'Asia/Ho_Chi_Minh'
    //     };


    //     return new Intl.DateTimeFormat('vi-VN', options).format(date).replace(',', '');
    // };
    // Dùng hàm này trong các file .jsx
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        } catch (e) {
            return "Ngày không hợp lệ";
        }
    };
    const fetchData = useCallback(async () => {
        const endpoint = view === 'admins' ? '/system-admin/admins' : '/system-admin/users';
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_access_token');
            if (!token) { navigate('/system-admin/login'); return; }
            const cacheBuster = `?_t=${new Date().getTime()}`;
            const response = await apiClient.get(endpoint + cacheBuster);
            setAllData(response.data);
            setCurrentPage(1); // Reset về trang 1 mỗi khi fetch dữ liệu mới
        } catch (error) {
            console.error(`Failed to fetch ${view}:`, error);
            if (error.response?.status === 401) {
                localStorage.removeItem('admin_access_token');
                navigate('/system-admin/login');
            } else {
                // Xóa dữ liệu cũ nếu fetch thất bại để tránh hiển thị sai
                setAllData([]);
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, view]);

    useEffect(() => {
        console.log(`Fetching data for view: ${view}`);
        fetchData();
    }, [fetchData, view]);

    const { currentTableData, totalPages } = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
        const dataForPage = allData.slice(firstPageIndex, lastPageIndex);
        const pages = Math.ceil(allData.length / ITEMS_PER_PAGE);
        return { currentTableData: dataForPage, totalPages: pages };
    }, [allData, currentPage]);

    const handleDelete = async (userToDelete) => {
        const userId = userToDelete.id || userToDelete._id;
        const userName = userToDelete.name;

        if (!userId) {
            //   alert("Lỗi: Không tìm thấy ID của người dùng.");
            toast.error('Lỗi không tìm thấy ID của người dùng ! ');
            return;
        }

        if (window.confirm(`Bạn có chắc muốn xóa tài khoản "${userName}" không?`)) {
            try {
                const deleteEndpoint = view === 'admins'
                    ? `/system-admin/admins/${userId}`
                    : `/system-admin/users/${userId}`;
                await apiClient.delete(deleteEndpoint);
                toast.success("Xóa thành công!");
                setAllData(currentData => currentData.filter(item => (item.id || item._id) !== userId));
            } catch (error) {
                const errorMessage = error.response?.data?.detail || "Lỗi không xác định";

                toast.error(`Xóa thất bại: ${errorMessage}`);
            }
        }
    };

    const handleSaveEdit = async (userId, updateData) => {
        try {
            const updateEndpoint = view === 'admins'
                ? `/system-admin/admins/${userId}`
                : `/system-admin/users/${userId}`;
            const response = await apiClient.put(updateEndpoint, updateData);
            toast.success("Cập nhật thành công!");
            setEditingUser(null);
            setAllData(currentData => currentData.map(item => ((item.id || item._id) === userId ? response.data : item)));
        } catch (error) {
            const errorMessage = error.response?.data?.detail || "Lỗi không xác định";
            toast.error(`Cập nhật thất bại: ${errorMessage}`); // <-- 2. THAY THẾ ALERT
        }
    };

    const pageTitle = view === 'admins' ? 'Quản lý tài khoản Admin' : 'Quản lý tài khoản User';

    if (loading) return <div className="loading-message"><h2>Đang tải dữ liệu...</h2></div>;

    return (
        <div className="dashboard-page-container">
            {editingUser && (
                <EditUserForm user={editingUser} onSave={handleSaveEdit} onCancel={() => setEditingUser(null)} />
            )}
            <h2 style={{ textAlign: 'center', marginBottom: '24px', fontWeight: 700 }}>{pageTitle}</h2>
            {allData.length > 0 ? (
                <>
                    <div className="table-wrapper wide-table">
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
                                    const overallIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                                    const itemId = item.id || item._id;
                                    const isSelf = itemId === currentAdminId; // Biến để kiểm tra có phải là chính mình không

                                    return (
                                        <tr key={itemId}>
                                            <td>{overallIndex}</td>
                                            <td>
                                                {item.face_image_base_64 ? (
                                                    <img src={`data:image/jpeg;base64,${item.face_image_base_64}`} alt={item.name} width="50" height="50" className="table-avatar" />
                                                ) : (
                                                    <div className="table-avatar-placeholder">{item.role === 'super_admin' ? 'SA' : (view === 'admins' ? 'AD' : item.role.charAt(0).toUpperCase())}</div>
                                                )}
                                            </td>
                                            <td>{item.name}<br /><small>{item.user_code}</small></td>
                                            <td>{item.email}</td>
                                            <td>{item.role}</td>
                                            <td>{formatDate(item.created_at)}</td>
                                            <td>

                                                {view === 'admins' && !isSelf && (
                                                    <button onClick={() => setEditingUser(item)} className="edit-btn">Sửa</button>
                                                )}

                                                {view === 'users' && (
                                                    <button onClick={() => setEditingUser(item)} className="edit-btn">Sửa</button>
                                                )}

                                                {!isSelf && (
                                                    <button onClick={() => handleDelete(item)} className="delete-btn">Xóa</button>
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