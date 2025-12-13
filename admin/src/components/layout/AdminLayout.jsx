import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, Camera, Mail, Settings, LogOut, Calendar, MessageSquare } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminEmail');
        navigate('/login');
    };

    const menuItems = [
        { name: 'Tableau de bord', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Messagerie', icon: <MessageSquare size={20} />, path: '/messages' },
        { name: 'Réservations', icon: <Calendar size={20} />, path: '/reservations' },
        { name: 'Accueil', icon: <FileText size={20} />, path: '/edit-home' },
        { name: 'À Propos', icon: <FileText size={20} />, path: '/edit-about' },
        { name: 'Services', icon: <Briefcase size={20} />, path: '/edit-services' },
        { name: 'Galerie', icon: <Camera size={20} />, path: '/edit-gallery' },
        { name: 'Contact', icon: <Mail size={20} />, path: '/edit-contact' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-dark text-white flex flex-col z-10 shadow-2xl">
                <div className="p-8 border-b border-gray-800 text-center">
                    <h1 className="text-2xl font-serif font-bold tracking-wider">AKNEL <span className="text-gold italic">Event</span></h1>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Section Label */}
                    <div className="px-4 mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestion</div>
                    {menuItems.slice(0, 3).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${location.pathname === item.path
                                ? 'bg-gold text-white shadow-lg translate-x-1'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <span className={location.pathname === item.path ? 'bg-white/20 p-1 rounded font-bold' : ''}>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}

                    {/* Section Label */}
                    <div className="px-4 mt-8 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contenu du Site</div>
                    {menuItems.slice(3).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${location.pathname === item.path
                                ? 'bg-gold text-white shadow-lg translate-x-1'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <span className={location.pathname === item.path ? 'bg-white/20 p-1 rounded font-bold' : ''}>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg w-full transition-colors text-sm font-medium">
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                <header className="bg-white shadow-sm p-8 flex justify-between items-center sticky top-0 z-20">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-dark">
                            {menuItems.find(i => i.path === location.pathname)?.name || 'Tableau de bord'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Gérez votre plateforme événementielle avec élégance.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center font-bold font-serif text-xl border-2 border-white shadow-md">
                            A
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
