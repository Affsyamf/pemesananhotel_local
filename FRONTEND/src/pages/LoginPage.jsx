import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Mencoba masuk...');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      toast.success('Login berhasil!', { id: toastId });

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Kolom Kiri: Form Login */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Selamat Datang Kembali
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Silakan masuk untuk melanjutkan ke akun Anda.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label-style">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={handleChange}
                className="input-style mt-1 dark:text-white dark:bg-slate-900" // Ikon dan padding pl-10 dihapus
                placeholder="anda@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label-style">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                  Lupa password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password "
                required
                onChange={handleChange}
                className="input-style mt-1 dark:text-white dark:bg-slate-900" // Ikon dan padding pl-10 dihapus
                placeholder="••••••••"
              />
            </div>
            <div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Daftar di sini
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
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop"
          alt="Luxury Hotel Pool"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default LoginPage;
