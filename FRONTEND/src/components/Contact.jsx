import React from 'react';
import { MapPin, Mail, Phone, Send } from 'lucide-react';

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
  return (
    <section id='contact' className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Hubungi Kami
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Punya pertanyaan atau butuh bantuan? Tim kami siap melayani Anda 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Kolom Informasi Kontak */}
          <div className="space-y-8">
            <ContactCard icon={<MapPin size={24} />} title="Alamat Kantor">
              Jl. Kemerdekaan No. 123, Jakarta, Indonesia
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

          {/* Kolom Formulir Kontak */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kirim Pesan</h3>
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="name" className="label-style">Nama Lengkap</label>
                <input type="text" name="name" id="name" className="input-style mt-1 dark:bg-slate-900" placeholder="Nama Anda" />
              </div>
              <div>
                <label htmlFor="email" className="label-style">Email</label>
                <input type="email" name="email" id="email" className="input-style mt-1 dark:bg-slate-900" placeholder="email@anda.com" />
              </div>
              <div>
                <label htmlFor="message" className="label-style">Pesan</label>
                <textarea name="message" id="message" rows="4" className="input-style mt-1 dark:bg-slate-900" placeholder="Tuliskan pesan Anda di sini..."></textarea>
              </div>
              <div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center">
                  Kirim Pesan
                  <Send size={16} className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
