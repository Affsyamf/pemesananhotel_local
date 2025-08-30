import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FeaturedRoomCard from './FeaturedRoomCard';
import { BedDouble } from 'lucide-react';

// Komponen kecil untuk placeholder saat loading
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="bg-gray-300 dark:bg-gray-700 w-full h-56"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
    </div>
  </div>
);

function FeaturedRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/public/featured-rooms');
        if (Array.isArray(response.data)) {
          setRooms(response.data);
        } else {
          // Jika API tidak mengembalikan array, anggap sebagai data kosong
          setRooms([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat kamar pilihan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  // --- KONTEN DINAMIS BERDASARKAN STATE ---

  const renderContent = () => {
    if (loading) {
      return (
        // Tampilkan 4 skeleton card saat loading
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (rooms.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
          {rooms.map(room => (
            <FeaturedRoomCard key={room.id} room={room} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <BedDouble size={48} className="mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
          Saat ini belum ada kamar unggulan.
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Silakan cek kembali nanti.
        </p>
      </div>
    );
  };

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Kamar Pilihan Kami</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Temukan kenyamanan dan kemewahan yang dirancang khusus untuk Anda.</p>
        </div>
        {renderContent()}
      </div>
    </section>
  );
}

export default FeaturedRooms;

