import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { NotificationCenterModal, INITIAL_WEB_NOTIFICATIONS } from '../NotificationCenterModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('aknel_web_notifications');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(e);
            }
        }
        return INITIAL_WEB_NOTIFICATIONS;
    });
    const location = useLocation();

    // 1. Charger les notifications en direct depuis Supabase
    const fetchLiveNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data && data.length > 0) {
                const mapped = data.map(n => ({
                    id: n.id,
                    type: n.type || 'general',
                    title: n.title,
                    message: n.message,
                    time: n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Récemment',
                    isRead: n.is_read || false,
                    badge: n.badge || 'AKNEL Event',
                    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                    actionText: n.action_text || 'Voir les détails',
                    actionLink: n.action_type === 'concert' ? '/events' : n.action_type === 'subscription' ? '/events' : '/contact',
                }));
                setNotifications(mapped);
            }
        } catch (err) {
            console.warn('Web notifications fetch warning:', err);
        }
    };

    // 2. Écouter les événements en temps réel Supabase
    useEffect(() => {
        fetchLiveNotifications();

        const notifChannel = supabase
            .channel('aknel-web-notifications-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const n = payload.new;
                        const newNotif = {
                            id: n.id,
                            type: n.type || 'general',
                            title: n.title,
                            message: n.message,
                            time: 'À l\'instant',
                            isRead: false,
                            badge: n.badge || 'Nouveau',
                            badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                            actionText: n.action_text || 'Consulter',
                            actionLink: '/events',
                        };
                        setNotifications(prev => [newNotif, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev =>
                            prev.map(item => (item.id === payload.new.id ? { ...item, isRead: payload.new.is_read } : item))
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(notifChannel);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('aknel_web_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleDeleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const navLinks = [
        { name: 'Accueil', path: '/' },
        { name: 'La Salle', path: '/venue' },
        { name: 'Services & Organisation', path: '/services' },
        { name: 'Billetterie Événements', path: '/events' },
        { name: 'Contact & Réservation', path: '/contact' },
    ];

    return (
        <>
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

                    {/* Right Action Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {/* Notification Bell Button */}
                        <button
                            onClick={() => setIsNotifOpen(true)}
                            className="relative p-2.5 rounded-full text-gray-700 hover:text-gold hover:bg-gray-100/80 transition-all duration-300 cursor-pointer"
                            aria-label="Centre de notifications"
                            title="Centre de notifications"
                        >
                            <Bell size={21} />
                            {unreadCount > 0 && (
                                <span className="absolute 1 top-1.5 right-1.5 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-extrabold items-center justify-center">
                                        {unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>

                        {/* CTA App Mobile Bonis Musik / Billetterie */}
                        <Link
                            to="/events"
                            className="flex items-center gap-2 bg-dark text-white hover:bg-gold hover:text-dark px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
                        >
                            <span>Acheter un Billet</span>
                        </Link>
                    </div>

                    {/* Mobile Notification & Toggle */}
                    <div className="flex items-center space-x-2 lg:hidden">
                        <button
                            onClick={() => setIsNotifOpen(true)}
                            className="relative p-2 rounded-full text-gray-800 hover:bg-gray-100"
                            aria-label="Notifications"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-white text-[8px] font-extrabold items-center justify-center">
                                        {unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>

                        <button className="text-dark p-2" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>

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
                                <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsNotifOpen(true);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-gray-100 text-dark py-3 rounded-full font-bold uppercase tracking-wider text-sm shadow-sm"
                                    >
                                        <Bell size={18} />
                                        <span>Notifications ({unreadCount})</span>
                                    </button>
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

            {/* Modal Centre de Notifications */}
            <NotificationCenterModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
            />
        </>
    );
};

export default Navbar;
