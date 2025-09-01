// frontend/src/pages/DashboardPage.jsx
import React, {useState, useEffect } from 'react';
import axios from 'axios';
// --- PERBAIKAN 1: Impor 'Element' dari react-scroll ---
import { Element } from 'react-scroll';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FeaturedRoomCard from '../components/FeaturedRoomCard';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
function DashboardPage() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/public/featured-rooms`);
        setFeaturedRooms(response.data);
      } catch (error) {
        console.error("Gagal mengambil data kamar unggulan:", error);
        toast.error('Gagal memuat data kamar unggulan.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  return (
    
    <div className="bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main>
        {/* --- PERBAIKAN 2: Bungkus setiap bagian dengan <Element> dan beri nama --- */}
        <Element name="Hero">
          <Hero />
        </Element>
        
        <Element name="tentang-kami">
          <About />
        </Element>
        
        <Element name="kamar-pilihan">
          <section className="py-20" id='rooms'>
              <div className="container mx-auto px-6">
                  <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
                      Kamar Pilihan Kami
                  </h2>
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
                      Temukan kenyamanan dan kemewahan yang dirancang khusus untuk Anda.
                  </p>
                  
                  {loading ? (
                      <p className="text-center dark:text-gray-300">Memuat kamar...</p>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                          {featuredRooms.map(room => (
                              <FeaturedRoomCard key={room.id} room={room} />
                          ))}
                      </div>
                  )}
              </div>
          </section>
        </Element>

        <Element name="kontak">
          <Contact />
        </Element>
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;

