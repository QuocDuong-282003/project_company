import React from 'react';

const Step3Confirm = ({ formData, onSubmit, onBack }) => {
    const { name, user_code, capturedImage } = formData;

    return (
        <div className="step-container confirm-container">
            <h2>Bước 3: Xác nhận thông tin</h2>
            <div className="confirm-details">
                <img src={capturedImage} alt="Ảnh chân dung" width={240} />
                <div>
                    <p><strong>Họ và tên:</strong> {name}</p>
                    <p><strong>Mã số:</strong> {user_code}</p>
                </div>
            </div>
            <div className="button-group-image">
                <button onClick={onBack}>Chụp lại</button>
                <button onClick={onSubmit} className="primary">Hoàn thành</button>
            </div>
        </div>
    );
};

export default Step3Confirm;