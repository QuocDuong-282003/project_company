
import React, { useState } from 'react';

const Step1UserInfo = ({ onNext, initialData }) => {
    const [name, setName] = useState(initialData.name);
    const [userCode, setUserCode] = useState(initialData.user_code);
    const [email, setEmail] = useState(initialData.email || '');
    const [role, setRole] = useState(initialData.role || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !userCode.trim() || !email.trim() || !role.trim()) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        onNext({ name, user_code: userCode, email, role });
    };

    return (
        <div className="step-container">
            <h2>Bước 1: Nhập thông tin cá nhân</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Mã số NV001"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Vai trò "
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                />
                <div className='submit-form'>


                    <button type="submit" className='btn btn-primary'>Tiếp tục</button>

                </div>
            </form>
        </div>
    );
};

export default Step1UserInfo;