import React from 'react';
import Layout from '../components/layout/Layout';
import { Check } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import useContent from '../hooks/useContent';

const Services = () => {
    const { data: services, loading } = useContent('services');

    if (loading) return <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl">Chargement...</div>;

    return (
        <Layout>
            <div className="relative py-32 bg-dark flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl font-serif font-bold text-white mb-4">Nos Services</h1>
                    <p className="text-gold text-lg uppercase tracking-widest">Une expertise à 360°</p>
                </div>
            </div>

            <div className="py-24 container mx-auto px-6 space-y-24">
                {services.map((service, idx) => (
                    <div key={idx} className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}>
                        <div className={`w-full md:w-1/2 h-80 rounded-xl shadow-lg bg-gray-200 flex items-center justify-center text-gray-400`}>
                            Image Service {service.id}
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
