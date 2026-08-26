import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, Plus, Edit2, Trash2, Film, BookOpen, Layers, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
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
                const { error } = await supabase.from('albums').insert([{
                    title: formData.title,
                    price: parseFloat(formData.price) || 0,
                    cover_url: formData.thumbnail_url,
                    artist_name: formData.speaker_or_artist || 'Chantre Boniface',
                    release_date: new Date().toISOString()
                }]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('media_contents').insert([{
                    title: formData.title,
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
        if (!window.confirm('Supprimer cet album ?')) return;
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
                        Publiez des albums audio, clips vidéo HD et enseignements spirituels visibles instantanément dans l'application mobile.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setModalType('album'); setShowModal(true); }}
                        className="bg-dark text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-gold hover:text-dark transition-all shadow-md"
                    >
                        <Plus size={16} /> Ajouter un Album
                    </button>
                    <button
                        onClick={() => { setModalType('clip'); setShowModal(true); }}
                        className="bg-gold text-dark px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-dark hover:text-white transition-all shadow-md"
                    >
                        <Plus size={16} /> Publier un Clip / Enseignement
                    </button>
                </div>
            </div>

            {/* Onglets de Filtrage des Médias */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-md">
                <button
                    onClick={() => setActiveTab('albums')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'albums' ? 'bg-gold text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                >
                    <Music size={15} /> Albums ({albums.length})
                </button>
                <button
                    onClick={() => setActiveTab('clips')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'clips' ? 'bg-gold text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                >
                    <Film size={15} /> Clips ({mediaContents.filter(m => m.category === 'video_clip').length})
                </button>
                <button
                    onClick={() => setActiveTab('teachings')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'teachings' ? 'bg-gold text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
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
                    {/* 1. Onglet ALBUMS AUDIO */}
                    {activeTab === 'albums' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {albums.map((album) => (
                                <div key={album.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                                    <div className="flex gap-4 items-center mb-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-gray-400 shrink-0">
                                            {album.cover_url ? (
                                                <img src={album.cover_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Music size={28} className="text-gold" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">Album Mobile</span>
                                            <h3 className="text-lg font-serif font-bold text-dark mt-1 leading-tight">{album.title}</h3>
                                            <p className="text-gray-500 text-xs mt-1">{album.songs?.length || 0} titres audio • {album.artist_name || 'Chantre Boniface'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                        <span className="text-green-600 font-bold">● En ligne sur l'app</span>
                                        <button
                                            onClick={() => handleDeleteAlbum(album.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 2. Onglet CLIPS VIDÉOS */}
                    {activeTab === 'clips' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mediaContents.filter(m => m.category === 'video_clip').map((clip) => (
                                <div key={clip.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="h-40 bg-gray-900 relative">
                                        {clip.thumbnail_url ? (
                                            <img src={clip.thumbnail_url} className="w-full h-full object-cover opacity-85" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500"><Film size={36} /></div>
                                        )}
                                        <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                            {clip.duration || '05:00'}
                                        </span>
                                    </div>
                                    <div className="p-5 flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">Clip Vidéo HD</span>
                                            <h3 className="text-base font-bold text-dark mt-1">{clip.title}</h3>
                                            <p className="text-gray-400 text-xs mt-1">{clip.views_count || 0} vues</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMedia(clip.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. Onglet ENSEIGNEMENTS */}
                    {activeTab === 'teachings' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mediaContents.filter(m => m.category.includes('teaching')).map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 items-center mb-4">
                                        <div className="w-16 h-16 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0">
                                            <BookOpen size={24} />
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
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-serif font-bold text-dark">
                                {modalType === 'album' ? 'Nouvel Album Audio' : 'Nouveau Média (Clip / Prédication)'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark font-bold text-lg">✕</button>
                        </div>

                        <form onSubmit={handleCreateMedia} className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                            <div>
                                <label className="block mb-1">Titre de l'Œuvre</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Jésus règne à jamais"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold normal-case"
                                />
                            </div>

                            {modalType !== 'album' && (
                                <div>
                                    <label className="block mb-1">Type de Contenu</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                    >
                                        <option value="video_clip">🎬 Clip Vidéo Officiel HD</option>
                                        <option value="teaching_video">🎥 Enseignement / Prédication Vidéo</option>
                                        <option value="teaching_audio">🎙️ Enseignement / Podcast Audio</option>
                                    </select>
                                </div>
                            )}

                            {/* 1. Upload de la Pochette / Miniature Image */}
                            <FileUploader
                                label={modalType === 'album' ? "Pochette de l'Album (Image)" : "Miniature du Média (Image)"}
                                accept="image/*"
                                bucket="covers"
                                required={true}
                                helperText="Sélectionnez l'image PNG / JPG depuis votre ordinateur"
                                currentPreviewUrl={formData.thumbnail_url}
                                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                            />

                            {/* 2. Upload du Média Réel (Fichier Vidéo MP4 ou Audio MP3) */}
                            {modalType !== 'album' && (
                                <FileUploader
                                    label={formData.category === 'teaching_audio' ? "Fichier Audio (MP3 / WAV)" : "Fichier Vidéo HD (MP4 / WebM)"}
                                    accept={formData.category === 'teaching_audio' ? "audio/*" : "video/*"}
                                    bucket="media"
                                    required={true}
                                    helperText={formData.category === 'teaching_audio' ? "Sélectionnez le fichier audio MP3 de l'enseignement" : "Sélectionnez la vidéo MP4 du clip ou de la prédication"}
                                    currentPreviewUrl={formData.media_url}
                                    onUploadSuccess={(url) => setFormData(prev => ({ ...prev, media_url: url }))}
                                />
                            )}

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
                                className="w-full bg-gold text-dark py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-dark hover:text-white transition-all shadow-md"
                            >
                                {saving ? 'Enregistrement en direct...' : 'Publier Immédiatement sur l\'App'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMusic;
