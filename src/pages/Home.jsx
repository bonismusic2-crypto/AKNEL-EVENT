import React from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Star, Calendar, Music, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero-bg.png';
import useContent from '../hooks/useContent';

const Home = () => {
    const { data: homeData, loading: homeLoading } = useContent('home');
    const { data: servicesData, loading: servicesLoading } = useContent('services');

    if (homeLoading || servicesLoading) return <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl">Chargement...</div>;

    if (!homeData || !homeData.hero) {
        return (
            <Layout>
                <div className="h-screen flex items-center justify-center flex-col text-center px-4">
                    <h1 className="text-3xl text-red-500 mb-4 font-serif">Contenu non trouvé</h1>
                    <p className="text-gray-500">Les données de la page d'accueil n'ont pas pu être chargées. Veuillez vérifier Supabase.</p>
                </div>
            </Layout>
        );
    }

    // Function to map icon name to component (if dynamic icons are stored as strings later)
    // For now, hardcoding mapping based on index or title if needed, or keeping static icons for simplicity
    const getIcon = (index) => {
        const icons = [<Star size={24} />, <Music size={24} />, <Users size={24} />];
        return icons[index % icons.length];
    };

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                            {homeData.hero.title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 font-light tracking-wide">
                            {homeData.hero.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={homeData.hero.buttonUrl}>
                                <Button variant="solid" className="w-full sm:w-auto">{homeData.hero.buttonText}</Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="white" className="w-full sm:w-auto">Réserver maintenant</Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Intro Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 relative">
                            <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
                                <img src={heroBg} alt="About Aknel" className="w-full h-full object-cover object-center" />
                            </div>
                        </div>

                        <motion.div
                            className="order-1 md:order-2 space-y-6"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h4 className="text-gold uppercase tracking-widest font-semibold text-sm">À Propos d'AKNEL Event</h4>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-dark">{homeData.intro.title}</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {homeData.intro.text}
                            </p>
                            <ul className="space-y-4 pt-4">
                                {homeData.intro.values.map((val, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-dark font-medium">
                                        <span className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold"><Star size={16} /></span>
                                        {val}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Services Preview */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-serif font-bold text-dark mb-4">Nos Expertises</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {servicesData && servicesData.slice(0, 3).map((service, index) => (
                            <motion.div
                                key={service.id}
                                className="bg-white p-10 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                                    {getIcon(index)}
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-dark mb-3">{service.title}</h3>
                                <p className="text-gray-500 mb-6">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Home;
