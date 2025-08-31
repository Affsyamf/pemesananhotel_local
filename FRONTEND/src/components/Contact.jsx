import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

// Komponen kecil untuk setiap item kontak
const ContactCard = ({ icon, title, children }) => (
  <div className="flex items-start p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full p-3">
      {icon}
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  </div>
);

function Contact() {
  // Variabel mapLocation tidak lagi diperlukan dengan metode embed baru

  return (
    <section id='contact' className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Hubungi & Kunjungi Kami
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Temukan lokasi kami dengan mudah atau hubungi tim kami yang siap melayani Anda 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Kolom Informasi Kontak */}
          <div className="space-y-8">
            <ContactCard icon={<MapPin size={24} />} title="Alamat Kantor">
              Jl. Telekomunikasi No. 1, Bandung, Indonesia
            </ContactCard>
            <ContactCard icon={<Mail size={24} />} title="Email Resmi">
              <a href="mailto:afif@gmail.com" className="hover:text-blue-500 transition-colors">
                afif@gmail.com
              </a>
            </ContactCard>
            <ContactCard icon={<Phone size={24} />} title="Telepon">
              <a href="tel:+6289517644630" className="hover:text-blue-500 transition-colors">
                +62 895 1764 4630
              </a>
            </ContactCard>
          </div>

          {/* Kolom Peta Google Maps */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lokasi Kami</h3>
            <div className="w-full h-[400px] rounded-md overflow-hidden border dark:border-gray-700">
              {/* --- PERBAIKAN: Menggunakan URL embed dari Google Maps langsung --- */}
              <iframe
                title="Lokasi Hotel"
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.29742689551!2d107.6277952747948!3d-6.97410099302636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e9adf177bf8d%3A0x43739855061fa03!2sTelkom%20University!5e0!3m2!1sen!2sid"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;

