import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import apiClient from '../api/apiClient';
import './LoginPage.css';

const LoginPage = () => {
    const webcamRef = useRef(null);
    const [recognitionResult, setRecognitionResult] = useState({ name: null, box: null });
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const recognitionIntervalRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    const captureAndRecognize = useCallback(async () => {
        if (!webcamRef.current || loggedInUser || isPaused) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const blob = await fetch(imageSrc).then(res => res.blob());
        const file = new File([blob], 'login_capture.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/login-recognize', formData);
            const { status, message, data } = response.data;

            switch (status) {
                case 'SUCCESS':
                    setErrorMessage('');
                    setRecognitionResult({ name: data.name, box: data.box });
                    setLoggedInUser({ name: data.name, role: data.role, image_base_64: data.face_image_base_64 });
                    break;

                case 'MULTIPLE_FACES':
                    setErrorMessage(message);
                    setRecognitionResult({ name: null, box: null });
                    setIsPaused(true);
                    break;

                case 'UNKNOWN':
                    setErrorMessage('');
                    setRecognitionResult({ name: data.name, box: data.box });
                    break;
                case 'NO_FACE':
                    setErrorMessage('');
                    setRecognitionResult({ name: null, box: null });
                    break;
                default:
                    setErrorMessage('Trạng thái không xác định từ server.');
                    setRecognitionResult({ name: null, box: null });
                    break;
            }
        } catch (error) {
            const errorDetail = error.response?.data?.detail || "Lỗi kết nối máy chủ.";
            console.error("Lỗi nhận diện đăng nhập:", errorDetail);
            setErrorMessage(errorDetail);
            setRecognitionResult({ name: null, box: null });
            setIsPaused(true);
        }
    }, [loggedInUser, isPaused]);

    useEffect(() => {
        if (!loggedInUser && !isPaused) {
            recognitionIntervalRef.current = setInterval(captureAndRecognize, 1500);
        } else {
            if (recognitionIntervalRef.current) {
                clearInterval(recognitionIntervalRef.current);
                recognitionIntervalRef.current = null;
            }
        }
        return () => {
            if (recognitionIntervalRef.current) {
                clearInterval(recognitionIntervalRef.current);
            }
        };
    }, [captureAndRecognize, loggedInUser, isPaused]);

    const handleGoBackToLogin = () => {
        setLoggedInUser(null);
        setRecognitionResult({ name: null, box: null });
        setErrorMessage('');
        setIsPaused(false);
    };

    const handleRetryRecognition = () => {
        setErrorMessage('');
        setIsPaused(false);
    };

    return (
        <div className="page-container login-page">
            {!loggedInUser ? (
                <>
                    <h2>Đăng nhập bằng khuôn mặt</h2>
                    <p>Vui lòng nhìn thẳng vào camera để hệ thống nhận diện.</p>

                    {errorMessage && (
                        <div className="feedback-box error center">
                            <span>{errorMessage}</span>
                            {isPaused && (
                                <button onClick={handleRetryRecognition} className="retry-btn">
                                    Thử lại
                                </button>
                            )}
                        </div>
                    )}

                    <div className="webcam-container">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={640}
                            height={480}
                        />
                        {recognitionResult.box && !isPaused && (
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
                                <div className="name-label" style={{ backgroundColor: recognitionResult.name && recognitionResult.name !== 'Unknown' ? '#4caf50' : '#f44336' }}>
                                    {recognitionResult.name || 'Scanning...'}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="welcome-message">
                    <h2>Đăng nhập thành công!</h2>
                    {loggedInUser.image_base_64 && (
                        <img
                            src={`data:image/jpeg;base64,${loggedInUser.image_base_64}`}
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