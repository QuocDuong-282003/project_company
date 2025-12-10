import React from "react";
import { Link, NavLink } from 'react-router-dom';
import './Header.css'
const Header = () => {
    return (
        <header className="app-header">
            <Link to="/home" className="logo">FaceID App</Link>
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