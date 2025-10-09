// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Header from './components/Header';
// import HomePage from './pages/HomePage';
// import RegistrationPage from './pages/RegistrationPage';
// import LoginPage from './pages/LoginPage';
// // Import các trang admin
// import AdminLoginPage from './pages/admin/AdminLoginPage';
// import AdminDashboardPage from './pages/admin/AdminDashboardPage';


// function App() {
//   return (
//     <div className="app-wrapper">
//       <Header />
//       <main className="content-wrapper">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<HomePage />} />
//           <Route path="/register" element={<RegistrationPage />} />
//           <Route path="/login" element={<LoginPage />} />

//           {/* Admin Routes */}
//           <Route path="/system-admin" element={<AdminLoginPage />} /> {/* Route gốc cho admin */}
//           <Route path="/system-admin/login" element={<AdminLoginPage />} />
//           <Route path="/system-admin/dashboard" element={<AdminDashboardPage />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// export default App;


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
// Import các trang admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage';
import ResetPasswordPage from './pages/admin/ResetPasswordPage';
import AdminLayout from './pages/admin/AdminLayout';
import StatisticsPage from './pages/admin/StatisticsPage';
import EventPage from './pages/EventPage';
import AddUserEventPage from './pages/admin/AddUserEventPage';
import Footer from './Footer/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClientLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header />

    <main style={{ flex: 1 }}>
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <div className="app-wrapper">
      <ToastContainer
        position="top-right"
        autoClose={3000} // Tự động đóng sau 3 giây
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Dùng theme màu cho đẹp
      />
      <main className="content-wrapper">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ClientLayout><HomePage /></ClientLayout>} />
          <Route path="/register" element={<ClientLayout><RegistrationPage /></ClientLayout>} />
          <Route path="/login" element={<ClientLayout><LoginPage /></ClientLayout>} />
          <Route path="/event" element={<ClientLayout><EventPage /></ClientLayout>} />

          {/* Admin Auth Routes */}
          <Route path="/system-admin" element={<Navigate to="/system-admin/login" />} />
          <Route path="/system-admin/login" element={<AdminLoginPage />} />
          <Route path="/system-admin/register" element={<AdminRegisterPage />} />
          <Route path="/system-admin/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/system-admin/reset-password" element={<ResetPasswordPage />} />

          <Route path="/system-admin/dashboard" element={<AdminLayout />}>
            <Route index element={<Navigate to="users" />} />
            <Route path="users" element={<AdminDashboardPage view="users" />} />
            <Route path="admins" element={<AdminDashboardPage view="admins" />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="add-user-event" element={<AddUserEventPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;