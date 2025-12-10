import React, { useRef, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import './EventPage.css';

const EventPage = () => {
    const videoRef = useRef(null);
    const [message, setMessage] = useState(null);
    const [processing, setProcessing] = useState(false);

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

    const captureImage = () => {
        if (!videoRef.current) return null;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
    };


    //     let intervalId;
    //     if (!processing) {
    //         intervalId = setInterval(async () => {
    //             setProcessing(true);
    //             const imageDataUrl = captureImage();
    //             if (!imageDataUrl) {
    //                 setProcessing(false);
    //                 return;
    //             }
    //             const blob = await (await fetch(imageDataUrl)).blob();
    //             const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" });
    //             const formData = new FormData();
    //             formData.append('file', file);

    //             try {
    //                 const res = await apiClient.post('/event-recognize', formData);
    //                 if (res.data.status === "SUCCESS") {
    //                     setMessage(
    //                         <>Chào mừng <strong>{res.data.data.name}</strong> tới sự kiện!</>
    //                     );
    //                     setTimeout(() => {
    //                         setMessage(null);
    //                         setProcessing(false);
    //                     }, 2000);
    //                 } else {
    //                     setMessage('');
    //                     setProcessing(false);
    //                 }
    //             } catch (error) {
    //                 console.error("Lỗi API:", error); 
    //                 setMessage('Lỗi kết nối máy chủ!');
    //                 // setMessage('Lỗi nhận diện!');
    //                 setProcessing(false);
    //             }
    //         }, 2000);
    //     }
    //     return () => clearInterval(intervalId);
    // }, [processing]);
    // FILE: EventPage.js

    // ... (giữ nguyên các phần code khác) ...

    // === HÃY DÁN TOÀN BỘ ĐOẠN CODE NÀY THAY THẾ CHO useEffect THỨ HAI CỦA BẠN ===
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
                        }, 2000);

                    } else {
                        setProcessing(false);
                    }

                } catch (error) {
                    console.error("Lỗi API:", error);
                    setMessage('Lỗi kết nối máy chủ!');

                    setTimeout(() => {
                        setMessage(null);
                        setProcessing(false);
                    }, 2000);
                }

            }, 2000);
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
            {!processing && (
                <div style={{
                    marginTop: 12,
                    color: '#1976d2',
                    fontWeight: 500,
                    fontSize: '1.05em',
                    textAlign: 'center'
                }}>
                    Vui lòng giữ nguyên trong vòng 2 giây, đang chuẩn bị quét...
                </div>
            )}
            {message && (
                <div className="event-welcome-message">
                    {message}
                </div>
            )}
        </div>

    );
};

export default EventPage;
