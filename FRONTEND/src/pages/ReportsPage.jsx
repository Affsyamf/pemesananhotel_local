import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart, DollarSign, ListChecks, Search, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
// Fungsi untuk format tanggal ke YYYY-MM-DD
const formatDate = (date) => new Date(date).toISOString().split('T')[0];

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            {icon}
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

function ReportsPage() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({
        startDate: formatDate(new Date(new Date().setDate(1))), // Default: awal bulan ini
        endDate: formatDate(new Date()), // Default: hari ini
    });

    const handleDateChange = (e) => {
        setDates({ ...dates, [e.target.name]: e.target.value });
    };

    const handleGenerateReport = async () => {
        if (!dates.startDate || !dates.endDate) {
            toast.error('Silakan pilih rentang tanggal.');
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/reports`, {
                params: dates,
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal membuat laporan.');
        } finally {
            setLoading(false);
        }
    };
    
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

    return (
        <div className="container mx-auto p-6 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">Laporan Performa</h1>
                <Link 
                    to="/admin/print-report" 
                    state={{ reportData, dates }} // Kirim data ke halaman cetak
                    className={`btn-secondary flex items-center ${!reportData ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => !reportData && e.preventDefault()} // Mencegah navigasi jika tidak ada data
                    aria-disabled={!reportData}
                    tabIndex={!reportData ? -1 : undefined}
                >
                    <Printer size={18} className="mr-2" />
                    Cetak Laporan
                </Link>
            {/* Kontrol Filter Tanggal */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <label className="label-style">Tanggal Mulai</label>
                    <input type="date" name="startDate" value={dates.startDate} onChange={handleDateChange} className="input-style dark:bg-slate-900 dark:text-white text-slate-900" />
                </div>
                <div className="flex-1 w-full">
                    <label className="label-style">Tanggal Selesai</label>
                    <input type="date" name="endDate" value={dates.endDate} onChange={handleDateChange} className="input-style dark:bg-slate-900 dark:text-white text-slate-900" />
                </div>
                <button onClick={handleGenerateReport} disabled={loading} className="btn-primary w-full md:w-auto mt-4 md:mt-0 self-end">
                    <Search size={18} className="mr-2" />
                    {loading ? 'Membuat...' : 'Buat Laporan'}
                </button>
            </div>

            {/* Hasil Laporan */}
            {loading && <p className="text-center">Memuat laporan...</p>}
            
            {reportData && (
                <div className="space-y-8">
                    {/* Ringkasan Statistik */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard 
                            title="Total Pendapatan" 
                            value={formatCurrency(reportData.summary.totalRevenue)}
                            icon={<DollarSign className="text-green-500" />}
                        />
                        <StatCard 
                            title="Total Pesanan Terkonfirmasi" 
                            value={reportData.summary.totalBookings}
                            icon={<ListChecks className="text-blue-500" />}
                        />
                    </div>

                    {/* Kamar Terpopuler */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 flex items-center dark:text-gray-200">
                            <BarChart size={20} className="mr-3 text-purple-500" />
                            5 Kamar Terpopuler
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="th-style dark:text-white text-slate-900 text-center">Peringkat</th>
                                        <th className="th-style dark:text-white text-slate-900 text-center">Nama Kamar</th>
                                        <th className="th-style dark:text-white text-slate-900 text-center">Jumlah Pesanan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {reportData.popularRooms.map((room, index) => (
                                        <tr key={room.name}>
                                            <td className="td-style text-center font-bold dark:text-white text-slate-900">{index + 1}</td>
                                            <td className="td-style font-semibold dark:text-white text-slate-900 text-center">{room.name}</td>
                                            <td className="td-style dark:text-white text-slate-900 text-center">{room.bookingCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsPage;
