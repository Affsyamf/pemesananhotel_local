import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Trash2, ImageOff, Loader, UploadCloud } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function GalleryModal({ isOpen, onClose, room }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const fetchImages = useCallback(async () => {
        if (!room) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/rooms/${room.id}/images`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message||'Gagal memuat galeri.');
        } finally {
            setLoading(false);
        }
    }, [room]);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen, fetchImages]);

    const handleFile = async (files) => {
        const file = files[0];
        if (!file) return;

        // Validasi tipe file
        if (!file.type.startsWith('image/')) {
            toast.error('Hanya file gambar yang diizinkan.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        
        setIsUploading(true);
        const toastId = toast.loading('Mengunggah gambar...');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/rooms/${room.id}/upload-image`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            toast.success('Gambar berhasil diunggah!', { id: toastId });
            fetchImages(); // Refresh galeri
        } catch (error) {
            toast.error(error.response?.data?.message||'Gagal mengunggah gambar.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    // Handler untuk drag-and-drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Anda yakin ingin menghapus gambar ini?')) return;
        
        const toastId = toast.loading('Menghapus gambar...');
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/images/${imageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(prevImages => prevImages.filter(img => img.id !== imageId));
            toast.success('Gambar berhasil dihapus!', { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message||'Gagal menghapus gambar.', { id: toastId });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Kelola Galeri: {room?.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kolom Kiri: Galeri yang Sudah Ada */}
                    <div className="pr-4 border-r dark:border-gray-700">
                        <h3 className="font-semibold mb-4 dark:text-gray-200">Gambar Saat Ini</h3>
                        {loading ? (
                            <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-blue-500" /></div>
                        ) : images.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {images.map(image => (
                                    <div key={image.id} className="relative group aspect-w-1 aspect-h-1">
                                        <img src={`${API_URL}:5001${image.image_url}`} alt={image.alt_text || room.name} className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex justify-center items-center rounded-md">
                                            <button onClick={() => handleDeleteImage(image.id)} className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg h-full flex flex-col justify-center items-center">
                                <ImageOff className="mx-auto text-gray-400" size={48} />
                                <p className="mt-4 text-gray-500">Galeri ini masih kosong.</p>
                            </div>
                        )}
                    </div>

                    {/* Kolom Kanan: Area Unggah */}
                    <div>
                        <h3 className="font-semibold mb-4 dark:text-gray-200">Tambah Gambar Baru</h3>
                        <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="h-full">
                            <label className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-gray-700" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, atau WEBP</p>
                                </div>
                                <input type="file" id="file-upload" className="hidden" onChange={handleChange} accept="image/png, image/jpeg, image/webp" />
                            </label>
                            {dragActive && <div className="absolute inset-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                        </form>
                        {isUploading && <div className="mt-4 flex items-center text-sm text-gray-500"><Loader size={16} className="animate-spin mr-2" /><span>Mengunggah...</span></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GalleryModal;
