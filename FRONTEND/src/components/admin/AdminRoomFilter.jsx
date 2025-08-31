import React from 'react';
import { Search } from 'lucide-react';

function AdminRoomFilter({ filters, setFilters, availableTypes }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      price: { ...prev.price, [name]: value === '' ? null : Number(value) }
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 dark:bg-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Kolom Pencarian */}
        <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cari Nama Kamar</label>
  <div className="relative mt-1">
    <input
      type="text"
      name="search"
      value={filters.search}
      onChange={handleInputChange}
      placeholder="e.g. Deluxe Room"
      // PASTIKAN CLASS "pl-10" ADA DI SINI
      className="input-style w-full pl-50 dark:bg-gray-700 dark:text-gray-300" 
    />
    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
    </span>
  </div>
</div>

        {/* Filter Harga */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rentang Harga (Rp)</label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="number"
              name="min"
              value={filters.price.min ?? ''}
              onChange={handlePriceChange}
              placeholder="Min"
              className="input-style w-full dark:bg-gray-700 dark:text-gray-300"
            />
            <span>-</span>
            <input
              type="number"
              name="max"
              value={filters.price.max ?? ''}
              onChange={handlePriceChange}
              placeholder="Max"
              className="input-style w-full dark:bg-gray-700 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Filter Tipe Kamar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipe Kamar</label>
          <select 
            name="type" 
            value={filters.type} 
            onChange={handleInputChange} 
            className="input-style w-full mt-1 dark:bg-gray-700 dark:text-gray-300"
          >
            <option value="Semua">Semua Tipe</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default AdminRoomFilter;