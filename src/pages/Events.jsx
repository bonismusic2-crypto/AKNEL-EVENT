import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { Calendar, MapPin, Tag, Loader2, Info } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('public_events')
                .select('*, ticket_types(*)');
            
            if (error) {
                console.error('Error fetching events:', error);
            } else {
                setEvents(data);
            }
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const handleReserve = (eventTitle) => {
        const text = encodeURIComponent(`Bonjour AKNEL Event, je souhaite réserver ma place pour l'événement : ${eventTitle}`);
        window.open(`https://wa.me/2250556018787?text=${text}`, '_blank');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }),
            full: date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl animate-pulse">
            Chargement de la programmation...
        </div>
    );

    return (
        <Layout>
            <div className="pt-32 pb-24 bg-dark relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-gold rounded-full blur-[100px]"></div>
                </div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 uppercase tracking-widest">
                        Agenda <span className="text-gold">Public</span>
                    </h1>
                    <p className="text-gray-400 text-lg uppercase tracking-widest leading-relaxed">Vivez l'expérience Aknel en direct</p>
                </div>
            </div>

            <div className="py-24 container mx-auto px-6">
                {events.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Info className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-serif italic text-lg">Aucun événement public n'est programmé pour le moment.</p>
                        <p className="text-sm text-gray-400 mt-2">Revenez bientôt pour découvrir nos prochaines dates !</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => {
                            const date = formatDate(event.date);
                            const minPrice = event.ticket_types?.length > 0 
                                ? Math.min(...event.ticket_types.map(t => t.price)) 
                                : null;

                            return (
                                <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-500">
                                    <div className="h-64 bg-gray-900 relative">
                                        <div className="absolute top-4 left-4 bg-gold text-dark font-bold px-4 py-2 rounded-lg text-center shadow-lg z-10">
                                            <span className="block text-xl leading-none">{date.day}</span>
                                            <span className="text-[10px] uppercase tracking-tighter">{date.month}</span>
                                        </div>
                                        {event.image_url ? (
                                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-serif italic">Pas d'image</div>
                                        )}
                                    </div>
                                    <div className="p-8 space-y-4 flex-grow">
                                        <div className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.2em]">
                                            <Tag size={12} /> {event.status === 'upcoming' ? 'Prochainement' : event.status}
                                        </div>
                                        <h2 className="text-2xl font-serif font-bold text-dark group-hover:text-gold transition-colors line-clamp-2">{event.title}</h2>
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed italic">{event.description}</p>
                                        <div className="pt-4 border-t border-gray-50 space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <MapPin size={14} className="text-gold" /> {event.venue_name || event.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar size={14} className="text-gold" /> {date.full}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 pt-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">À partir de</span>
                                            <span className="text-xl font-serif font-bold text-dark">
                                                {minPrice ? `${minPrice.toLocaleString()} FCFA` : 'Entrée Libre'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleReserve(event.title)}
                                            className="w-full bg-dark text-white hover:bg-gold px-6 py-4 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-gold/20 shadow-dark/5"
                                        >
                                            Réserver ma place
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Events;
