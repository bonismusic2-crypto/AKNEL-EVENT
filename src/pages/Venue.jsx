import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Check, Calendar, Users, Clock, Send, CheckCircle2, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const Venue = () => {
    const [formLoading, setFormLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        date: '',
        guestCount: '',
        eventType: 'Mariage',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        
        try {
            const { error } = await supabase.from('reservations').insert([{
                client: formData.name,
                service: formData.eventType,
                date: formData.date,
                status: 'En attente'
            }]);

            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting reservation:', err);
            alert('Une erreur est survenue lors de l\'envoi de votre demande.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Layout>
            {/* Hero Section */}
            <div className="relative h-[70vh] bg-dark flex items-center justify-center overflow-hidden">
                <motion.div 
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 opacity-40 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${heroBg})` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-transparent to-dark"></div>
                
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-gold text-sm md:text-base uppercase tracking-[0.4em] mb-4 block font-bold">Lieu d'Exception</span>
                        <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 uppercase tracking-widest leading-tight">
                            L'Espace <span className="text-gold">AKNEL</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl font-light italic max-w-2xl mx-auto">
                            Le cadre idéal pour accueillir vos plus grandes célébrations jusqu'à 400 convives.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Hall Introduction */}
            <div className="py-24 container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <span className="text-gold text-xs font-bold uppercase tracking-widest">Cocody Riviera Palmeraie</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-dark leading-tight">
                            Une Grande Salle <br />
                            <span className="text-gold italic">Modulable & Prestigieuse</span>
                        </h2>
                        <div className="w-20 h-1 bg-gold"></div>
                    </div>
                    
                    <p className="text-gray-600 text-lg leading-relaxed font-light">
                        Située dans le quartier sécurisé et accessible de <strong>Cocody Riviera Palmeraie</strong>, la salle AKNEL Event combine standing moderne, acoustique soignée et vaste espace pour loger jusqu'à <strong>400 personnes</strong> dans des conditions optimales de confort et d'élégance.
                    </p>

                    <div className="grid grid-cols-2 gap-8 py-4">
                        <div className="space-y-2 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                            <span className="text-gold font-serif text-4xl font-black">400</span>
                            <p className="text-xs uppercase tracking-widest text-dark font-bold">Capacité jusqu'à 400 Personnes</p>
                        </div>
                        <div className="space-y-2 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                            <span className="text-gold font-serif text-4xl font-black">100%</span>
                            <p className="text-xs uppercase tracking-widest text-dark font-bold">Climatisé & Sécurisé</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle2 size={18} className="text-gold shrink-0" />
                            <span>Mobilier complet (Chaises Napoléon blanches/or, tables rondes & rectangulaires)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle2 size={18} className="text-gold shrink-0" />
                            <span>Grand parking privé sécurisé pour l'ensemble des invités</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle2 size={18} className="text-gold shrink-0" />
                            <span>Espace cuisine dédié pour les équipes traiteurs</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="absolute -inset-4 border border-gold/20 rounded-2xl -z-10 rotate-3 animate-pulse"></div>
                    <div className="h-[550px] rounded-2xl overflow-hidden shadow-2xl relative group bg-gray-900">
                        <img 
                            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop" 
                            alt="Aperçu de la Grande Salle" 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent flex items-end p-8">
                            <span className="text-white font-serif text-2xl font-bold">L'Excellence Événementielle</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reservation Form Section */}
            <div className="py-24 bg-dark relative overflow-hidden text-white">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-4xl font-serif font-bold leading-tight">
                                Réservez <span className="text-gold italic">Votre Date</span>
                            </h2>
                            <p className="text-gray-400 text-base font-light leading-relaxed">
                                Remplissez ce formulaire pour recevoir un devis personnalisé et vérifier la disponibilité de l'Espace AKNEL pour votre célébration.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm tracking-widest uppercase text-white">Réponse Rapide</h4>
                                        <p className="text-xs text-gray-400">Sous 24h ouvrées</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm tracking-widest uppercase text-white">Grande Capacité</h4>
                                        <p className="text-xs text-gray-400">Jusqu'à 400 personnes assises</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full bg-white text-dark p-8 md:p-10 rounded-3xl shadow-2xl">
                            {submitted ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold">Demande Reçue !</h3>
                                    <p className="text-gray-600 text-sm">
                                        Notre équipe vous recontactera dans les plus brefs délais avec une proposition détaillée.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Nom Complet</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                            placeholder="Ex: Madame Koffi"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Date Souhaitée</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Nb d'Invités</label>
                                            <input 
                                                type="number" 
                                                required
                                                max="400"
                                                value={formData.guestCount}
                                                onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                                placeholder="Max 400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Type d'Événement</label>
                                        <select 
                                            value={formData.eventType}
                                            onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                        >
                                            <option value="Mariage">Mariage</option>
                                            <option value="Gala / Soirée">Gala / Soirée</option>
                                            <option value="Anniversaire">Anniversaire</option>
                                            <option value="Séminaire / Entreprise">Séminaire / Entreprise</option>
                                            <option value="Concert / Célébration">Concert / Célébration</option>
                                        </select>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={formLoading}
                                        className="w-full bg-gold text-dark hover:bg-dark hover:text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                                    >
                                        {formLoading ? 'Envoi en cours...' : 'Envoyer la Demande de Devis'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Venue;
