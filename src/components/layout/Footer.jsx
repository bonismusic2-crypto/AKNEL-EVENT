import React from 'react';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <img src={logo} alt="AKNEL Event" className="h-16 w-auto" />
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Transformez votre événement en un moment inoubliable avec notre expertise en organisation et décoration.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-serif font-semibold text-gold">Contact</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p className="flex items-center gap-2"><MapPin size={16} className="text-gold" /> Abidjan Cocody Rivera Palmeraie</p>
                            <p className="flex items-center gap-2"><Phone size={16} className="text-gold" /> +225 05 56 01 87 87</p>
                            <p className="flex items-center gap-2"><Mail size={16} className="text-gold" /> contact@aknelevent.com</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-serif font-semibold text-gold">Liens Rapides</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/venue" className="hover:text-gold transition-colors">La Salle</Link></li>
                            <li><Link to="/events" className="hover:text-gold transition-colors">Événements</Link></li>
                            <li><Link to="/musique" className="hover:text-gold transition-colors">Musique</Link></li>
                            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-serif font-semibold text-gold">Suivez-nous</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gold transition-colors group">
                                <Facebook size={20} className="text-white group-hover:text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gold transition-colors group">
                                <Instagram size={20} className="text-white group-hover:text-white" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} AKNEL Event. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
