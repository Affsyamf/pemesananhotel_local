import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMessage(response.data.message);
            toast.success('Permintaan terkirim!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Lupa Password</h1>
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password Anda.
                </p>
                
                {message ? (
                    <div className="p-4 text-center bg-green-100 text-green-800 rounded-lg dark:bg-green-900/50 dark:text-green-300">
                        <p>{message}</p>
                        <p className="mt-2 text-sm">Silakan periksa terminal backend Anda untuk melihat link reset (simulasi email).</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="label-style">Alamat Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-style pl-10"
                                    placeholder="anda@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center">
                    <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
