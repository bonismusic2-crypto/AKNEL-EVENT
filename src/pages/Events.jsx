import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Calendar, MapPin, Tag, Check, ShieldCheck, Ticket, CreditCard, ChevronRight } from 'lucide-react';

const Events = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);

    const upcomingEvents = [
        {
            id: 1,
            title: 'Concert de Louange & Adoration Prophétique',
            artist: 'Chantre Boniface & Invités Spéciaux',
            date: 'Samedi 20 Septembre 2026 à 18h30',
            location: 'AKNEL Hall, Cocody Riviera Palmeraie, Abidjan',
            image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
            description: 'Une soirée unique d''élévation spirituelle, d''adoration et de célébration dans le cadre luxueux d''AKNEL Hall.',
            ticketTypes: [
                { id: 'standard', name: 'Pass Standard', price: 5000, desc: 'Accès en salle, placement libre' },
                { id: 'vip', name: 'Pass VIP Prestige', price: 15000, desc: 'Placement privilégié devant de scène + Cocktail d''accueil offert' },
                { id: 'gold', name: 'Pass Carré d''Or', price: 25000, desc: 'Table VIP réservée + Rencontre privée avec l''artiste + Reçu dédicacé' },
            ]
        }
    ];

    const handleBuyTicket = (event, ticket) => {
        const text = encodeURIComponent(`Bonjour AKNEL Event, je souhaite acheter le ${ticket.name} (${ticket.price} FCFA) pour : ${event.title}`);
        window.open(`https://wa.me/2250556018787?text=${text}`, '_blank');
    };

    return (
        <Layout>
            {/* Header */}
            <div className="pt-32 pb-16 bg-dark text-white text-center relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <span className="text-gold text-xs font-bold tracking-widest uppercase mb-2 block">Billetterie Officielle</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black mb-4 uppercase tracking-wide">
                        Agenda & <span className="text-gold">Billetterie</span>
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto font-light">
                        Réservez vos places en toute sécurité pour les prochains concerts et célébrations exclusifs hébergés à AKNEL Event.
                    </p>
                </div>
            </div>

            {/* Liste des Événements & Guichet */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 max-w-5xl">
                    {upcomingEvents.map((event) => (
                        <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-12">
                            {/* Bannière Image */}
                            <div className="relative h-72 md:h-96 bg-gray-900">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover opacity-85"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <span className="bg-gold text-dark font-black px-3 py-1 rounded-md text-xs uppercase tracking-wider mb-2 inline-block">
                                        Billetterie Ouverte
                                    </span>
                                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
                                        {event.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-300">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gold" /> {event.date}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold" /> {event.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu et Choix des Pass */}
                            <div className="p-6 md:p-10 space-y-8">
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-dark mb-2">À Propos de l'Événement</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Grille des Pass & Tarifs */}
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-dark mb-4 flex items-center gap-2">
                                        <Ticket size={20} className="text-gold" /> Sélectionnez Votre Catégorie de Billet
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {event.ticketTypes.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="border-2 border-gray-100 hover:border-gold rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between bg-gray-50/50 hover:bg-white hover:shadow-md"
                                            >
                                                <div className="space-y-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{ticket.name}</span>
                                                    <div className="text-2xl font-black text-dark">
                                                        {ticket.price.toLocaleString()} <span className="text-xs font-bold text-gold">FCFA</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
                                                        {ticket.desc}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => handleBuyTicket(event, ticket)}
                                                    className="mt-6 w-full bg-dark text-white hover:bg-gold hover:text-dark py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors duration-300 shadow-sm flex items-center justify-center gap-2"
                                                >
                                                    <CreditCard size={14} />
                                                    <span>Prendre mon Pass</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Paiement GeniusPay Réassurance */}
                                <div className="p-6 rounded-2xl bg-gold/5 border border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={28} className="text-gold shrink-0" />
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-dark">Paiement Mobile Money Sécurisé</h4>
                                            <p className="text-xs text-gray-500">Règlement instantané via Wave, Orange Money, MTN, Moov & Carte Bancaire.</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gold shrink-0">Pass délivré immédiatement</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Events;
