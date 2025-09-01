import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 1 || formData.password.length > 10) {
      toast.error('Password harus antara 1 hingga 10 karakter.');
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Membuat akun...');

    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      toast.success('Pendaftaran berhasil! Silakan login.', { id: toastId });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pendaftaran gagal', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Kolom Kiri: Form Registrasi */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Buat Akun Baru
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Bergabunglah dengan kami dan mulai petualangan Anda.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="label-style">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                onChange={handleChange}
                className="input-style mt-1 text-slate-900 dark:bg-slate-900 dark:text-white"
                placeholder="Username Anda"
              />
            </div>
            <div>
              <label htmlFor="email" className="label-style">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={handleChange}
                className="input-style mt-1 text-slate-900 dark:bg-slate-900 dark:text-white"
                placeholder="anda@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="label-style">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleChange}
                className="input-style mt-1 text-slate-900 dark:bg-slate-900 dark:text-white"
                placeholder="••••••••"
              />
               <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Password harus 1-10 karakter.</p>
            </div>
            <div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </div>
          </form>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Login di sini
              </Link>
            </p>
             <p>
              Kembali ke halaman utama{' '}
              <Link to="/" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                KLIK
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Gambar */}
      <div className="hidden bg-gray-100 lg:block">
        <img
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"
          alt="Kamar hotel yang elegan"
          className="h-full w-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/1080x1920/e2e8f0/64748b?text=Gambar+Tidak+Tersedia'; }}
        />
      </div>
    </div>
  );
}

export default RegisterPage;
