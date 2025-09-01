import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function ManageAvailabilityPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [availability, setAvailability] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState({});

  // 1. Ambil semua tipe kamar untuk dropdown saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/admin/rooms`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRooms(response.data);
        if (response.data.length > 0) {
          setSelectedRoomId(response.data[0].id); // Otomatis pilih kamar pertama
        }
      } catch (error) {
        toast.error(error.response?.data?.message||'Gagal memuat tipe kamar.');
      }
    };
    fetchRooms();
  }, []);

  // 2. Ambil data ketersediaan setiap kali kamar atau bulan/tahun berubah
  const fetchAvailability = useCallback(async () => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await axios.get(`${API_URL}/api/admin/availability/${selectedRoomId}?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailability(response.data);
      setChanges({}); // Reset perubahan saat data baru dimuat
    } catch (error) {
      toast.error(error.response?.data?.message||'Gagal mengambil data ketersediaan.');
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRoomId, currentDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);
  
  // 3. Fungsi untuk menangani perubahan pada input (Sisa Kamar, Harga, Status)
  const handleInputChange = (id, field, value) => {
    setChanges(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        id,
        [field]: value
      }
    }));
  };

  // 4. Fungsi untuk menyimpan semua perubahan
  const handleSaveChanges = async () => {
    const updates = Object.values(changes).map(change => {
        const originalData = availability.find(day => day.id === change.id);
        return {
            id: change.id,
            quantity: change.available_quantity ?? originalData.available_quantity,
            isActive: change.is_active ?? originalData.is_active,
            price: change.price ?? originalData.price,
        };
    });

    if (updates.length === 0) {
      toast('Tidak ada perubahan untuk disimpan.', { icon: 'ℹ️' });
      return;
    }
    
    const toastId = toast.loading('Menyimpan perubahan...');
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/api/admin/availability`, { updates }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Perubahan berhasil disimpan!', { id: toastId });
        fetchAvailability(); // Muat ulang data
    } catch (error) {
        toast.error(error.response?.data?.message||'Gagal menyimpan perubahan.', { id: toastId });
    }
  };

  // Fungsi navigasi bulan
  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  // Mendapatkan nama hari dalam Bahasa Indonesia
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long' });
  };
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Manajemen Inventaris Harian</h1>
      
      {/* --- KONTROL FILTER --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Tipe Kamar</label>
          <select 
            value={selectedRoomId} 
            onChange={e => setSelectedRoomId(e.target.value)}
            className="input-style w-full dark:bg-slate-900 dark:text-white text-slate-900"
          >
            {rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
          </select>
        </div>
        <div className="flex-grow flex items-center justify-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft /></button>
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-200 w-40 text-center">
            {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight /></button>
        </div>
        <button onClick={handleSaveChanges} className="btn-primary w-full md:w-auto">
          Simpan Perubahan
        </button>
      </div>

      {/* --- TABEL INVENTARIS --- */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-4 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
          <div className="text-left">TANGGAL</div>
          <div className="text-center">SISA KAMAR</div>
          <div className="text-center">STATUS PENJUALAN</div>
        </div>
        {loading ? (
          <p className="p-6 text-center">Memuat data...</p>
        ) : availability.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {availability.map(day => {
              const changedDay = changes[day.id] || {};
              // SOLUSI: Selalu pastikan ada nilai fallback (misal: 0 atau nilai asli) untuk mencegah NaN
              const currentQuantity = changedDay.available_quantity ?? day.available_quantity;
              const currentStatus = changedDay.is_active ?? day.is_active;

              return (
                <div key={day.id} className="grid grid-cols-3 gap-4 p-4 items-center">
                  <div className="text-left text-gray-800 dark:text-gray-200">
                    <p className="font-semibold">{new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                    <p className="text-sm text-gray-500">{getDayName(day.date)}</p>
                  </div>
                  <div className="text-center">
                    <input 
                      type="number"
                      className="input-style w-24 mx-auto text-center text-slate-900 dark:text-white dark:bg-slate-900"
                      value={currentQuantity || 0} // Fallback ke 0 jika nilai null/undefined
                      onChange={e => handleInputChange(day.id, 'available_quantity', parseInt(e.target.value, 10))}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={!!currentStatus} // Pastikan selalu boolean
                                onChange={e => handleInputChange(day.id, 'is_active', e.target.checked)}
                            />
                            <div className={`block w-14 h-8 rounded-full ${currentStatus ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${currentStatus ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-gray-700 dark:text-gray-300">{currentStatus ? 'Aktif' : 'Nonaktif'}</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-6 text-center text-gray-500">Tidak ada data inventaris untuk kamar dan bulan ini.</p>
        )}
      </div>
    </div>
  );
}

export default ManageAvailabilityPage;
