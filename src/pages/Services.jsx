import React from 'react';
import Layout from '../components/layout/Layout';
import { Check } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import useContent from '../hooks/useContent';

const Services = () => {
    const { data: services, loading } = useContent('services');

    const serviceImages = [
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop", // Mariage
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop", // Events
        "https://images.unsplash.com/photo-1505364069818-4770db0ff2cc?q=80&w=2070&auto=format&fit=crop" // Corporate/Gala
    ];

    if (loading) return <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl">Chargement...</div>;

    if (!services || services.length === 0) {
        return (
            <Layout>
                <div className="h-screen flex items-center justify-center flex-col text-center px-4">
                    <h1 className="text-3xl text-gray-400 mb-4 font-serif">Nos Services</h1>
                    <p className="text-gray-500">Aucun service n'est disponible pour le moment.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="relative py-32 bg-dark flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Nos Services</h1>
                    <p className="text-gold text-lg uppercase tracking-widest">Une expertise à 360°</p>
                </div>
            </div>

            <div className="py-24 container mx-auto px-6 space-y-24">
                {services.map((service, idx) => (
                    <div key={idx} className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}>
                        <div className={`w-full md:w-1/2 h-80 rounded-xl shadow-lg overflow-hidden relative group`}>
                            <img 
                                src={service.image_url || serviceImages[idx % serviceImages.length]} 
                                alt={service.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>
                        <div className="w-full md:w-1/2 space-y-6">
                            <h2 className="text-3xl font-serif font-bold text-dark">{service.title}</h2>
                            <p className="text-gray-600 text-lg">{service.description}</p>
                            <ul className="space-y-3">
                                {service.features.map((feat, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-gray-700">
                                        <span className="text-gold"><Check size={20} /></span>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default Services;
