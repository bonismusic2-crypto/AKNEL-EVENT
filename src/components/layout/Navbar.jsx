import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Smartphone } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Accueil', path: '/' },
        { name: 'La Salle', path: '/venue' },
        { name: 'Services & Organisation', path: '/services' },
        { name: 'Billetterie Événements', path: '/events' },
        { name: 'Contact & Réservation', path: '/contact' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4 border-b border-gray-100' : 'bg-white py-5 border-b border-gray-100'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-2xl font-serif font-black tracking-widest text-dark">
                        AKNEL <span className="text-gold group-hover:opacity-80 transition-opacity">EVENT</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-xs tracking-widest font-bold uppercase transition-colors duration-300 relative group ${location.pathname === link.path ? 'text-gold' : 'text-gray-700 hover:text-gold'}`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
                        </Link>
                    ))}
                </div>

                {/* CTA App Mobile Bonis Musik */}
                <div className="hidden lg:flex items-center">
                    <Link
                        to="/events"
                        className="flex items-center gap-2 bg-dark text-white hover:bg-gold hover:text-dark px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
                    >
                        <span>Acheter un Billet</span>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="lg:hidden text-dark p-2" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 top-[70px] bg-white flex flex-col justify-start px-8 py-10 space-y-6 lg:hidden z-40 border-t border-gray-100 shadow-xl"
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-lg font-serif font-bold uppercase tracking-wider ${location.pathname === link.path ? 'text-gold' : 'text-dark hover:text-gold'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-gray-100">
                                <Link
                                    to="/contact"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-center w-full bg-gold text-dark py-3.5 rounded-full font-bold uppercase tracking-wider text-sm shadow-md"
                                >
                                    Demander un Devis
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;
