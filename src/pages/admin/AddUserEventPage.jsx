

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import './AddUserEventPage.css';
import { toast } from 'react-toastify';

const AddUserEventPage = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        company: '',
        role: '',
        email: '',
        image: null,
        existingImage: null
    });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const cacheBuster = `?_t=${new Date().getTime()}`;
            const res = await apiClient.get('/event-users' + cacheBuster);
            setUsers(res.data);
        } catch {
            setUsers([]);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {

            setFormData({
                name: user.name || '',
                position: user.position || '',
                company: user.company || '',
                role: user.role || '',
                email: user.email || '',
                image: null,
                existingImage: user.face_image_base_64 || null
            });
            setEditId(user.id || user._id);
        } else {
            setFormData({ name: '', position: '', company: '', role: '', email: '', image: null, existingImage: null });
            setEditId(null);
        }
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditId(null);
    };

    const handleChange = e => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('position', formData.position);
        data.append('company', formData.company);
        data.append('role', formData.role);
        data.append('email', formData.email);

        if (formData.image) {
            data.append('file', formData.image);
        }

        try {
            if (editId) {
                await apiClient.put(`/event-users/${editId}`, data);
                toast.success("Cập nhật người dùng thành công!");
            } else {
                if (!formData.image) {
                    setError("Vui lòng chọn ảnh khi thêm người dùng mới.");
                    return;
                }
                await apiClient.post('/event-users/add', data);
                toast.success("Thêm người dùng thành công!");
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Đã có lỗi xảy ra.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (userToDelete) => {
        const idToDelete = userToDelete.id || userToDelete._id;

        if (!idToDelete) {
            toast.error("Lỗi: Không tìm thấy ID của người dùng.");
            return;
        }

        if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
            return;
        }
        try {
            await apiClient.delete(`/event-users/${idToDelete}`);
            toast.success("Xóa người dùng thành công!");
            setUsers(currentUsers => currentUsers.filter(user => (user.id || user._id) !== idToDelete));
        } catch (err) {
            setError(err.response?.data?.detail || 'Không thể xóa người dùng này.');
            toast.error(errorMessage);
        }
    };

    return (
        <div className="add-user-event-container">
            <div className="sticky-header">
                <h2>Danh sách người tham dự sự kiện</h2>
                <div className="table-header-action">
                    <button className="add-btn square-red" onClick={() => handleOpenModal()}>+</button>
                </div>
            </div>
            <div className="table-wrapper">
                <table className="user-event-table">
                    <thead>
                        <tr><th>STT</th><th>Ảnh</th><th>Tên</th><th>Vai trò</th><th>Chức vụ</th><th>Công ty</th><th>Email</th><th>Ngày thêm</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={9}>Chưa có người tham dự nào.</td></tr>
                        ) : (
                            users.map((user, idx) => {
                                const itemId = user.id || user._id;
                                return (
                                    <tr key={itemId || idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            {user.face_image_base_64 ? (
                                                <img src={`data:image/jpeg;base64,${user.face_image_base_64}`} alt={user.name} width={48} height={48} style={{ borderRadius: '50%' }} />
                                            ) : (
                                                <div className="table-avatar-placeholder">?</div>
                                            )}
                                        </td>
                                        <td>{user.name}</td><td>{user.role}</td><td>{user.position}</td><td>{user.company}</td><td>{user.email}</td>
                                        <td>{new Date(user.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                        <td>
                                            <button className="action-btn edit" onClick={() => handleOpenModal(user)}>Sửa</button>
                                            <button className="action-btn delete" onClick={() => handleDelete(user)}>Xóa</button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editId ? "Sửa người tham dự" : "Thêm người tham dự"}</h3>
                        <form onSubmit={handleSubmit} className="add-user-event-form" encType="multipart/form-data">
                            {editId && formData.existingImage && (
                                <div className="existing-image-preview">
                                    <p>Ảnh hiện tại:</p>
                                    <img src={`data:image/jpeg;base64,${formData.existingImage}`} alt="Ảnh hiện tại" width="100" />
                                </div>
                            )}

                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" required />
                            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Vai trò" required />
                            <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Chức vụ" required />
                            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Công ty" required />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                            <label style={{ marginTop: "10px", textAlign: "left", width: "100%" }}>
                                {editId ? "Tải ảnh mới (nếu muốn thay đổi):" : "Tải ảnh chân dung (bắt buộc):"}
                            </label>
                            <input type="file" name="image" accept="image/*" onChange={handleChange} />
                            {error && <div className="error-message">{error}</div>}
                            <div className="button-group">
                                <button type="button" onClick={handleCloseModal}>Hủy</button>
                                <button type="submit" className="primary">{editId ? "Cập nhật" : "Lưu"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddUserEventPage;