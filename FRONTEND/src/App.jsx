import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import UserLayout from './components/UserLayout';
import AdminLayout from './components/admin/AdminLayout';

// Komponen
import ProtectedRoute from './components/ProtectedRoute';

// Halaman Publik
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Halaman Pengguna (User)
import BookRoomPage from './pages/BookRoomPage';
import MyBookingsPage from './pages/MyBookingsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import UserProfilePage from './pages/UserProfilePage';

// Halaman Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManageUsersPage from './pages/ManageUsersPage';
import ManageRoomsPage from './pages/ManageRoomsPage';
import ManageAvailabilityPage from './pages/ManageAvailabilityPage';
import ManageBookingsPage from './pages/ManageBookingsPage';
import ManagePromosPage from './pages/ManagePromosPage';
import ReportsPage from './pages/ReportsPage';
import AdminPrintBookingPage from './pages/AdminPrintBookingPage';
import PrintReportPage from './pages/PrintReportPage';


// Halaman Proses (Pembayaran, Cetak, dll)
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PrintBookingPage from './pages/PrintBookingPage'; 

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* --- RUTE PUBLIK --- */}
        <Route path="/" element={<DashboardPage />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* --- PERBAIKAN: Rute Detail Kamar dijadikan Rute Publik --- */}
        <Route path="/room/:id" element={<RoomDetailPage />} />

        {/* --- RUTE PENGGUNA (USER) --- */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            {/* Rute yang menggunakan UserLayout (dengan sidebar) */}
            <Route path="/dashboard" element={<UserLayout />}>
              <Route index element={<Navigate to="book" replace />} />
              <Route path="book" element={<BookRoomPage />} />
              <Route path="my-bookings" element={<MyBookingsPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              {/* Hapus rute detail dari sini */}
            </Route>
            
            {/* Rute yang TIDAK menggunakan UserLayout (halaman penuh) */}
            <Route path="/pay/:bookingId" element={<PaymentPage />} />
            <Route path="/payment-success/:bookingId" element={<PaymentSuccessPage />} />
            <Route path="/print-booking/:bookingId" element={<PrintBookingPage />} />
        </Route>

        {/* --- RUTE ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            {/* Rute yang menggunakan AdminLayout (dengan sidebar) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="rooms" element={<ManageRoomsPage />} />
              <Route path="availability" element={<ManageAvailabilityPage />} />
              <Route path="bookings" element={<ManageBookingsPage />} />
              <Route path="promos" element={<ManagePromosPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* Rute yang TIDAK menggunakan AdminLayout (halaman penuh) */}
            <Route path="/admin/print-booking/:bookingId" element={<AdminPrintBookingPage />} />
            <Route path="/admin/print-report" element={<PrintReportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

