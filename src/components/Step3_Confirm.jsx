
import React from 'react';

const Step3Confirm = ({ formData, onSubmit, onBack, isLoading }) => {
    // Lấy đầy đủ thông tin từ formData
    const { name, user_code, email, role, capturedImage } = formData;

    return (
        <div className="step-container confirm-container">
            <h2>Bước 3: Xác nhận thông tin</h2>
            <div className="confirm-details">
                <img src={capturedImage} alt="Ảnh chân dung" width={240} style={{ borderRadius: '8px' }} />
                <div className="info-text">
                    <p><strong>Họ và tên:</strong> {name}</p>
                    <p><strong>Mã số:</strong> {user_code}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Vai trò:</strong> {role}</p>
                </div>
            </div>
            <div className="button-group-image">
                <button onClick={onBack} disabled={isLoading}>Chụp lại</button>

                <button onClick={onSubmit} className="primary" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Hoàn thành'}
                </button>
            </div>
        </div>
    );
};

export default Step3Confirm;