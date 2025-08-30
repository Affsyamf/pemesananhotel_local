import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, Star, Eye, BedDouble } from 'lucide-react';

// PERBAIKAN: Menghapus 'numberOfNights' yang tidak digunakan
function UserRoomCard({ room, onBook }) { 
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(room.total_price || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl">
      <img 
        src={room.image_url || 'https://placehold.co/600x400/2D3748/FFFFFF?text=Gambar+Kamar'} 
        alt={`Gambar untuk ${room.name}`}
        className="w-full h-56 object-cover" 
        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/e2e8f0/64748b?text=Gagal+Dimuat'; }}
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{room.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{room.type}</p>
        
        <div className="space-y-2 text-gray-700 dark:text-gray-300 mb-4 flex-grow">
          <div className="flex items-center">
            <DollarSign size={18} className="mr-2 text-green-500" /> 
            <div>
                <span className="font-semibold text-xl">{formattedPrice}</span>
                <span className="text-sm text-gray-500"> / malam</span>
            </div>
          </div>

          <p className="flex items-center"><Package size={16} className="mr-2 text-blue-500" /> Sisa {room.available_quantity} kamar</p>
          
          {room.average_rating > 0 && (
             <p className="flex items-center text-sm">
                <Star size={16} className="mr-2 text-yellow-500 fill-current" />
                {parseFloat(room.average_rating).toFixed(1)} ({room.num_reviews} ulasan)
            </p>
          )}

          <p className="flex items-start text-sm"><BedDouble size={16} className="mr-2 text-purple-500 mt-1" /> {room.facilities}</p>
        </div>
        
        <div className="mt-4 space-y-2">
            <button onClick={() => onBook(room)} className="btn-primary w-full">
                Pesan Sekarang
            </button>
            <Link 
              to={`/room/${room.id}`} 
              className="btn-secondary w-full flex items-center justify-center"
            >
              <Eye size={16} className="mr-2" />
              Lihat Detail & Ulasan
            </Link>
        </div>
      </div>
    </div>
  );
}

export default UserRoomCard;

