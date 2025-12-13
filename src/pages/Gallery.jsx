import React from 'react';
import Layout from '../components/layout/Layout';
import heroBg from '../assets/hero-bg.png';
import useContent from '../hooks/useContent';

const Gallery = () => {
    const { data: galleryData, loading } = useContent('gallery');

    // Fallback if loading or empty
    const images = galleryData || Array(6).fill({ id: 'loading', src: null, category: 'Loading...' });

    return (
        <Layout>
            <div className="relative py-32 bg-dark flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Notre Galerie</h1>
                    <p className="text-gold text-lg uppercase tracking-widest">Inspirations & Réalisations</p>
                </div>
            </div>

            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img, idx) => (
                            <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 cursor-pointer shadow-md hover:shadow-xl transition-all">
                                {img.type === 'video' ? (
                                    <video
                                        src={img.src}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                    />
                                ) : img.src ? (
                                    <img src={img.src} alt={img.category} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-serif">
                                        <span>Image {idx + 1}</span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                                    <span className="text-gold font-bold uppercase tracking-wider mb-2">{img.category}</span>
                                    <span className="text-white font-serif border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors">
                                        {img.type === 'video' ? 'Lire la Vidéo' : 'Voir'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Video Placeholder (Requested in prompt) */}
                    <div className="mt-20">
                        <h2 className="text-3xl font-serif font-bold text-center mb-10">En Vidéo</h2>
                        <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white/50 w-full max-w-4xl mx-auto shadow-2xl">
                            <span className="text-xl">Vidéo de présentation (Placeholder)</span>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Gallery;
