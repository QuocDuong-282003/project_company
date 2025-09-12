// src/components/Header.jsx
import React from "react";
import { Link, NavLink } from 'react-router-dom';
const Header = () => {
    return (
        <header className="app-header">
            <Link to="/" className="logo">FaceID App</Link>
            <nav className="main-nav"> {/* Đổi lại class name cho đúng CSS */}
                <NavLink to='/login' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Đăng nhập
                </NavLink>
                <NavLink to='/register' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Đăng ký
                </NavLink>
            </nav>
        </header>
    )
}
export default Header;