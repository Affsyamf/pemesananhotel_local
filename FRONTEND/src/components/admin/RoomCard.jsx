// frontend/src/components/admin/RoomCard.jsx
import React from 'react';
import { Pencil, Trash2, BedDouble, DollarSign, Package, Image } from 'lucide-react';

function RoomCard({ room, onEdit, onDelete, onGallery }) {
  // Format harga menjadi format Rupiah
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(room.price);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <img
        src={room.image_url || 'https://via.placeholder.com/400x250/E2E8F0/4A5568?text=No+Image'}
        alt={room.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-grow dark:bg-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{room.name}</h3>
        <p className="text-sm text-gray-500 mb-2 dark:text-gray-200">{room.type}</p>
        
        <div className="mt-2 space-y-2 text-sm text-gray-600 flex-grow dark:text-gray-200">
          <div className="flex items-center">
            <DollarSign size={16} className="mr-2 text-green-500" />
            <span>{formattedPrice} / malam</span>
          </div>
          <div className="flex items-center">
            <Package size={16} className="mr-2 text-blue-500" />
            <span>Tersedia: {room.available_quantity} kamar</span>
          </div>
          <div className="flex items-start">
            <BedDouble size={16} className="mr-2 text-purple-500 mt-1" />
            <p className="flex-1">Fasilitas: {room.facilities || '-'}</p>
          </div>
        </div>

         <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={() => onGallery(room)} className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-full" title="Kelola Galeri">
            <Image size={18} />
          </button>
          <button onClick={() => onEdit(room)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full" title="Edit Kamar">
            <Pencil size={18} />
          </button>
          <button onClick={() => onDelete(room)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full" title="Hapus Kamar">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;