import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, Plus, Edit2, Trash2, Film, BookOpen, Layers, CheckCircle2, AlertCircle, Disc } from 'lucide-react';
import { FileUploader } from '../components/admin-ui/FileUploader';

const ManageMusic = () => {
    const [activeTab, setActiveTab] = useState('albums'); // 'albums', 'clips', 'teachings'
    const [albums, setAlbums] = useState([]);
    const [mediaContents, setMediaContents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Formulaire d'ajout
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('album'); // 'album', 'clip', 'teaching'
    const [formData, setFormData] = useState({
        title: '',
        album_id: '', // Lier le clip ou le titre à un album précis
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

    const handleCreateMedia = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modalType === 'album') {
                // 1. Création d'un Album Audio
                const { data: newAlbum, error } = await supabase.from('albums').insert([{
                    title: formData.title,
                    price: parseFloat(formData.price) || 0,
                    cover_url: formData.thumbnail_url,
                    artist_name: formData.speaker_or_artist || 'Chantre Boniface',
                    release_date: new Date().toISOString()
                }]).select();
                if (error) throw error;

                // Si un fichier audio MP3 initial a été joint lors de la création de l'album
                if (formData.media_url && newAlbum && newAlbum[0]) {
                    await supabase.from('songs').insert([{
                        album_id: newAlbum[0].id,
                        title: formData.title,
                        audio_url: formData.media_url,
                        duration: formData.duration || '04:30',
                    }]);
                }
            } else if (modalType === 'song') {
                // 2. Ajout d'un Morceau Audio dans un Album existant
                const { error } = await supabase.from('songs').insert([{
                    album_id: formData.album_id || (albums[0] ? albums[0].id : null),
                    title: formData.title,
                    audio_url: formData.media_url,
                    duration: formData.duration || '04:30',
                }]);
                if (error) throw error;
            } else {
                // 3. Ajout d'un Clip Vidéo HD lié à un Album ou d'un Enseignement
                const { error } = await supabase.from('media_contents').insert([{
                    title: formData.title,
                    album_id: formData.album_id || null, // Liaison directe du clip à son album parent
                    category: modalType === 'clip' ? 'video_clip' : formData.category,
                    media_url: formData.media_url,
                    thumbnail_url: formData.thumbnail_url,
                    duration: formData.duration || '05:00',
                    speaker_or_artist: formData.speaker_or_artist || 'Chantre Boniface'
                }]);
                if (error) throw error;
            }

            setShowModal(false);
            setFormData({
                title: '',
                album_id: '',
                category: 'video_clip',
                media_url: '',
                thumbnail_url: '',
                duration: '',
                price: '0',
                speaker_or_artist: 'Chantre Boniface',
                year: '2026'
            });
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
                        Publiez des albums, des pistes audios, des clips vidéos rattachés aux albums et des enseignements spirituels.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => { setModalType('album'); setShowModal(true); }}
                        className="bg-dark text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-gold hover:text-dark transition-all shadow-md cursor-pointer"
                    >
                        <Plus size={16} /> 1. Créer un Album
                    </button>
                    <button
                        onClick={() => { setModalType('song'); setShowModal(true); }}
                        className="bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-700 transition-all shadow-md cursor-pointer"
                    >
                        <Plus size={16} /> 2. Ajouter Chanson dans Album
                    </button>
                    <button
                        onClick={() => { setModalType('clip'); setShowModal(true); }}
                        className="bg-gold text-dark px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-dark hover:text-white transition-all shadow-md cursor-pointer"
                    >
                        <Plus size={16} /> 3. Ajouter Clip Vidéo dans Album
                    </button>
                    <button
                        onClick={() => { setModalType('teaching'); setShowModal(true); }}
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
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">Album Officiel</span>
                                                    <h3 className="text-lg font-serif font-bold text-dark mt-1 leading-tight">{album.title}</h3>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {album.songs?.length || 0} chansons • {relatedClips.length} clips vidéo
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Liste des chansons dans cet album */}
                                            {album.songs && album.songs.length > 0 && (
                                                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5 border border-gray-100">
                                                    <p className="text-[10px] font-extrabold uppercase text-gray-400">Pistes Audio ({album.songs.length})</p>
                                                    {album.songs.slice(0, 3).map((s, idx) => (
                                                        <div key={s.id || idx} className="flex justify-between items-center text-xs text-gray-700">
                                                            <span className="truncate font-medium">{idx + 1}. {s.title}</span>
                                                            <span className="text-[10px] text-gray-400 font-mono">{s.duration || '04:30'}</span>
                                                        </div>
                                                    ))}
                                                    {album.songs.length > 3 && (
                                                        <p className="text-[10px] text-gold font-bold text-center pt-1">+ {album.songs.length - 3} autres titres</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                            <span className="text-green-600 font-bold">● Streaming Illimité Débloqué</span>
                                            <button
                                                onClick={() => handleDeleteAlbum(album.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                title="Supprimer l'album"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">
                                                    {parentAlbum ? `Clip de l'album: ${parentAlbum.title}` : 'Clip Vidéo HD'}
                                                </span>
                                                <h3 className="text-base font-serif font-bold text-dark mt-1 leading-tight">{item.title}</h3>
                                                <p className="text-gray-500 text-xs mt-1">{item.duration || '04:30'} • {item.speaker_or_artist || 'Chantre Boniface'}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                            <span className="text-green-600 font-bold">● Vidéo 4K Débloquée</span>
                                            <button
                                                onClick={() => handleDeleteMedia(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark bg-gray-100 px-2 py-0.5 rounded">
                                                {item.category === 'teaching_audio' ? '🎙️ Audio' : '🎥 Vidéo'}
                                            </span>
                                            <h3 className="text-base font-serif font-bold text-dark mt-1 leading-tight">{item.title}</h3>
                                            <p className="text-gray-500 text-xs mt-1">{item.duration || '15:00'} • {item.speaker_or_artist || 'Chantre Boniface'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                        <span className="text-green-600 font-bold">● Streaming Illimité VIP</span>
                                        <button
                                            onClick={() => handleDeleteMedia(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* MODAL D'AJOUT DE CONTENU */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-serif font-bold text-dark">
                                {modalType === 'album' ? '1. Nouvel Album Officiel' : modalType === 'song' ? '2. Nouvelle Chanson dans un Album' : modalType === 'clip' ? '3. Nouveau Clip Vidéo lié à un Album' : '4. Nouvel Enseignement'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark font-bold text-lg cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleCreateMedia} className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-700">
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

                            {/* 1. Upload de la Pochette / Miniature Image (pour Albums, Clips et Enseignements) */}
                            {modalType !== 'song' && (
                                <FileUploader
                                    label={modalType === 'album' ? "Pochette de l'Album (Image PNG/JPG)" : "Miniature Vidéo (Image PNG/JPG)"}
                                    accept="image/*"
                                    bucket="covers"
                                    required={true}
                                    helperText="Glissez ou sélectionnez l'image depuis votre ordinateur"
                                    currentPreviewUrl={formData.thumbnail_url}
                                    onUploadSuccess={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                                />
                            )}

                            {/* 2. Upload du Fichier Réel (MP3 pour Chansons / Albums, MP4 pour Clips et Vidéos) */}
                            <FileUploader
                                label={modalType === 'clip' || (modalType === 'teaching' && formData.category === 'teaching_video') ? "Fichier Vidéo HD (MP4 / WebM)" : "Fichier Audio HD (MP3 / WAV)"}
                                accept={modalType === 'clip' || (modalType === 'teaching' && formData.category === 'teaching_video') ? "video/*" : "audio/*"}
                                bucket="media"
                                required={modalType !== 'album'}
                                helperText={modalType === 'clip' ? "Sélectionnez le clip vidéo MP4" : "Sélectionnez le fichier audio MP3 de la chanson"}
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
                                {saving ? 'Enregistrement et Téléversement...' : 'Publier Immédiatement sur l\'App'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMusic;
