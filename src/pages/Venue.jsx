import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Check, Calendar, Users, Clock, Send, CheckCircle2 } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import useContent from '../hooks/useContent';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const Venue = () => {
    const { data: services, loading } = useContent('services');
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

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl animate-pulse">
            Chargement de l'espace...
        </div>
    );

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
                        <span className="text-gold text-sm md:text-base uppercase tracking-[0.4em] mb-4 block">Lieu de Prestige</span>
                        <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 uppercase tracking-widest leading-tight">
                            L'Espace <span className="text-gold-gradient">Aknel</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl font-light italic max-w-2xl mx-auto">
                            Où chaque événement devient une légende.
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
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-dark leading-tight">
                            Un sanctuaire <br />
                            <span className="text-gold-gradient italic">pour vos célébrations</span>
                        </h2>
                        <div className="w-20 h-1 bg-gold"></div>
                    </div>
                    
                    <p className="text-gray-600 text-lg leading-relaxed font-light">
                        Située au cœur d'Abidjan, la salle AKNEL Event harmonise luxe contemporain et flexibilité architecturale. Conçue pour sublimer vos instants les plus précieux, elle s'adapte à toutes vos exigences de mise en scène.
                    </p>

                    <div className="grid grid-cols-2 gap-8 py-4">
                        <div className="space-y-2">
                            <span className="text-gold font-serif text-3xl font-bold">500+</span>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Capacité Assise</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-gold font-serif text-3xl font-bold">800m²</span>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Espace Modulable</p>
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
                    <div className="h-[600px] rounded-2xl overflow-hidden shadow-2xl relative group bg-gray-900">
                        <img 
                            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop" 
                            alt="Aperçu de la Salle" 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent flex items-end p-8">
                            <span className="text-white font-serif text-2xl">L'Élégance à l'état pur</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reservation Form Section */}
            <div className="py-24 bg-dark relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px]"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
                        <div className="lg:w-1/2 space-y-8 text-white">
                            <h2 className="text-4xl font-serif font-bold leading-tight">
                                Réservez <span className="text-gold italic">votre date</span>
                            </h2>
                            <p className="text-gray-400 text-lg font-light leading-relaxed">
                                Remplissez ce formulaire pour recevoir un devis personnalisé et vérifier la disponibilité de l'Espace Aknel pour votre événement.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm tracking-widest uppercase">Réponse Rapide</h4>
                                        <p className="text-xs text-gray-500">Sous 24h ouvrées</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm tracking-widest uppercase">Visite Privée</h4>
                                        <p className="text-xs text-gray-400">Sur rendez-vous uniquement</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full">
                            <div className="bg-white p-10 rounded-3xl shadow-2xl space-y-8">
                                <AnimatePresence mode="wait">
                                    {!submitted ? (
                                        <motion.form 
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit} 
                                            className="space-y-6"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Nom complet</label>
                                                    <input 
                                                        type="text" required
                                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                                        placeholder="Votre nom" 
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-sm font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Email</label>
                                                    <input 
                                                        type="email" required
                                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                                        placeholder="votre@email.com" 
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-sm font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Date estimée</label>
                                                    <input 
                                                        type="date" required
                                                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-sm font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Type d'événement</label>
                                                    <select 
                                                        value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})}
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-sm font-medium"
                                                    >
                                                        <option>Mariage</option>
                                                        <option>Gala / Soirée</option>
                                                        <option>Séminaire / Entreprise</option>
                                                        <option>Anniversaire</option>
                                                        <option>Autre</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Message ou exigences</label>
                                                <textarea 
                                                    rows="4"
                                                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                                                    placeholder="Dites-nous en plus sur vos besoins..." 
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-sm font-medium resize-none"
                                                ></textarea>
                                            </div>

                                            <button 
                                                disabled={formLoading}
                                                className="w-full bg-dark text-white hover:bg-gold-dark py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-xl shadow-dark/10 flex items-center justify-center gap-3 active:scale-[0.98]"
                                            >
                                                {formLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send size={16} />}
                                                Envoyer ma demande
                                            </button>
                                        </motion.form>
                                    ) : (
                                        <motion.div 
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-12 text-center space-y-6"
                                        >
                                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <h3 className="text-3xl font-serif font-bold text-dark">Demande Envoyée !</h3>
                                            <p className="text-gray-500 leading-relaxed">
                                                Merci {formData.name}, votre demande de devis a été transmise avec succès. <br />
                                                Notre équipe vous contactera d'ici peu.
                                            </p>
                                            <button 
                                                onClick={() => setSubmitted(false)}
                                                className="text-gold font-bold uppercase tracking-widest text-xs hover:underline pt-4"
                                            >
                                                Envoyer une autre demande
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Venue;
