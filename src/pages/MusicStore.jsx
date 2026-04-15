import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { Play, Download, ShoppingBag, Music, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const MusicStore = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbums = async () => {
            const { data, error } = await supabase
                .from('albums')
                .select('*, songs(*)');
            
            if (error) {
                console.error('Error fetching albums:', error);
            } else {
                setAlbums(data);
            }
            setLoading(false);
        };
        fetchAlbums();
    }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl animate-pulse">
            Préparation du catalogue...
        </div>
    );

    return (
        <Layout>
            <div className="pt-32 pb-24 bg-dark overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 uppercase tracking-widest">
                        Catalogue <span className="text-gold">Musical</span>
                    </h1>
                    <p className="text-gray-400 text-lg uppercase tracking-widest leading-relaxed">Les albums & titres du Chantre Aknel</p>
                </div>
            </div>

            <div className="py-24 container mx-auto px-6">
                {albums.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
                        <Music className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-serif italic text-lg">Le catalogue est en cours de mise à jour...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {albums.map((album) => (
                            <div key={album.id} className="group space-y-6">
                                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border border-white/5 transition-all duration-500 hover:shadow-gold/20">
                                    {album.cover_url ? (
                                        <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-serif italic">Pas de pochette</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                                        <button className="w-16 h-16 bg-gold text-dark rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                                            <Play fill="currentColor" size={24} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <h2 className="text-2xl font-serif font-bold text-dark uppercase tracking-wide group-hover:text-gold transition-colors">{album.title}</h2>
                                    <p className="text-gray-500 font-medium italic">{album.artist_name || 'Chantre Aknel'}</p>
                                    <div className="pt-4 flex flex-col items-center gap-4">
                                        <span className="text-2xl font-serif font-bold text-dark">
                                            {album.price.toLocaleString()} <span className="text-sm font-sans text-gray-400">FCFA</span>
                                        </span>
                                        <button className="bg-dark text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-dark transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-gold/20">
                                            <ShoppingBag size={14} /> Acheter l'Album
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MusicStore;
