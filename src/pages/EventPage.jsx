import React, { useRef, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import './EventPage.css';

const EventPage = () => {
    const videoRef = useRef(null);
    const [message, setMessage] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Mở webcam khi vào trang
    useEffect(() => {
        const getWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setMessage('Không thể mở webcam!');
            }
        };
        getWebcam();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Hàm chụp ảnh từ webcam
    const captureImage = () => {
        if (!videoRef.current) return null;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
    };

    useEffect(() => {
        let intervalId;
        if (!processing) {
            intervalId = setInterval(async () => {
                setProcessing(true);
                const imageDataUrl = captureImage();
                if (!imageDataUrl) {
                    setProcessing(false);
                    return;
                }
                const blob = await (await fetch(imageDataUrl)).blob();
                const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" });
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await apiClient.post('/event-recognize', formData);
                    if (res.data.status === "SUCCESS") {
                        setMessage(
                            <>Chào mừng <strong>{res.data.data.name}</strong> tới sự kiện!</>
                        );
                        setTimeout(() => {
                            setMessage(null);
                            setProcessing(false);
                        }, 1000);
                    } else {
                        setMessage('');
                        setProcessing(false);
                    }
                } catch {
                    setMessage('Lỗi nhận diện!');
                    setProcessing(false);
                }
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [processing]);

    return (
        <div className="event-page-container">
            <h2>Sự kiện - Event Check-in</h2>
            <div className="webcam-wrapper">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    width={400}
                    height={300}
                    style={{ borderRadius: 12, border: '1px solid green' }}
                />
            </div>
            {message && (
                <div className="event-welcome-message">
                    {message}
                </div>
            )}
        </div>
    );
};

export default EventPage;
