import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, Plus, Edit2, Trash2, Film, BookOpen, Layers, CheckCircle2, AlertCircle, Disc } from 'lucide-react';
import { FileUploader } from '../components/admin-ui/FileUploader';

const ManageMusic = () => {
    const [activeTab, setActiveTab] = useState('albums'); // 'albums', 'clips', 'teachings'
    const [albums, setAlbums] = useState([]);
    const [mediaContents, setMediaContents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Formulaire d'ajout / modification
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('album'); // 'album', 'song', 'clip', 'teaching'
    const [editingItem, setEditingItem] = useState(null); // Élément en cours de modification (null si ajout)
    
    const [formData, setFormData] = useState({
        title: '',
        album_id: '',
        category: 'video_clip', // 'video_clip', 'teaching_audio', 'teaching_video'
        media_url: '',
        thumbnail_url: '',
        duration: '',
        price: '0',
        speaker_or_artist: 'Chantre Boniface',
        year: '2026'
    });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Récupérer les albums et chansons
            const { data: albumsData } = await supabase
                .from('albums')
                .select('*, songs(*)')
                .order('created_at', { ascending: false });
            if (albumsData) setAlbums(albumsData);

            // 2. Récupérer les clips et enseignements (media_contents)
            const { data: mediaData } = await supabase
                .from('media_contents')
                .select('*')
                .order('created_at', { ascending: false });
            if (mediaData) setMediaContents(mediaData);
        } catch (err) {
            console.error('Erreur chargement médias:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Ouvrir le formulaire en mode création
    const handleOpenCreate = (type) => {
        setEditingItem(null);
        setModalType(type);
        setFormData({
            title: '',
            album_id: albums[0]?.id || '',
            category: type === 'clip' ? 'video_clip' : 'teaching_audio',
            media_url: '',
            thumbnail_url: '',
            duration: '',
            price: '0',
            speaker_or_artist: 'Chantre Boniface',
            year: '2026'
        });
        setShowModal(true);
    };

    // Ouvrir le formulaire en mode modification pour un Album
    const handleEditAlbum = (album) => {
        setEditingItem(album);
        setModalType('album');
        setFormData({
            title: album.title || '',
            album_id: album.id,
            category: 'album',
            media_url: '',
            thumbnail_url: album.cover_url || '',
            duration: '',
            price: album.price ? album.price.toString() : '0',
            speaker_or_artist: album.artist_name || 'Chantre Boniface',
            year: album.release_date ? new Date(album.release_date).getFullYear().toString() : '2026'
        });
        setShowModal(true);
    };

    // Ouvrir le formulaire en mode modification pour une Chanson
    const handleEditSong = (song, parentAlbum) => {
        setEditingItem(song);
        setModalType('song');
        setFormData({
            title: song.title || '',
            album_id: song.album_id || parentAlbum?.id || '',
            category: 'song',
            media_url: song.audio_url || song.file_url || song.url || '',
            thumbnail_url: parentAlbum?.cover_url || '',
            duration: song.duration || '04:30',
            price: '0',
            speaker_or_artist: song.artist_name || parentAlbum?.artist_name || 'Chantre Boniface',
            year: '2026'
        });
        setShowModal(true);
    };

    // Ouvrir le formulaire en mode modification pour un Clip ou Enseignement
    const handleEditMedia = (media) => {
        setEditingItem(media);
        setModalType(media.category === 'video_clip' ? 'clip' : 'teaching');
        setFormData({
            title: media.title || '',
            album_id: media.album_id || '',
            category: media.category || 'video_clip',
            media_url: media.media_url || '',
            thumbnail_url: media.thumbnail_url || '',
            duration: media.duration || '05:00',
            price: '0',
            speaker_or_artist: media.speaker_or_artist || 'Chantre Boniface',
            year: '2026'
        });
        setShowModal(true);
    };

    // Enregistrement (Création OU Mise à jour)
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingItem) {
                // ==================== MODE MODIFICATION ====================
                if (modalType === 'album') {
                    const { error } = await supabase.from('albums').update({
                        title: formData.title,
                        price: parseFloat(formData.price) || 0,
                        cover_url: formData.thumbnail_url,
                        artist_name: formData.speaker_or_artist || 'Chantre Boniface',
                    }).eq('id', editingItem.id);
                    if (error) throw error;
                } else if (modalType === 'song') {
                    const { error } = await supabase.from('songs').update({
                        album_id: formData.album_id,
                        title: formData.title,
                        audio_url: formData.media_url,
                        duration: formData.duration || '04:30',
                        artist_name: formData.speaker_or_artist || 'Chantre Boniface',
                    }).eq('id', editingItem.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('media_contents').update({
                        title: formData.title,
                        album_id: formData.album_id || null,
                        category: modalType === 'clip' ? 'video_clip' : formData.category,
                        media_url: formData.media_url,
                        thumbnail_url: formData.thumbnail_url,
                        duration: formData.duration || '05:00',
                        speaker_or_artist: formData.speaker_or_artist || 'Chantre Boniface'
                    }).eq('id', editingItem.id);
                    if (error) throw error;
                }
            } else {
                // ==================== MODE CRÉATION ====================
                if (modalType === 'album') {
                    const { data: newAlbum, error } = await supabase.from('albums').insert([{
                        title: formData.title,
                        price: parseFloat(formData.price) || 0,
                        cover_url: formData.thumbnail_url,
                        artist_name: formData.speaker_or_artist || 'Chantre Boniface',
                        release_date: new Date().toISOString()
                    }]).select();
                    if (error) throw error;

                    if (formData.media_url && newAlbum && newAlbum[0]) {
                        await supabase.from('songs').insert([{
                            album_id: newAlbum[0].id,
                            title: formData.title,
                            audio_url: formData.media_url,
                            duration: formData.duration || '04:30',
                        }]);
                    }
                } else if (modalType === 'song') {
                    const { error } = await supabase.from('songs').insert([{
                        album_id: formData.album_id || (albums[0] ? albums[0].id : null),
                        title: formData.title,
                        audio_url: formData.media_url,
                        duration: formData.duration || '04:30',
                        artist_name: formData.speaker_or_artist || 'Chantre Boniface',
                    }]);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('media_contents').insert([{
                        title: formData.title,
                        album_id: formData.album_id || null,
                        category: modalType === 'clip' ? 'video_clip' : formData.category,
                        media_url: formData.media_url,
                        thumbnail_url: formData.thumbnail_url,
                        duration: formData.duration || '05:00',
                        speaker_or_artist: formData.speaker_or_artist || 'Chantre Boniface'
                    }]);
                    if (error) throw error;
                }
            }

            setShowModal(false);
            setEditingItem(null);
            fetchData();
        } catch (err) {
            alert('Erreur lors de l\'enregistrement : ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAlbum = async (id) => {
        if (!window.confirm('Supprimer cet album et tous ses titres ?')) return;
        await supabase.from('albums').delete().eq('id', id);
        fetchData();
    };

    const handleDeleteSong = async (id) => {
        if (!window.confirm('Supprimer cette chanson ?')) return;
        await supabase.from('songs').delete().eq('id', id);
        fetchData();
    };

    const handleDeleteMedia = async (id) => {
        if (!window.confirm('Supprimer ce contenu ?')) return;
        await supabase.from('media_contents').delete().eq('id', id);
        fetchData();
    };

    return (
        <div className="space-y-8">
            {/* Header & Bouton d'action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Gestion des Contenus Mobile (Bonis Musik)</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Publiez, modifiez ou mettez à jour vos albums, chansons, clips vidéo HD et enseignements spirituels.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => handleOpenCreate('album')}
                        className="bg-dark text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-gold hover:text-dark transition-all shadow-md cursor-pointer"
                    >
                        <Plus size={16} /> 1. Créer un Album
                    </button>
                    <button
                        onClick={() => handleOpenCreate('song')}
                        className="bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-700 transition-all shadow-md cursor-pointer"
                    >
                        <Plus size={16} /> 2. Ajouter Chanson dans Album
                    </button>
                    <button
                        onClick={() => handleOpenCreate('clip')}
                        className="bg-gold text-dark px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-dark hover:text-white transition-all shadow-md cursor-pointer"
                    >
                        <Plus size={16} /> 3. Ajouter Clip Vidéo dans Album
                    </button>
                    <button
                        onClick={() => handleOpenCreate('teaching')}
                        className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-gray-200 transition-all shadow-sm cursor-pointer"
                    >
                        <Plus size={16} /> 4. Publier Enseignement
                    </button>
                </div>
            </div>

            {/* Onglets de Filtrage des Médias */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-lg">
                <button
                    onClick={() => setActiveTab('albums')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'albums' ? 'bg-gold text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                >
                    <Music size={15} /> Albums & Chansons ({albums.length})
                </button>
                <button
                    onClick={() => setActiveTab('clips')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'clips' ? 'bg-gold text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                >
                    <Film size={15} /> Clips Vidéos ({mediaContents.filter(m => m.category === 'video_clip').length})
                </button>
                <button
                    onClick={() => setActiveTab('teachings')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'teachings' ? 'bg-gold text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                >
                    <BookOpen size={15} /> Enseignements ({mediaContents.filter(m => m.category.includes('teaching')).length})
                </button>
            </div>

            {/* Contenu */}
            {loading ? (
                <div className="h-64 flex items-center justify-center text-gold font-bold animate-pulse">
                    Chargement des contenus depuis la base de données...
                </div>
            ) : (
                <>
                    {/* 1. Onglet ALBUMS AUDIO & LEURS CHANSONS */}
                    {activeTab === 'albums' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {albums.map((album) => {
                                const relatedClips = mediaContents.filter(m => m.category === 'video_clip' && m.album_id === album.id);
                                return (
                                    <div key={album.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                                        <div>
                                            <div className="flex gap-4 items-center mb-4">
                                                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-gray-400 shrink-0">
                                                    {album.cover_url ? (
                                                        <img src={album.cover_url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <Music size={28} className="text-gold" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">Album Officiel</span>
                                                    <h3 className="text-lg font-serif font-bold text-dark mt-1 leading-tight">{album.title}</h3>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {album.songs?.length || 0} chansons • {relatedClips.length} clips vidéo
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Liste des chansons dans cet album avec boutons Modifier/Supprimer */}
                                            {album.songs && album.songs.length > 0 && (
                                                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2 border border-gray-100">
                                                    <p className="text-[10px] font-extrabold uppercase text-gray-400">Pistes Audio ({album.songs.length})</p>
                                                    {album.songs.map((s, idx) => (
                                                        <div key={s.id || idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-gray-100 shadow-2xs">
                                                            <div className="flex-1 truncate mr-2">
                                                                <span className="font-bold text-dark">{idx + 1}. {s.title}</span>
                                                                <span className="text-[10px] text-gray-400 font-mono block">{s.duration || '04:30'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleEditSong(s, album)}
                                                                    className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-md cursor-pointer"
                                                                    title="Modifier la chanson"
                                                                >
                                                                    <Edit2 size={13} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteSong(s.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
                                                                    title="Supprimer la chanson"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                            <span className="text-green-600 font-bold">● Streaming Illimité Débloqué</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditAlbum(album)}
                                                    className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold"
                                                    title="Modifier l'album"
                                                >
                                                    <Edit2 size={15} /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAlbum(album.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Supprimer l'album"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 2. Onglet CLIPS VIDÉOS */}
                    {activeTab === 'clips' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mediaContents.filter(m => m.category === 'video_clip').map((item) => {
                                const parentAlbum = albums.find(a => a.id === item.album_id);
                                return (
                                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                                        <div className="flex gap-4 items-center mb-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-gray-400 shrink-0">
                                                {item.thumbnail_url ? (
                                                    <img src={item.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <Film size={28} className="text-gold" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">
                                                    {parentAlbum ? `Clip de l'album: ${parentAlbum.title}` : 'Clip Vidéo HD'}
                                                </span>
                                                <h3 className="text-base font-serif font-bold text-dark mt-1 leading-tight">{item.title}</h3>
                                                <p className="text-gray-500 text-xs mt-1">{item.duration || '04:30'} • {item.speaker_or_artist || 'Chantre Boniface'}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                            <span className="text-green-600 font-bold">● Vidéo 4K Débloquée</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditMedia(item)}
                                                    className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg cursor-pointer flex items-center gap-1 font-bold"
                                                    title="Modifier le clip"
                                                >
                                                    <Edit2 size={15} /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMedia(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 3. Onglet ENSEIGNEMENTS */}
                    {activeTab === 'teachings' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mediaContents.filter(m => m.category.includes('teaching')).map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                                    <div className="flex gap-4 items-center mb-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-gray-400 shrink-0">
                                            {item.thumbnail_url ? (
                                                <img src={item.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <BookOpen size={28} className="text-gold" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark bg-gray-100 px-2 py-0.5 rounded">
                                                {item.category === 'teaching_audio' ? '🎙️ Audio' : '🎥 Vidéo'}
                                            </span>
                                            <h3 className="text-base font-serif font-bold text-dark mt-1 leading-tight">{item.title}</h3>
                                            <p className="text-gray-500 text-xs mt-1">{item.duration || '15:00'} • {item.speaker_or_artist || 'Chantre Boniface'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                        <span className="text-green-600 font-bold">● Streaming Illimité VIP</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditMedia(item)}
                                                className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg cursor-pointer flex items-center gap-1 font-bold"
                                                title="Modifier l'enseignement"
                                            >
                                                <Edit2 size={15} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMedia(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* MODAL D'AJOUT ET MODIFICATION DE CONTENU */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-serif font-bold text-dark">
                                {editingItem ? '✏️ Modifier : ' : '➕ Nouveau : '}
                                {modalType === 'album' ? 'Album Officiel' : modalType === 'song' ? 'Chanson dans un Album' : modalType === 'clip' ? 'Clip Vidéo lié à un Album' : 'Enseignement'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark font-bold text-lg cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                            {/* Choix de l'album de rattachement pour les Chansons et les Clips */}
                            {(modalType === 'song' || modalType === 'clip') && (
                                <div>
                                    <label className="block mb-1">Album de Rattachement</label>
                                    <select
                                        required
                                        value={formData.album_id}
                                        onChange={(e) => setFormData({ ...formData, album_id: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold normal-case font-medium"
                                    >
                                        <option value="">-- Sélectionner l'album parent --</option>
                                        {albums.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                💿 {a.title} ({a.year || '2026'})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 font-normal normal-case mt-1">
                                        Le {modalType === 'clip' ? 'clip' : 'morceau'} apparaîtra automatiquement à l'intérieur de cet album sur l'application mobile.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block mb-1">
                                    {modalType === 'album' ? "Titre de l'Album" : modalType === 'song' ? "Titre de la Chanson" : modalType === 'clip' ? "Titre du Clip Vidéo" : "Titre de l'Enseignement"}
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Jésus règne à jamais"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold normal-case font-normal"
                                />
                            </div>

                            {modalType === 'teaching' && (
                                <div>
                                    <label className="block mb-1">Format de l'Enseignement</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold normal-case font-medium"
                                    >
                                        <option value="teaching_audio">🎙️ Enseignement / Podcast Audio (MP3)</option>
                                        <option value="teaching_video">🎥 Enseignement / Prédication Vidéo (MP4)</option>
                                    </select>
                                </div>
                            )}

                            {/* 1. Upload / Modification de la Pochette ou Miniature Image */}
                            {modalType !== 'song' && (
                                <FileUploader
                                    label={modalType === 'album' ? "Pochette de l'Album (Image PNG/JPG)" : "Miniature Vidéo (Image PNG/JPG)"}
                                    accept="image/*"
                                    bucket="covers"
                                    required={!editingItem}
                                    helperText="Glissez ou sélectionnez l'image pour mettre à jour la pochette"
                                    currentPreviewUrl={formData.thumbnail_url}
                                    onUploadSuccess={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                                />
                            )}

                            {/* 2. Upload / Remplacement du Fichier Réel (Audio MP3 ou Vidéo MP4) */}
                            <FileUploader
                                label={modalType === 'clip' || (modalType === 'teaching' && formData.category === 'teaching_video') ? "Fichier Vidéo HD (MP4 / WebM)" : "Fichier Audio HD (MP3 / WAV)"}
                                accept={modalType === 'clip' || (modalType === 'teaching' && formData.category === 'teaching_video') ? "video/*" : "audio/*"}
                                bucket="media"
                                required={!editingItem && modalType !== 'album'}
                                helperText={editingItem ? "Optionnel : sélectionnez un nouveau fichier pour remplacer l'actuel" : (modalType === 'clip' ? "Sélectionnez le clip vidéo MP4" : "Sélectionnez le fichier audio MP3")}
                                currentPreviewUrl={formData.media_url}
                                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, media_url: url }))}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Artiste / Orateur</label>
                                    <input
                                        type="text"
                                        value={formData.speaker_or_artist}
                                        onChange={(e) => setFormData({ ...formData, speaker_or_artist: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold normal-case font-normal"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Durée (Ex: 04:30)</label>
                                    <input
                                        type="text"
                                        placeholder="04:30"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold normal-case font-normal"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-gold text-dark py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-dark hover:text-white transition-all shadow-md cursor-pointer"
                            >
                                {saving ? 'Enregistrement en cours...' : editingItem ? '💾 Enregistrer les Modifications' : '🚀 Publier Immédiatement sur l\'App'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMusic;
