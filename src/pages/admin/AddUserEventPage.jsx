import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import './AddUserEventPage.css';

const AddUserEventPage = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        company: '',
        role: '',
        email: '',
        image: null
    });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await apiClient.get('/event-users');
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
                image: null
            });
            setEditId(user.id || user._id);
        } else {
            setFormData({ name: '', position: '', company: '', role: '', email: '', image: null });
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
        if (!formData.name || !formData.position || !formData.company || !formData.role) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        const data = new FormData();
        data.append('name', formData.name);
        data.append('position', formData.position);
        data.append('company', formData.company);
        data.append('role', formData.role);
        data.append('email', formData.email);
        if (formData.image) data.append('file', formData.image);

        try {
            if (editId) {
                //  API cập nhật 
                await apiClient.put(`/event-users/${editId}`, data);
            } else {
                await apiClient.post('/event-users/add', data);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Đã có lỗi xảy ra.');
        }
    };

    const handleDelete = async id => {
        //  API xóa 
        try {
            await apiClient.delete(`/event-users/${id}`);
            fetchUsers();
        } catch {
            setError('Không thể xóa!');
        }
    };

    return (
        <div className="add-user-event-container">
            <h2>Danh sách người tham dự sự kiện</h2>
            <div className="table-header-action">
                <button className="add-btn square-red" onClick={() => handleOpenModal()}>+</button>
            </div>
            <div className="table-wrapper">
                <table className="user-event-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ảnh</th>
                            <th>Tên</th>
                            <th>Vai trò</th>
                            <th>Chức vụ</th>
                            <th>Công ty</th>
                            <th>Email</th>
                            <th>Ngày thêm</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={9}>Chưa có người tham dự nào.</td></tr>
                        ) : (
                            users.map((user, idx) => (
                                <tr key={user.id || user._id || idx}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        {user.face_image_base64 ? (
                                            <img src={`data:image/jpeg;base64,${user.face_image_base64}`} alt={user.name} width={48} height={48} style={{ borderRadius: '50%' }} />
                                        ) : (
                                            <div className="table-avatar-placeholder">?</div>
                                        )}
                                    </td>
                                    <td>{user.name}</td>
                                    <td>{user.role}</td>
                                    <td>{user.position}</td>
                                    <td>{user.company}</td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleOpenModal(user)}>Sửa</button>
                                        <button className="action-btn delete" onClick={() => handleDelete(user.id || user._id)}>Xóa</button>                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editId ? "Sửa người tham dự" : "Thêm người tham dự"}</h3>
                        <form onSubmit={handleSubmit} className="add-user-event-form" encType="multipart/form-data">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" required />
                            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Vai trò" required />
                            <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Chức vụ" required />
                            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Công ty" required />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
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