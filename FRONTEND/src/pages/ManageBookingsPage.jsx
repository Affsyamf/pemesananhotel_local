import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import ConfirmationModal from '../components/admin/ConfirmationModal';
import Pagination from '../components/admin/Pagination';

function ManageBookingsPage() {
    const [pageData, setPageData] = useState({
        data: [],
        totalPages: 1,
        currentPage: 1
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [bookingToReject, setBookingToReject] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    
    const fetchBookings = async (page) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/admin/bookings?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // --- LANGKAH DIAGNOSTIK: Tampilkan data mentah dari server di console ---
            console.log("Data yang diterima dari server:", response.data);
            
            setPageData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengambil data pesanan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(currentPage); 
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleApproveBooking = async (bookingId) => {
        const toastId = toast.loading('Menyetujui pesanan...');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5001/api/admin/bookings/${bookingId}/confirm`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Pesanan berhasil disetujui.', { id: toastId });
            fetchBookings(currentPage);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyetujui pesanan.', { id: toastId });
        }
    };

    const openRejectModal = (booking) => {
        setBookingToReject(booking);
        setIsRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setBookingToReject(null);
        setIsRejectModalOpen(false);
    };

    const confirmReject = async () => {
        if (!bookingToReject) return;
        const toastId = toast.loading('Menolak pesanan...');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5001/api/admin/bookings/${bookingToReject.id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Pesanan berhasil ditolak.', { id: toastId });
            fetchBookings(currentPage);
            closeRejectModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menolak pesanan.', { id: toastId });
        }
    };

    const openDeleteModal = (booking) => {
        setBookingToDelete(booking);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setBookingToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        if (!bookingToDelete) return;
        const toastId = toast.loading('Menghapus pesanan...');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/admin/bookings/${bookingToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Pesanan berhasil dihapus.', { id: toastId });
            fetchBookings(currentPage);
            closeDeleteModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus pesanan.', { id: toastId });
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="container mx-auto p-6 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">Kelola Semua Pesanan</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style text-center dark:text-white">ID</th>
                                <th className="th-style text-center dark:text-white">Nama Kamar</th>
                                <th className="th-style text-center dark:text-white">Pemesan</th>
                                <th className="th-style text-center dark:text-white">Tanggal Pesan</th>
                                <th className="th-style text-center dark:text-white">Check-in</th>
                                <th className="th-style text-center dark:text-white">Check-out</th>
                                <th className="th-style text-center dark:text-white">Status</th>
                                <th className="th-style text-center dark:text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="8" className="text-center p-4">Memuat data...</td></tr>
                            ) : (
                                pageData.data.map(booking => (
                                    <tr key={booking.id}>
                                        <td className="td-style text-center dark:text-white font-mono">#{booking.id}</td>
                                        <td className="td-style text-center dark:text-white font-semibold">{booking.room_name}</td>
                                        <td className="td-style text-center dark:text-white">{booking.user_username}</td>
                                        <td className="td-style text-center dark:text-white">{formatDate(booking.created_at)}</td>
                                        <td className="td-style text-center dark:text-white">{formatDate(booking.check_in_date)}</td>
                                        <td className="td-style text-center dark:text-white">{formatDate(booking.check_out_date)}</td>
                                        <td className="td-style text-center dark:text-white">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="td-style">
                                            <div className="flex items-center justify-center space-x-2">
                                                {booking.status === 'pending' && (
                                                  <>
                                                    <button onClick={() => handleApproveBooking(booking.id)} className="text-green-600 hover:text-green-800" title="Setujui Pesanan">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button onClick={() => openRejectModal(booking)} className="text-yellow-600 hover:text-yellow-800" title="Tolak Pesanan">
                                                        <XCircle size={18} />
                                                    </button>
                                                  </>
                                                )}
                                                <button onClick={() => openDeleteModal(booking)} className="text-red-600 hover:text-red-800" title="Hapus Pesanan">
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
                <Pagination
                    currentPage={pageData.currentPage}
                    totalPages={pageData.totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
            
            <ConfirmationModal
                isOpen={isRejectModalOpen}
                onClose={closeRejectModal}
                onConfirm={confirmReject}
                title="Tolak Pesanan"
                message={`Anda yakin ingin menolak pesanan #${bookingToReject?.id} untuk kamar "${bookingToReject?.room_name}"? Stok kamar akan dikembalikan.`}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Hapus Pesanan"
                message={`Anda yakin ingin menghapus pesanan #${bookingToDelete?.id} untuk kamar "${bookingToDelete?.room_name}"? Stok kamar akan dikembalikan jika statusnya 'confirmed'.`}
            />
        </div>
    );
}

export default ManageBookingsPage;

