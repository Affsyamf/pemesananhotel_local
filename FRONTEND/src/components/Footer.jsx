import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Kolom 1: Logo & Sosial Media */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Hotel Booking</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Pengalaman menginap terbaik menanti Anda.</p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-500"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-500"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-500"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Tautan Cepat</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <ScrollLink 
                  to="Hero" 
                  smooth={true} 
                  duration={500} 
                  spy={true} 
                  exact='true' 
                  offset={-80}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Beranda
                </ScrollLink>
              </li>
              <li>
                {/* Tautan ini tetap menggunakan Link dari react-router karena pindah halaman */}
                <RouterLink to="/dashboard/book" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Cari Kamar
                </RouterLink>
              </li>
               <li>
                 <ScrollLink 
                  to="about" 
                  smooth={true} 
                  duration={500} 
                  spy={true} 
                  exact='true' 
                  offset={-80}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Tentang Kami
                </ScrollLink>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Kebijakan Privasi</a></li>
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Syarat & Ketentuan</a></li>
            </ul>
          </div>

          {/* Kolom 4: Newsletter */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Berlangganan Buletin</h3>
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400">Dapatkan penawaran dan berita terbaru langsung ke email Anda.</p>
            <form className="mt-4 flex items-center">
              <input type="email" placeholder="Email Anda" className="input-style flex-grow dark:bg-slate-900" />
              <button type="submit" className="btn-secondary -ml-px rounded-l-none">Daftar</button>
            </form>
          </div>

        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 py-4">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Afif Syam Fauzi. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
