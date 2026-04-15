import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';

const ManageMusic = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbums = async () => {
            const { data } = await supabase.from('albums').select('*, songs(*)').order('created_at', { ascending: false });
            if (data) setAlbums(data);
            setLoading(false);
        };
        fetchAlbums();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-dark">Gestion Musique</h1>
                <button className="bg-gold text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-gold-dark transition-all shadow-lg shadow-gold/20">
                    <Plus size={18} /> Nouvel Album
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-gold animate-pulse italic">Chargement du catalogue...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {albums.map(album => (
                        <div key={album.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-gray-400">
                                {album.cover_url ? <img src={album.cover_url} className="w-full h-full object-cover" alt="" /> : <Music size={32} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-serif font-bold text-dark">{album.title}</h3>
                                <p className="text-gray-500 text-sm">Prix: {album.price} FCFA • {album.songs?.length || 0} titres</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-xl transition-all"><Edit2 size={18} /></button>
                                <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                    
                    {albums.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Music className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 italic">Aucun album trouvé. Commencez par en ajouter un !</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageMusic;
