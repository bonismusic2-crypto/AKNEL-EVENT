import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { Input, Button } from '../components/ui/Form';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';

const EditGallery = () => {
    const { register, handleSubmit, reset } = useForm();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchImages = async () => {
        const { data } = await supabase.from('gallery').select('*').order('id', { ascending: false });
        if (data) setImages(data);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const onAddImage = async (data) => {
        // Handle file upload
        const file = data.image[0];
        if (!file) return alert("Veuillez sélectionner une image");

        setLoading(true);
        try {
            // 1. Upload to Supabase Storage
            const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: publicURLData } = supabase.storage
                .from('gallery')
                .getPublicUrl(fileName);

            const publicUrl = publicURLData.publicUrl;

            // 3. Save to Database
            // Detect if file is video
            const isVideo = file.type.startsWith('video/');
            const mediaType = isVideo ? 'video' : 'image';

            const { error: dbError } = await supabase.from('gallery').insert([{
                src: publicUrl,
                category: data.category || 'General',
                alt: file.name,
                type: mediaType
            }]);

            if (dbError) throw dbError;

            reset();
            fetchImages();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'envoi : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const onDeleteImage = async (id, src) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette image ?')) return;

        try {
            // 1. Delete from Database
            await supabase.from('gallery').delete().eq('id', id);

            // 2. Try to delete from Storage if it's a hosted image
            if (src && src.includes('storage')) {
                const path = src.split('/').pop();
                // Note: simple extraction, may need robustness for nested paths
                await supabase.storage.from('gallery').remove([path]);
            }

            fetchImages();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800">Gestion de la Galerie</h1>

            {/* Add Image/Video Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">
                    <Plus size={20} className="text-gold" /> Ajouter Photo/Vidéo
                </h3>
                <form onSubmit={handleSubmit(onAddImage)} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fichier (Photo ou Vidéo)</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            {...register('image', { required: true })}
                            className="w-full px-3 py-2 border rounded-lg bg-white border-slate-300"
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                        <select {...register('category')} className="w-full px-3 py-2 border rounded-lg bg-white border-slate-300">
                            <option value="Mariage">Mariage</option>
                            <option value="Gala">Gala</option>
                            <option value="Entreprise">Entreprise</option>
                        </select>
                    </div>
                    <div className="pb-1">
                        <Button type="submit" isLoading={loading}>Uploader</Button>
                    </div>
                </form>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        {img.type === 'video' ? (
                            <video src={img.src} className="w-full h-full object-cover" muted loop onMouseOver={(e) => e.target.play()} onMouseOut={(e) => e.target.pause()} />
                        ) : img.src ? (
                            <img src={img.src} alt={img.category} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <ImageIcon size={32} />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                            <div className="flex gap-2">
                                <span className="text-white text-xs font-bold uppercase tracking-wider bg-gold px-2 py-1 rounded w-fit">
                                    {img.category}
                                </span>
                                {img.type === 'video' && <span className="text-white text-xs font-bold uppercase bg-red-600 px-2 py-1 rounded w-fit">Vidéo</span>}
                            </div>
                            <button
                                onClick={() => onDeleteImage(img.id, img.src)}
                                className="bg-red-500 text-white p-2 rounded-full self-end hover:bg-red-600 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditGallery;
