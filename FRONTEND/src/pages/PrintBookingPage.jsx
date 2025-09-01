import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Hotel, Calendar, User, BedDouble, ArrowLeft, Tag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function PrintBookingPage() {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/public/booking/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBooking(response.data);
                setTimeout(() => window.print(), 500);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal mengambil detail pesanan');
            } finally {
                setLoading(false);
            }
        };
        fetchBookingDetails();
    }, [bookingId]);

    if (loading) return <p className="text-center p-10">Memuat detail pesanan...</p>;
    if (!booking) return <p className="text-center p-10">Pesanan tidak ditemukan.</p>;

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const formatCurrency = (number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number);

    const numberOfNights =
        (new Date(booking.check_out_date) - new Date(booking.check_in_date)) /
        (1000 * 60 * 60 * 24);

    const finalPrice = booking.final_price !== null ? booking.final_price : booking.total_price;
    const discountAmount = booking.total_price - finalPrice;

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 print-wrapper">
            <style>{`
                .print-container { position: relative; }

                .paid-stamp {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 6rem;
                    font-weight: bold;
                    color: rgba(4, 120, 87, 0.18);
                    border: 7px solid rgba(4, 120, 87, 0.18);
                    padding: 0.5rem 2rem;
                    border-radius: 1rem;
                    z-index: 50;              
                    pointer-events: none;     
                    user-select: none;
                }

                @media print {
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        background-color: #ffffff; 
                        margin: 0; 
                    }
                    .print-wrapper { padding: 0; background-color: #ffffff; }
                    .print-container { 
                        width: 100%; 
                        max-width: 800px; 
                        margin: 0 auto; 
                        padding: 2rem; 
                        box-shadow: none; 
                        border: none; 
                        border-radius: 0; 
                    }
                    .no-print { display: none; }
                    .paid-stamp { z-index: 9999; }
                }
            `}</style>

            <div className="font-sans p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-2xl print-container">
                {/* Stempel LUNAS */}
                {booking.payment_status === 'paid' && (
                    <div className="paid-stamp" aria-hidden="true">LUNAS</div>
                )}

                {/* Konten utama */}
                <div>
                    <div className="flex items-center justify-between border-b-2 border-gray-100 pb-6 mb-8">
                        <div className="flex items-center">
                            <div className="bg-blue-600 p-3 rounded-full mr-4">
                                <Hotel className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Bukti Reservasi</h1>
                                <p className="text-gray-500">
                                    Status Pesanan:{" "}
                                    <span className="font-semibold text-gray-700 capitalize">
                                        {booking.status}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-700">
                                Pesanan Anda ke-{booking.user_booking_sequence}
                            </p>
                            <p className="text-sm text-gray-500">ID Referensi: #{booking.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-sm font-bold text-gray-500 uppercase flex items-center mb-3">
                                <User size={14} className="mr-2" /> Dipesan Oleh
                            </h2>
                            <p className="text-lg font-medium text-gray-800">{booking.username}</p>
                            <p className="text-gray-600">{booking.email}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-sm font-bold text-gray-500 uppercase flex items-center mb-3">
                                <User size={14} className="mr-2" /> Detail Tamu
                            </h2>
                            <p className="text-lg font-medium text-gray-800">{booking.guest_name}</p>
                            <p className="text-gray-600">{booking.guest_address}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-gray-500 uppercase flex items-center mb-3">
                            <BedDouble size={14} className="mr-2" /> Rincian Pembayaran
                        </h2>
                        <div className="border border-gray-200 rounded-lg p-6 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{booking.room_name}</p>
                                    <p className="text-gray-600">
                                        {booking.room_type} ({numberOfNights} malam)
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-700">
                                    {formatCurrency(booking.total_price)}
                                </p>
                            </div>
                            {booking.promo_code_used && (
                                <div className="flex justify-between items-center border-t pt-3 text-green-600">
                                    <div className="flex items-center">
                                        <Tag size={14} className="mr-2" />
                                        <p>Diskon ({booking.promo_code_used})</p>
                                    </div>
                                    <p className="font-semibold">- {formatCurrency(discountAmount)}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t pt-3">
                                <p className="text-xl font-bold text-gray-900">Total Bayar</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(finalPrice)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-blue-50 p-6 rounded-lg text-center">
                        <div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase flex items-center justify-center mb-2">
                                <Calendar size={14} className="mr-2" /> Tanggal Pesan
                            </h2>
                            <p className="text-lg font-semibold text-gray-800">
                                {formatDate(booking.created_at)}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-blue-600 uppercase flex items-center justify-center mb-2">
                                <Calendar size={14} className="mr-2" /> Check-in
                            </h2>
                            <p className="text-lg font-semibold text-blue-800">
                                {formatDate(booking.check_in_date)}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-blue-600 uppercase flex items-center justify-center mb-2">
                                <Calendar size={14} className="mr-2" /> Check-out
                            </h2>
                            <p className="text-lg font-semibold text-blue-800">
                                {formatDate(booking.check_out_date)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
                        <p>Terima kasih telah melakukan reservasi. Mohon tunjukkan bukti ini saat check-in.</p>
                        <div className="no-print mt-6 flex justify-center items-center space-x-4">
                            <Link to="/dashboard/my-bookings" className="btn-secondary flex items-center">
                                <ArrowLeft size={16} className="mr-2" />
                                Kembali ke Riwayat
                            </Link>
                            <button onClick={() => window.print()} className="btn-primary">
                                Cetak Ulang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrintBookingPage;
