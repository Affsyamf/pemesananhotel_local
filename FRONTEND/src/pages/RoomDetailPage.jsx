import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

// Komponen-komponen UI
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';

function RoomDetailPage() {
  const { id: roomId } = useParams(); 
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewableBookingId, setReviewableBookingId] = useState(null);
  const [mainImage, setMainImage] = useState('');

  const token = localStorage.getItem('token');
  const userInfo = useMemo(() => (token ? { token } : null), [token]);

  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
        const roomUrl = `http://localhost:5001/api/public/rooms/${roomId}`;
        const reviewsUrl = `http://localhost:5001/api/public/rooms/${roomId}/reviews`;

        const [roomResponse, reviewsResponse] = await Promise.all([
            axios.get(roomUrl),
            axios.get(reviewsUrl)
        ]);
        
        const roomData = roomResponse.data;
        setRoom(roomData);
        setReviews(reviewsResponse.data);

        if (roomData.images && roomData.images.length > 0) {
            setMainImage(roomData.images[0].image_url);
        } else {
            setMainImage('');
        }

        if (userInfo) {
            const canReviewUrl = `http://localhost:5001/api/public/rooms/${roomId}/can-review`;
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const canReviewResponse = await axios.get(canReviewUrl, config);
            
            setCanReview(canReviewResponse.data.canReview);
            if (canReviewResponse.data.canReview) {
              setReviewableBookingId(canReviewResponse.data.bookingId);
            }
        }

    } catch (error) {
        toast.error(error.response?.data?.message || "Gagal mengambil data detail kamar.");
    } finally {
        setLoading(false);
    }
  }, [roomId, userInfo]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  const handleReviewSubmit = async ({ rating, comment }) => {
    setSubmitLoading(true);
    const toastId = toast.loading('Mengirim ulasan...');
    try {
      const config = {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
      };
      const reviewUrl = `http://localhost:5001/api/public/rooms/${roomId}/reviews`;
      
      await axios.post(reviewUrl, { rating, comment, bookingId: reviewableBookingId }, config);
      
      toast.success('Ulasan Anda berhasil dikirim!', { id: toastId });
      fetchRoomData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulasan.', { id: toastId });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-20 text-xl dark:text-gray-300">Memuat Detail Kamar...</p>;
  if (!room) return <p className="text-center mt-20 text-xl dark:text-gray-300">Kamar tidak ditemukan.</p>;

  const getFullImageUrl = (url) => {
      if (!url) return 'https://placehold.co/1200x600?text=Gambar+Tidak+Tersedia';
      if (url.startsWith('/uploads')) {
        return `http://localhost:5001${url}`;
      }
      return url;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Tombol kembali yang lama sudah dihapus dari sini */}

      <div className="mb-8">
        <div className="mb-4">
            <img 
                src={getFullImageUrl(mainImage)} 
                alt={room.name} 
                className="w-full h-[300px] md:h-[500px] object-cover rounded-lg shadow-lg"
            />
        </div>
        {room.images && room.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto p-2">
                {room.images.map(img => (
                    <button key={img.id} onClick={() => setMainImage(img.image_url)} className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${mainImage === img.image_url ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}>
                        <img 
                            src={getFullImageUrl(img.image_url)} 
                            alt={`Thumbnail ${img.id}`} 
                            className="w-24 h-16 object-cover"
                        />
                    </button>
                ))}
            </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
        <div className="flex items-center my-3">
          <StarRating value={room.averageRating} />
          <span className="ml-3 text-gray-600 dark:text-gray-300">({room.numReviews || 0} ulasan)</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mt-4 text-lg">{room.description}</p>
        {room.price ? (
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(room.price)} / malam
            </p>
        ) : (
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-4">Harga tersedia saat pencarian tanggal.</p>
        )}
      </div>
      <hr className="my-10 border-gray-300 dark:border-gray-600" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <ReviewList reviews={reviews} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          {userInfo ? (
            canReview ? (
              <ReviewForm onSubmit={handleReviewSubmit} isLoading={submitLoading} />
            ) : (
              <div className="text-center h-full flex flex-col justify-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Ulas Kamar Ini</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Anda harus menyelesaikan pemesanan untuk kamar ini sebelum dapat memberikan ulasan.
                  </p>
              </div>
            )
          ) : (
            <div className="text-center h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Ingin Berbagi Pengalaman?</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Anda harus <Link to="/login" className="text-blue-600 hover:underline font-semibold">login</Link> untuk menulis ulasan.
                </p>
            </div>
          )}
        </div>
      </div>

      {/* --- PERBAIKAN: Menggunakan navigate(-1) untuk kembali --- */}
      <div className="mt-12 text-center">
        <button 
          onClick={() => navigate(-1)} 
          className="btn-secondary inline-flex items-center"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Pemilihan Kamar
        </button>
      </div>
    </div>
  );
}

export default RoomDetailPage;

