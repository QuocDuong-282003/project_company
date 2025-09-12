// src/pages/LoginPage.jsx

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import apiClient from '../api/apiClient';

const LoginPage = () => {
    const webcamRef = useRef(null);
    const [recognitionResult, setRecognitionResult] = useState({ name: null, box: null });
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const recognitionIntervalRef = useRef(null);

    const captureAndRecognize = useCallback(async () => {
        if (!webcamRef.current || loggedInUser) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const blob = await fetch(imageSrc).then(res => res.blob());
        const file = new File([blob], 'login_capture.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/login-recognize', formData);

            // === THAY ĐỔI BẮT ĐẦU TỪ ĐÂY ===

            // Lấy cấu trúc phản hồi mới từ API
            const { status, message, data } = response.data;

            // Dùng switch-case để xử lý từng trạng thái một cách rõ ràng
            switch (status) {
                case 'SUCCESS':
                    // Chỉ khi thành công mới đăng nhập người dùng
                    setErrorMessage(''); // Xóa thông báo lỗi cũ
                    setRecognitionResult({ name: data.name, box: data.box });
                    setLoggedInUser({ name: data.name, role: data.role, image_base64: data.image_base64 });
                    break;

                case 'MULTIPLE_FACES':
                    // Đây là trường hợp quan trọng cần xử lý
                    // Hiển thị lỗi và KHÔNG làm gì thêm. Vòng lặp sẽ tiếp tục ở khung hình sau.
                    setErrorMessage(message);
                    setRecognitionResult({ name: null, box: null }); // Ẩn khung nhận diện cũ
                    break;

                case 'UNKNOWN':
                    setErrorMessage(''); // Không cần báo lỗi, chỉ cần hiển thị tên "Unknown"
                    setRecognitionResult({ name: data.name, box: data.box });
                    break;

                case 'NO_FACE':
                    setErrorMessage(''); // Xóa lỗi, vì đây là trạng thái bình thường
                    setRecognitionResult({ name: null, box: null }); // Không có mặt thì không có khung
                    break;

                default:
                    // Các trường hợp khác
                    setErrorMessage('Trạng thái không xác định từ server.');
                    setRecognitionResult({ name: null, box: null });
                    break;
            }

            // === KẾT THÚC THAY ĐỔI ===

        } catch (error) {
            // Xử lý khi API trả về lỗi HTTP (ví dụ 400, 500)
            const errorDetail = error.response?.data?.detail || "Lỗi kết nối máy chủ.";
            console.error("Lỗi nhận diện đăng nhập:", errorDetail);
            setErrorMessage(errorDetail); // Hiển thị lỗi từ server nếu có
            setRecognitionResult({ name: null, box: null });
        }
    }, [loggedInUser]);

    useEffect(() => {
        // Logic này đã đúng, không cần thay đổi
        if (!loggedInUser) {
            recognitionIntervalRef.current = setInterval(captureAndRecognize, 1500);
        }

        return () => {
            if (recognitionIntervalRef.current) {
                clearInterval(recognitionIntervalRef.current);
                recognitionIntervalRef.current = null;
            }
        };
    }, [captureAndRecognize, loggedInUser]);

    const handleGoBackToLogin = () => {
        setLoggedInUser(null);
        setRecognitionResult({ name: null, box: null });
        setErrorMessage('');
    };

    return (
        <div className="page-container login-page">
            {!loggedInUser ? (
                <>
                    <h2>Đăng nhập bằng khuôn mặt</h2>
                    <p>Vui lòng nhìn thẳng vào camera để hệ thống nhận diện.</p>
                    {errorMessage && <div className="feedback-box error" style={{ marginBottom: '15px' }}>{errorMessage}</div>}

                    <div className="webcam-container" style={{ position: 'relative', width: '640px', margin: '0 auto' }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={640}
                            height={480}
                        />
                        {recognitionResult.box && (
                            <div
                                className="bounding-box"
                                style={{
                                    position: 'absolute',
                                    top: recognitionResult.box[0],
                                    left: recognitionResult.box[3],
                                    width: recognitionResult.box[1] - recognitionResult.box[3],
                                    height: recognitionResult.box[2] - recognitionResult.box[0],
                                    border: `3px solid ${recognitionResult.name && recognitionResult.name !== 'Unknown' ? '#4caf50' : '#f44336'}`
                                }}
                            >
                                <div
                                    className="name-label"
                                    style={{
                                        backgroundColor: recognitionResult.name && recognitionResult.name !== 'Unknown' ? '#4caf50' : '#f44336',
                                        color: 'white',
                                        padding: '5px',
                                        position: 'absolute',
                                        bottom: '-30px',
                                        left: '0'
                                    }}
                                >
                                    {recognitionResult.name || 'Scanning...'}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="welcome-message">
                    <h2>Đăng nhập thành công!</h2>
                    {loggedInUser.image_base64 && (
                        <img
                            src={`data:image/jpeg;base64,${loggedInUser.image_base64}`}
                            alt={`Ảnh của ${loggedInUser.name}`}
                            className="welcome-avatar"
                        />
                    )}
                    <h3>Chào mừng, {loggedInUser.name}!</h3>
                    <p className="user-role">Vai trò: {loggedInUser.role}</p>

                    <button onClick={handleGoBackToLogin} className="back-to-login-btn">
                        Quét lại / Đăng nhập tài khoản khác
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoginPage;