import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PromoFormModal from '../components/admin/PromoFormModal';
import ConfirmationModal from '../components/admin/ConfirmationModal';
// Kita akan membuat komponen-komponen ini nanti
// import PromoFormModal from '../components/admin/PromoFormModal';
// import ConfirmationModal from '../components/admin/ConfirmationModal';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

function ManagePromosPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    // State untuk modal akan ditambahkan nanti

        // State untuk modal
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState(null);

    const fetchPromos = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/promos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPromos(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengambil data promo.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromos();
    }, [fetchPromos]);

    const handleOpenFormModal = (promo = null) => {
        setEditingPromo(promo);
        setIsFormModalOpen(true);
    };
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingPromo(null);
    };
    const handleFormSubmit = async (data) => {
        const toastId = toast.loading('Menyimpan...');
        const token = localStorage.getItem('token');
        try {
            if (editingPromo) {
                await axios.put(`${API_URL}/api/admin/promos/${editingPromo.id}`, data, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Promo berhasil diperbarui!', { id: toastId });
            } else {
                await axios.post(`${API_URL}/api/admin/promos`, data, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Promo baru berhasil dibuat!', { id: toastId });
            }
            fetchPromos();
            handleCloseFormModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan promo.', { id: toastId });
        }
    };

    const openDeleteModal = (promo) => {
        setPromoToDelete(promo);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setPromoToDelete(null);
        setIsDeleteModalOpen(false);
    };

     const confirmDelete = async () => {
        if (!promoToDelete) return;
        const toastId = toast.loading('Menghapus...');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/promos/${promoToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Promo berhasil dihapus.', { id: toastId });
            fetchPromos();
            closeDeleteModal();
        } catch (error) {
            toast.error(error.response?.data?.message||'Gagal menghapus promo.', { id: toastId });
        }
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });


    return (
        <div className="container mx-auto p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Manajemen Kode Promo</h1>
                <button onClick={() => handleOpenFormModal(null)} className="btn-primary flex items-center">
                    <Plus size={20} className="mr-2" />
                    Tambah Promo
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style text-center dark:text-white text-slate-900">Kode</th>
                                <th className="th-style text-center dark:text-white text-slate-900">Diskon (%)</th>
                                <th className="th-style text-center dark:text-white text-slate-900">Tanggal Kadaluarsa</th>
                                <th className="th-style text-center dark:text-white text-slate-900">Status</th>
                                <th className="th-style text-center dark:text-white text-slate-900">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-4">Memuat data...</td></tr>
                            ) : (
                                promos.map(promo => (
                                    <tr key={promo.id}>
                                        <td className="td-style font-mono uppercase text-center dark:text-white text-slate-900">{promo.code}</td>
                                        <td className="td-style text-center dark:text-white text-slate-900">{promo.discount_percentage}%</td>
                                        <td className="td-style text-center dark:text-white text-slate-900">{formatDate(promo.expiry_date)}</td>
                                        <td className="td-style text-center dark:text-white text-slate-900">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {promo.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="td-style">
                                            <div className="flex items-center space-x-3 justify-center">
                                                <button onClick={() => handleOpenFormModal(promo)} className="text-blue-600 hover:text-blue-800" title="Edit Promo">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => openDeleteModal(promo)} className="text-red-600 hover:text-red-800" title="Hapus Promo">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <PromoFormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSubmit={handleFormSubmit}
                initialData={editingPromo}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Hapus Kode Promo"
                message={`Anda yakin ingin menghapus kode promo "${promoToDelete?.code}"?`}
            />
        </div>
    );
}

export default ManagePromosPage;
