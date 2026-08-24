import React from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Users, MapPin, CheckCircle, ArrowRight, ShieldCheck, HeartHandshake, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <Layout>
            {/* 1. Hero Section Prestige */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-dark text-white pt-20">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600"
                        alt="AKNEL Event Hall"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/30 z-1" />

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> Grande Salle Événementielle & Organisation de Luxe
                        </div>

                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-white mb-6 leading-tight uppercase tracking-wide">
                            Sublimez Vos <span className="text-gold">Moments</span> Inoubliables
                        </h1>

                        <p className="text-base sm:text-xl text-gray-200 mb-10 font-light max-w-3xl mx-auto leading-relaxed">
                            Située à <strong>Cocody Riviera Palmeraie</strong>, AKNEL Event vous offre un vaste espace d'exception pouvant accueillir <strong>jusqu'à 400 personnes</strong> et une conciergerie d'organisation clé en main pour vos mariages, galas, séminaires et célébrations de prestige.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/contact">
                                <Button variant="solid" className="w-full sm:w-auto text-sm uppercase tracking-widest px-8 py-4">
                                    Réserver la Salle
                                </Button>
                            </Link>
                            <Link to="/events">
                                <Button variant="outline" className="w-full sm:w-auto text-sm uppercase tracking-widest px-8 py-4 border-white text-white hover:bg-white hover:text-dark">
                                    Billetterie Concerts & Galas
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Les Atouts de Notre Grande Salle (Cocody) */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-gold text-xs font-bold tracking-widest uppercase mb-2 block">Un Cadre Prestigieux</span>
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-dark uppercase tracking-wide mb-4">
                            Une Grande Salle d'Exception au Cœur d'Abidjan
                        </h2>
                        <p className="text-gray-600 text-base leading-relaxed">
                            Un grand espace modulable, moderne et chaleureux entièrement conçu pour accueillir vos événements privés et d'entreprises dans un confort absolu.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gold/50 transition-all duration-300 hover:shadow-lg group">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-white transition-colors">
                                <Users size={28} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-dark mb-3">Capacité jusqu'à 400 Personnes</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Vaste salle modulable en format banquet, cocktail ou conférence pour accueillir de grandes réceptions sans contrainte d'espace.
                            </p>
                            <ul className="space-y-2 text-xs text-gray-500 font-medium">
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-gold" /> Mobilier banquet & chaises Napoléon inclus</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-gold" /> Espace scène, piste de danse et estrade d'honneur</li>
                            </ul>
                        </div>

                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gold/50 transition-all duration-300 hover:shadow-lg group">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-white transition-colors">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-dark mb-3">Équipements & Sécurité</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Climatisation intégrale haute performance, sonorisation pro, éclairages d'ambiance et parking privé sécurisé.
                            </p>
                            <ul className="space-y-2 text-xs text-gray-500 font-medium">
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-gold" /> Grand parking sécurisé pour tous vos convives</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-gold" /> Cuisine équipée pour service traiteur haut de gamme</li>
                            </ul>
                        </div>

                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gold/50 transition-all duration-300 hover:shadow-lg group">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-white transition-colors">
                                <HeartHandshake size={28} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-dark mb-3">Organisation Clés en Main</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Notre équipe d'experts prend en charge la décoration sur-mesure, le traiteur gastronomique et la régie jour J.
                            </p>
                            <ul className="space-y-2 text-xs text-gray-500 font-medium">
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-gold" /> Coordination complète sans stress</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-gold" /> Formules personnalisées selon votre budget</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/venue" className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-dark hover:text-gold transition-colors">
                            <span>Découvrir tous les équipements de la salle</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. Billetterie & Concerts en Direct */}
            <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <span className="text-gold text-xs font-bold tracking-widest uppercase mb-2 block">Agenda Événementiel</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark uppercase">
                                Prochains Concerts & Événements
                            </h2>
                        </div>
                        <Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-dark hover:text-gold">
                            Voir toute la programmation <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Carte Événement Phare */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 grid lg:grid-cols-12 gap-8 items-center p-6 md:p-8">
                        <div className="lg:col-span-5 h-64 lg:h-80 rounded-2xl overflow-hidden bg-gray-900 relative">
                            <img
                                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"
                                alt="Concert de Louange"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-gold text-dark font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider">
                                Billetterie Ouverte
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-4">
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                                <span className="flex items-center gap-1.5"><Calendar size={15} className="text-gold" /> Prochainement</span>
                                <span className="flex items-center gap-1.5"><MapPin size={15} className="text-gold" /> AKNEL Hall, Cocody Riviera Palmeraie</span>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-dark">
                                Soirée de Célébration & Concert avec le Chantre Boniface
                            </h3>

                            <p className="text-gray-600 text-sm leading-relaxed">
                                Venez vivre une atmosphère prophétique et de communion intense. Réservez votre place directement en ligne via Wave, Orange Money, MTN ou Carte bancaire.
                            </p>

                            <div className="pt-4 flex flex-wrap gap-4 items-center">
                                <Link to="/events">
                                    <Button variant="solid" className="text-xs uppercase tracking-widest px-6 py-3.5">
                                        Prendre mon Pass (Standard / VIP)
                                    </Button>
                                </Link>
                                <span className="text-xs text-gray-500 font-medium">Paiement sécurisé via GeniusPay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Passerelle vers l'App Mobile Bonis Musik */}
            <section className="py-20 bg-dark text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 border border-gold/30 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 rounded-3xl bg-gold/10 border border-gold/40 flex items-center justify-center text-gold shrink-0">
                            <Smartphone size={48} />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div className="inline-block bg-gold text-dark text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                Application Mobile Officielle
                            </div>
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">
                                Découvrez l'Application Bonis Musik
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Accédez à tous les albums, clips vidéos HD et enseignements spirituels du Chantre Boniface en streaming illimité pour seulement <strong>2 € / mois (~1 300 FCFA)</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Appel à l'Action Devis & Contact */}
            <section className="py-24 bg-white text-center">
                <div className="container mx-auto px-6 max-w-3xl">
                    <span className="text-gold text-xs font-bold tracking-widest uppercase mb-2 block">Votre Projet sur-mesure</span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-dark uppercase mb-6">
                        Prêt à Organiser Votre Événement ?
                    </h2>
                    <p className="text-gray-600 text-base mb-8 leading-relaxed">
                        Contactez notre équipe dès aujourd'hui pour planifier une visite de notre grand espace événementiel de 400 places ou obtenir un devis personnalisé.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact">
                            <Button variant="solid" className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-widest">
                                Demander un Devis Gratuit
                            </Button>
                        </Link>
                        <a
                            href="https://wa.me/2250556018787?text=Bonjour%20AKNEL%20Event,%20je%20souhaite%20des%20informations%20pour%20une%20r%C3%A9servation%20de%20salle"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 border-2 border-dark text-dark hover:bg-dark hover:text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-colors duration-300"
                        >
                            Échanger sur WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Home;
