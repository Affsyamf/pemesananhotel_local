import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function ResetPasswordPage() {
    const { token } = useParams(); // Ambil token dari URL
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Password dan konfirmasi tidak cocok.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { newPassword });
            setMessage(response.data.message);
            toast.success('Password berhasil direset!');
            setTimeout(() => navigate('/login'), 3000); // Arahkan ke login setelah 3 detik
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Reset Password</h1>
                
                {message ? (
                    <div className="p-4 text-center bg-green-100 text-green-800 rounded-lg dark:bg-green-900/50 dark:text-green-300">
                        <p>{message}</p>
                        <p className="mt-2 text-sm">Anda akan diarahkan ke halaman login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label-style">Password Baru</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-style" required />
                        </div>
                        <div>
                            <label className="label-style">Konfirmasi Password Baru</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-style" required />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Menyimpan...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;
