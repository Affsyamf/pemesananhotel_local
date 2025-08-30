import React, { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: 'about', label: 'Tentang Kami' },
    { to: 'rooms', label: 'Kamar' },
    { to: 'contact', label: 'Kontak' },
  ];

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md fixed w-full top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            La Hotel Afif
          </div>
          
          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <ScrollLink key={link.to} to={link.to} spy={true} smooth={true} offset={-70} duration={500} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium transition-colors">
                {link.label}
              </ScrollLink>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <RouterLink to="/login">
              <button className="btn-primary">Login</button>
            </RouterLink>
          </div>

          {/* Tombol Hamburger untuk Mobile */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 dark:text-white focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <div className={`md:hidden fixed top-0 left-0 w-full h-screen bg-white dark:bg-gray-900 z-40 transform ${isOpen ? "translate-y-0" : "-translate-y-full"} transition-transform duration-300 ease-in-out pt-20`}>
        <div className="flex flex-col items-center justify-center h-full space-y-10">
          {navLinks.map((link) => (
            <ScrollLink key={link.to} to={link.to} spy={true} smooth={true} offset={-70} duration={500} className="text-2xl text-gray-800 dark:text-gray-200 cursor-pointer" onClick={() => setIsOpen(false)}>
              {link.label}
            </ScrollLink>
          ))}
          <RouterLink to="/login" onClick={() => setIsOpen(false)}>
            <button className="btn-primary text-xl px-8 py-3">Login</button>
          </RouterLink>
        </div>
      </div>
    </>
  );
}

export default Navbar;