import React, { useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserRoomCard from '../components/UserRoomCard';
import { useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import RoomFilter from '../components/RoomFilter';
import { Search } from 'lucide-react';

// Fungsi untuk format tanggal ke YYYY-MM-DD
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
};

function BookRoomPage() {
    const navigate = useNavigate();
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State untuk input tanggal
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');

    // State untuk menandai apakah pencarian sudah pernah dilakukan
    const [hasSearched, setHasSearched] = useState(false);
    const [duration, setDuration] = useState(0);

    const [filters, setFilters] = useState({
        price: { min: null, max: null },
        type: 'Semua',
        facilities: [],
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const handleAvailabilitySearch = async () => {
        if (!checkInDate || !checkOutDate) {
            toast.error('Silakan pilih tanggal check-in dan check-out.');
            return;
        }
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            toast.error('Tanggal check-out harus setelah tanggal check-in.');
            return;
        }

        try {
            setLoading(true);
            setHasSearched(true);
            setAvailableRooms([]); 
            
            const response = await axios.get('http://localhost:5001/api/public/rooms', {
                params: {
                    checkInDate: formatDate(checkInDate),
                    checkOutDate: formatDate(checkOutDate)
                }
            });
            
            // --- PERBAIKAN BARU: Menangani respons objek dari API ---
            if (response.data && Array.isArray(response.data.rooms)) {
                // Ambil array 'rooms' dari dalam objek respons
                setDuration(response.data.duration || 0);
                setAvailableRooms(response.data.rooms); 
                if (response.data.rooms.length === 0) {
                    toast('Tidak ada kamar tersedia pada tanggal tersebut, coba tanggal lain.', { icon: 'ℹ️' });
                }
            } else {
                // Jika format respons tidak sesuai atau tidak ada properti 'rooms'
                console.error("API tidak mengembalikan format yang diharapkan:", response.data);
                setAvailableRooms([]); // Pastikan state tetap array
                toast.error("Terjadi kesalahan saat memproses data dari server.");
            }

        } catch (error) {
            // Tangani error jaringan atau server
            toast.error(error.response?.data?.message || 'Gagal mengambil data ketersediaan kamar');
            setAvailableRooms([]); // Pastikan state tetap array saat error
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = useMemo(() => {
        // Karena availableRooms sekarang dijamin array, ini aman.
        return availableRooms.filter(room => {
            const price = room.starting_price; 
            const { min, max } = filters.price;
            if (min !== null && price < min) return false;
            if (max !== null && price > max) return false;
            if (filters.type !== 'Semua' && room.type !== filters.type) return false;
            if (filters.facilities.length > 0) {
                const roomFacilities = room.facilities ? room.facilities.split(',').map(f => f.trim()) : [];
                const hasAllFacilities = filters.facilities.every(facility => roomFacilities.includes(facility));
                if (!hasAllFacilities) return false;
            }
            return true;
        });
    }, [availableRooms, filters]);

    const availableTypes = useMemo(() => [...new Set(availableRooms.map(room => room.type))], [availableRooms]);
    const availableFacilities = useMemo(() => {
        const allFacilities = new Set();
        availableRooms.forEach(room => {
            if (room.facilities) {
                room.facilities.split(',').map(f => f.trim()).forEach(facility => allFacilities.add(facility));
            }
        });
        return [...allFacilities];
    }, [availableRooms]);

    const numberOfNights = useMemo(() => {
        if (!checkInDate || !checkOutDate) return 0;
        const diffTime = new Date(checkOutDate) - new Date(checkInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [checkInDate, checkOutDate]);

    const handleOpenModal = (room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleBookingSubmit = async (data) => {
        const toastId = toast.loading('Memproses pesanan...');
        const token = localStorage.getItem('token');
        try {
           const response = await axios.post('http://localhost:5001/api/public/bookings',
                { 
                    ...data, 
                    room_id: selectedRoom.id, 
                    check_in_date: formatDate(checkInDate), 
                    check_out_date: formatDate(checkOutDate) 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Pesanan dibuat, mengarahkan ke pembayaran...', { id: toastId });
            handleCloseModal();
            navigate(`/pay/${response.data.bookingId}`);
            handleAvailabilitySearch(); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal membuat pesanan', { id: toastId });
        }
    };

    return (
        <div className="container mx-auto p-6 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 dark:text-gray-200">Cari Ketersediaan Kamar</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in</label>
                    <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="input-style dark:bg-slate-900 dark:text-white text-slate-900" />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-out</label>
                    <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="input-style dark:bg-slate-900 dark:text-white text-slate-900" />
                </div>
                <button onClick={handleAvailabilitySearch} disabled={loading} className="btn-primary w-full md:w-auto mt-4 md:mt-0 self-end">
                    <Search size={18} className="mr-2" />
                    {loading ? 'Mencari...' : 'Cari Kamar'}
                </button>
            </div>
            
            {loading && <p className="text-center py-10">Mencari kamar...</p>}

            {!loading && hasSearched && (
                <>
                    <RoomFilter 
                        filters={filters} 
                        setFilters={setFilters}
                        availableTypes={availableTypes}
                        availableFacilities={availableFacilities}
                    />
                    <p className="my-6 text-gray-600 dark:text-gray-200">
                        {filteredRooms.length > 0
                            ? `Menampilkan ${filteredRooms.length} kamar yang tersedia untuk ${numberOfNights} malam.`
                            : `Tidak ada kamar yang cocok dengan filter Anda.`
                        }
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRooms.map(room => (
                            <UserRoomCard key={room.id} room={room} onBook={handleOpenModal} numberOfNights={duration} />
                        ))}
                    </div>
                </>
            )}

            {!loading && !hasSearched && (
                 <p className="text-center py-10 text-gray-500 dark:text-gray-400">Silakan pilih tanggal untuk memulai pencarian.</p>
            )}

            <BookingModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleBookingSubmit}
                room={selectedRoom}
            />
        </div>
    );
}

export default BookRoomPage;

