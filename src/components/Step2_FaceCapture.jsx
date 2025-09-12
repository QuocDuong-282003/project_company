import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import apiClient from '../api/apiClient';

const Step2FaceCapture = ({ onCapture, onBack }) => {
    const webcamRef = useRef(null);
    const [feedback, setFeedback] = useState({ status: 'INIT', message: 'Chuẩn bị camera...' });
    const [isReady, setIsReady] = useState(false);
    const [countdown, setCountdown] = useState(3); // Đặt thời gian đếm ngược
    const timerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const validationIntervalRef = useRef(null);

    const startCountdown = useCallback((imageSrc) => {
        setIsReady(true);
        setCountdown(3); // Reset lại số đếm

        countdownIntervalRef.current = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        timerRef.current = setTimeout(() => {
            clearInterval(countdownIntervalRef.current);
            onCapture(imageSrc); // Chụp ảnh và chuyển bước
        }, 3000); // SỬA ĐỔI: Thời gian chụp là 3 giây
    }, [onCapture]);

    const stopCountdown = useCallback(() => {
        setIsReady(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    }, []);

    const validateFace = useCallback(async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const blob = await fetch(imageSrc).then(res => res.blob());
        const file = new File([blob], 'validation.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/validate-face', formData);
            setFeedback(response.data);

            if (response.data.status === 'OK') {
                if (!timerRef.current) {
                    startCountdown(imageSrc);
                }
            } else {
                stopCountdown();
            }
        } catch (error) {
            console.error("Lỗi xác thực khuôn mặt:", error);
            setFeedback({ status: 'ERROR', message: 'Lỗi kết nối máy chủ' });
            stopCountdown();
        }
    }, [startCountdown, stopCountdown]);

    useEffect(() => {
        const startValidation = setTimeout(() => {
            validationIntervalRef.current = setInterval(validateFace, 1000);
        }, 1000);

        return () => {
            clearTimeout(startValidation);
            if (validationIntervalRef.current) clearInterval(validationIntervalRef.current);
            stopCountdown();
        };
    }, [validateFace, stopCountdown]);

    const webcamBorderColor = isReady ? '#4caf50' : '#f44336';

    return (
        <div className="step-container">
            <h2>Bước 2: Chụp ảnh chân dung</h2>
            <div className="webcam-capture-container">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={640}
                    height={480}
                    style={{ border: `4px solid ${webcamBorderColor}`, borderRadius: '8px' }}
                />
                <div className={`feedback-box ${feedback.status === 'OK' ? 'ok' : 'error'}`}>
                    {feedback.message}
                    {isReady && <div className="countdown-timer">Giữ nguyên... Chụp trong {countdown}</div>}
                </div>
            </div>
            <button onClick={onBack} style={{ marginTop: '15px' }}>Quay lại</button>
        </div>
    );
};

export default Step2FaceCapture;