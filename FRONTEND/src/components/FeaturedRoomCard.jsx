import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Star, ArrowRight, Wifi, Wind, Tv2 } from 'lucide-react';

function FeaturedRoomCard({ room }) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(room.price);

  return (
    // Menggunakan kelas yang terinspirasi dari shadcn/ui Card dengan efek transisi
    <div className="rounded-xl border bg-white text-gray-900 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50">
      
      {/* Bagian Gambar dengan Efek Hover */}
      <div className="relative overflow-hidden rounded-t-xl group">
        <img 
          src={room.image_url || 'https://placehold.co/400x250/e2e8f0/64748b?text=Kamar'} 
          alt={room.name} 
          className="w-full h-56 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
        {/* Overlay yang Muncul Saat Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <p className="text-white text-lg font-semibold">Lihat Detail</p>
        </div>
        {/* Lencana Peringkat */}
        {room.averageRating > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-sm font-semibold px-3 py-1 rounded-full flex items-center shadow-md">
            <Star size={14} className="mr-1.5 text-yellow-400 fill-current" />
            {parseFloat(room.averageRating).toFixed(1)}
          </div>
        )}
      </div>
      
      {/* Konten Kartu */}
      <div className="p-6 flex flex-col flex-grow">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{room.type}</p>
          <h3 className="text-xl font-bold mt-1">{room.name}</h3>
        </div>

        {/* Fitur Baru: Ikon Fasilitas */}
        <div className="flex items-center space-x-4 mt-4 text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
            <div className="flex items-center" title="WiFi">
                <Wifi size={16} />
            </div>
            <div className="flex items-center" title="Air Conditioner">
                <Wind size={16} />
            </div>
            <div className="flex items-center" title="Televisi">
                <Tv2 size={16} />
            </div>
             <span className="text-xs">+ fasilitas lainnya</span>
        </div>

        {/* Bagian Bawah Kartu (Footer) */}
        <div className="mt-6 flex items-end justify-between flex-grow">
          <div className="flex-shrink-0">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {formattedPrice}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">/ malam</p>
          </div>
          <Link to="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
            Pesan
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FeaturedRoomCard;

