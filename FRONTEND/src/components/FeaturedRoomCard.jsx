import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

function FeaturedRoomCard({ room }) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(room.price);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="overflow-hidden">
        <img 
          src={room.image_url || 'https://placehold.co/400x250/e2e8f0/64748b?text=Kamar'} 
          alt={room.name} 
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{room.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{room.type}</p>
        <div className="flex items-center text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
          <DollarSign size={18} className="mr-2" />
          <span>{formattedPrice} / malam</span>
        </div>
        {/* Tombol ini akan mengarahkan pengguna untuk login/register sebelum bisa memesan */}
        <Link to="/login" className="btn-primary w-full text-center">
          Pesan Sekarang
        </Link>
      </div>
    </div>
  );
}

export default FeaturedRoomCard;

