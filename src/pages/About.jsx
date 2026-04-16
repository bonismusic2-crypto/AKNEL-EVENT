import React from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Heart, Target, Award } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import useContent from '../hooks/useContent';

const About = () => {
    const { data, loading } = useContent('about');

    if (loading) return <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl">Chargement...</div>;

    if (!data || !data.hero_title) {
        return (
            <Layout>
                <div className="h-screen flex items-center justify-center flex-col text-center px-4">
                    <h1 className="text-3xl text-red-500 mb-4 font-serif">Contenu non trouvé</h1>
                    <p className="text-gray-500">Les données de la page À propos n'ont pas pu être chargées.</p>
                </div>
            </Layout>
        );
    }

    const getIcon = (index) => {
        const icons = [<Heart size={32} />, <Target size={32} />, <Award size={32} />];
        return icons[index % icons.length];
    };

    return (
        <Layout>
            {/* Header */}
            <div className="relative py-32 bg-dark flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">{data.hero_title}</h1>
                </div>
            </div>

            {/* Story Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl font-serif font-bold text-dark mb-6">{data.main_title}</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>{data.text}</p>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                            <div className="h-64 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-500">
                                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop" alt="Event details" className="w-full h-full object-cover" />
                            </div>
                            <div className="h-64 rounded-lg overflow-hidden shadow-lg mt-8 transform hover:-translate-y-2 transition-transform duration-500">
                                <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop" alt="Decoration" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-serif font-bold text-dark mb-16">Nos Valeurs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {data.values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-white p-8 rounded-xl shadow-md border-t-4 border-gold"
                                whileHover={{ y: -5 }}
                            >
                                <div className="text-gold mb-6 flex justify-center">{getIcon(idx)}</div>
                                <h3 className="text-xl font-serif font-bold mb-4">{val.title}</h3>
                                <p className="text-gray-500">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default About;
