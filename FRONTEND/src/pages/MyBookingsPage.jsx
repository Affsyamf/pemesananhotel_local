import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
// --- PERBAIKAN 1: Hapus 'useNavigate' dari impor ---
import { Link } from 'react-router-dom';
import { Printer, XCircle, CreditCard } from 'lucide-react';
import ConfirmationModal from '../components/admin/ConfirmationModal';
import Pagination from '../components/admin/Pagination';

function MyBookingsPage() {
  const [pageData, setPageData] = useState({ data: [], totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  // --- PERBAIKAN 2: Hapus deklarasi yang tidak digunakan ---
  // const navigate = useNavigate();

  const fetchMyBookings = useCallback(async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/public/my-bookings?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPageData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBookings(currentPage);
  }, [currentPage, fetchMyBookings]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openCancelModal = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setBookingToCancel(null);
    setIsCancelModalOpen(false);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    const toastId = toast.loading('Memproses pembatalan...');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/public/bookings/${bookingToCancel.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Pesanan berhasil dibatalkan', { id: toastId });
      fetchMyBookings(currentPage);
      closeCancelModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan', { id: toastId });
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const renderPaymentStatus = (paymentStatus) => {
    const isPaid = paymentStatus === 'paid';
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isPaid ? 'Lunas' : 'Belum Dibayar'}
      </span>
    );
  };

  const renderBookingStatus = (status) => {
    let style = 'bg-gray-100 text-gray-800';
    if (status === 'confirmed') style = 'bg-green-100 text-green-800';
    else if (status === 'cancelled' || status === 'rejected') style = 'bg-red-100 text-red-800';
    else if (status === 'awaiting_payment') style = 'bg-yellow-100 text-yellow-800';
    else if (status === 'pending') style = 'bg-blue-100 text-blue-800';

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${style}`}>
            {status.replace('_', ' ')}
        </span>
    );
  };


  return (
    <div className="container mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">Riwayat Pesanan Saya</h1>
        
      {loading ? <p className="dark:text-gray-300">Memuat riwayat pesanan...</p> : !pageData.data || pageData.data.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Anda belum memiliki pesanan.</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Mari jelajahi dan pesan kamar impian Anda!</p>
            <Link to="/dashboard/book" className="btn-primary mt-6">Lihat Kamar</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="th-style text-center dark:text-gray-100">Kamar</th>
                            <th className="th-style text-center dark:text-gray-100">Tanggal Pesan</th>
                            <th className="th-style text-center dark:text-gray-100">Check-in</th>
                            <th className="th-style text-center dark:text-gray-100">Check-out</th>
                            <th className="th-style text-center dark:text-gray-100">Pembayaran</th>
                            <th className="th-style text-center dark:text-gray-100">Status Pesanan</th>
                            <th className="th-style text-center dark:text-gray-100">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {pageData.data.map(booking => (
                            <tr key={booking.id}>
                                <td className="td-style font-semibold text-gray-800 dark:text-gray-200">{booking.room_name}</td>
                                <td className="td-style dark:text-white">{formatDate(booking.created_at)}</td>
                                <td className="td-style dark:text-white">{formatDate(booking.check_in_date)}</td>
                                <td className="td-style dark:text-white">{formatDate(booking.check_out_date)}</td>
                                <td className="td-style text-center">{renderPaymentStatus(booking.payment_status)}</td>
                                <td className="td-style text-center">{renderBookingStatus(booking.status)}</td>
                                <td className="td-style">
                                    <div className="flex items-center space-x-4">
                                        {booking.payment_status === 'pending' && (
                                            <Link to={`/pay/${booking.id}`} className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-semibold dark:text-blue-400 dark:hover:text-blue-300">
                                                <CreditCard size={16} className="mr-1" />
                                                Bayar
                                            </Link>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <Link to={`/print-booking/${booking.id}`} className="text-blue-600 hover:text-blue-800 flex items-center text-sm dark:text-blue-400 dark:hover:text-blue-300">
                                                <Printer size={16} className="mr-1" />
                                                Cetak
                                            </Link>
                                        )}
                                        {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                                            <button onClick={() => openCancelModal(booking)} className="text-red-600 hover:text-red-800 flex items-center text-sm dark:text-red-400 dark:hover:text-red-300">
                                                <XCircle size={16} className="mr-1" />
                                                Batalkan
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={pageData.currentPage}
                totalPages={pageData.totalPages}
                onPageChange={handlePageChange}
            />
        </div>
      )}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        onConfirm={confirmCancel}
        title="Batalkan Pesanan"
        message={`Apakah Anda yakin ingin membatalkan pesanan untuk kamar "${bookingToCancel?.room_name}"? Aksi ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}

export default MyBookingsPage;

