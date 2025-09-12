import React from "react";
import { Link } from "react-router-dom";
const HomePage = () => {
    return (
        <>
            <div className="page-container">
                <h1>Chào mừng đến với Ứng dụng Nhận diện Khuôn mặt</h1>
                <p>Vui lòng chọn một hành động từ thanh điều hướng bên trên.</p>
            </div>

            <div className="home-actions">
                <Link to="/register" className="action-button">Bắt đầu Đăng ký</Link>
                <Link to="/login" className="action-button primary">Đi đến trang Đăng nhập</Link>
            </div>
        </>

    )
}
export default HomePage