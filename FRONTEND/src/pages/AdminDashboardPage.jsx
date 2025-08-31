import React, {useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, ListChecks, DollarSign } from 'lucide-react';
import SalesChart from '../components/admin/SalesChart'; // <-- Impor komponen grafik baru

const StatCard = ({ title, value, icon, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            {icon}
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
);

function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                // Panggil kedua endpoint secara bersamaan untuk efisiensi
                const [statsRes, chartRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/admin/stats', config),
                    axios.get('http://localhost:5001/api/admin/sales-chart-data', config)
                ]);

                setStats(statsRes.data);
                setChartData(chartRes.data);

            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal memuat data dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

    if (loading) return <p className="text-center p-10">Memuat dashboard...</p>;
    if (!stats) return <p className="text-center p-10">Tidak ada data untuk ditampilkan.</p>;

    return (
        <div className="container mx-auto p-6 md:p-10 space-y-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Dashboard Admin</h1>

            {/* Grid Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Pengguna" 
                    value={stats.totalUsers}
                    description="Jumlah semua akun pengguna"
                    icon={<Users className="text-blue-500" size={24} />}
                />
                <StatCard 
                    title="Total Pesanan" 
                    value={stats.totalBookings}
                    description="Jumlah semua pesanan terkonfirmasi"
                    icon={<ListChecks className="text-green-500" size={24} />}
                />
                <StatCard 
                    title="Pendapatan Bulan Ini" 
                    value={formatCurrency(stats.monthlyRevenue)}
                    description={`Total pendapatan di bulan ${new Date().toLocaleString('id-ID', { month: 'long' })}`}
                    icon={<DollarSign className="text-yellow-500" size={24} />}
                />
            </div>
            
            {/* Tampilkan komponen grafik baru */}
            <SalesChart data={chartData} />
            
        </div>
    );
}

export default AdminDashboardPage;

