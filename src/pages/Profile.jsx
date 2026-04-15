import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Ticket, Music, Home as HomeIcon, Settings, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        getUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl animate-pulse">
            Chargement de votre espace...
        </div>
    );

    return (
        <Layout>
            <div className="pt-32 pb-24 bg-gray-50 min-h-screen">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className="w-full md:w-64 space-y-2">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 text-center">
                                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-dark font-bold text-2xl uppercase">
                                    {user?.email?.substring(0, 2) || 'AD'}
                                </div>
                                <h2 className="font-serif font-bold text-dark">{user?.user_metadata?.full_name || 'Utilisateur Aknel'}</h2>
                                <p className="text-xs text-gray-400 break-all">{user?.email}</p>
                            </div>
                            
                            <nav className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-dark text-white font-bold text-sm tracking-wide">
                                    <HomeIcon size={18} /> Vue d'ensemble
                                </button>
                                <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all font-medium text-sm tracking-wide">
                                    <Ticket size={18} /> Mes Tickets
                                </button>
                                <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all font-medium text-sm tracking-wide">
                                    <Music size={18} /> Ma Musique
                                </button>
                                <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition-all font-medium text-sm tracking-wide">
                                    <Settings size={18} /> Paramètres
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm tracking-wide"
                                >
                                    <LogOut size={18} /> Déconnexion
                                </button>
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-grow space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-2">
                                    <Ticket className="text-gold mb-2" size={32} />
                                    <h3 className="text-2xl font-serif font-bold text-dark">0</h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Tickets achetés</p>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-2">
                                    <Music className="text-gold mb-2" size={32} />
                                    <h3 className="text-2xl font-serif font-bold text-dark">0</h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Albums en possession</p>
                                </div>
                            </div>

                            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">
                                <div className="max-w-md mx-auto space-y-4">
                                    <h3 className="text-2xl font-serif font-bold text-dark">Commencez l'aventure</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        Vous n'avez pas encore effectué d'achat. Découvrez nos prochains événements ou explorez le catalogue musical.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                        <button 
                                            onClick={() => navigate('/events')}
                                            className="bg-gold text-dark px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gold-dark transition-all shadow-lg shadow-gold/20"
                                        >
                                            Voir les événements
                                        </button>
                                        <button 
                                            onClick={() => navigate('/musique')}
                                            className="bg-dark text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
                                        >
                                            Écouter de la musique
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
