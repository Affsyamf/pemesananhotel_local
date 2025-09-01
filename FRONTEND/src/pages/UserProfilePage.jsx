import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function UserProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message||'Gagal mengambil data profil.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            toast.error('Password baru dan konfirmasi tidak cocok.');
            return;
        }
        
        // --- PERUBAHAN VALIDASI DI SINI ---
        if (passwords.newPassword.length < 1 || passwords.newPassword.length > 10) {
            toast.error('Password baru harus antara 1 hingga 10 karakter.');
            return;
        }

        setSaving(true);
        const toastId = toast.loading('Menyimpan password baru...');
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API_URL}/api/auth/change-password`, {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Password berhasil diubah!', { id: toastId });
            setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengubah password.', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-center p-10">Memuat profil...</p>;

    return (
        <div className="container mx-auto p-6 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">Profil Saya</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Kartu Informasi Pengguna */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <div className="flex items-center mb-6">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full mr-4">
                            <User className="text-blue-600 dark:text-blue-400" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 capitalize">{user?.username}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Ini adalah informasi akun Anda. Anda dapat mengubah password Anda di formulir di samping.</p>
                    </div>
                </div>

                {/* Kartu Ubah Password */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                        <Lock size={24} className="mr-3 text-gray-500" />
                        Ubah Password
                    </h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="label-style">Password Lama</label>
                            <input type="password" name="oldPassword" value={passwords.oldPassword} onChange={handlePasswordChange} className="input-style dark:bg-slate-900 text-slate-900 dark:text-white" required />
                        </div>
                        <div>
                            <label className="label-style">Password Baru</label>
                            <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="input-style dark:bg-slate-900 text-slate-900 dark:text-white" required />
                        </div>
                        <div>
                            <label className="label-style">Konfirmasi Password Baru</label>
                            <input type="password" name="confirmNewPassword" value={passwords.confirmNewPassword} onChange={handlePasswordChange} className="input-style dark:bg-slate-900 text-slate-900 dark:text-white" required />
                        </div>
                        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center">
                            <Save size={18} className="mr-2" />
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;
