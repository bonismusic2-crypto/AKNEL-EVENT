import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Calendar, MapPin, Tag, Check, ShieldCheck, Ticket, CreditCard, Sparkles, QrCode, X } from 'lucide-react';
import { GeniusPayWebService } from '../services/geniusPayService';

const Events = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
    const [paying, setPaying] = useState(false);
    const [issuedTicket, setIssuedTicket] = useState(null);

    const upcomingEvents = [
        {
            id: 1,
            title: 'Concert de Louange & Adoration Prophétique',
            artist: 'Chantre Boniface & Invités Spéciaux',
            date: 'Samedi 20 Septembre 2026 à 18h30',
            location: 'AKNEL Hall, Cocody Riviera Palmeraie, Abidjan',
            image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
            description: "Une soirée unique d'élévation spirituelle, d'adoration et de célébration dans le cadre luxueux d'AKNEL Hall.",
            ticketTypes: [
                { id: 'standard', name: 'Pass Standard', price: 5000, desc: 'Accès en salle, placement libre' },
                { id: 'vip', name: 'Pass VIP Prestige', price: 15000, desc: "Placement privilégié devant de scène + Cocktail d'accueil offert" },
                { id: 'gold', name: "Pass Carré d'Or", price: 25000, desc: "Table VIP réservée + Rencontre privée avec l'artiste + Reçu dédicacé" },
            ]
        }
    ];

    const openCheckout = (event, ticket) => {
        setSelectedEvent(event);
        setSelectedTicket(ticket);
        setIssuedTicket(null);
        setShowCheckoutModal(true);
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        setPaying(true);

        try {
            const result = await GeniusPayWebService.createTicketPayment({
                event: selectedEvent,
                ticket: selectedTicket,
                customer: customerInfo,
                quantity: 1,
            });

            setIssuedTicket({
                tx_id: result.tx_id,
                qr_token: 'AKNEL-PASS-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                event_title: selectedEvent.title,
                ticket_name: selectedTicket.name,
                price: selectedTicket.price,
                buyer_name: customerInfo.name,
                date: selectedEvent.date,
            });
        } catch (err) {
            alert('Erreur lors du traitement du paiement Sandbox.');
        } finally {
            setPaying(false);
        }
    };

    return (
        <Layout>
            {/* Header */}
            <div className="pt-32 pb-16 bg-dark text-white text-center relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <span className="text-gold text-xs font-bold tracking-widest uppercase mb-2 block font-mono">
                        Paiement Sécurisé GeniusPay Sandbox
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black mb-4 uppercase tracking-wide">
                        Agenda & <span className="text-gold">Billetterie</span>
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto font-light">
                        Réservez vos pass officiels en direct avec Wave, Orange Money, MTN, Moov et Carte Bancaire.
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
                                                    onClick={() => openCheckout(event, ticket)}
                                                    className="mt-6 w-full bg-dark text-white hover:bg-gold hover:text-dark py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors duration-300 shadow-sm flex items-center justify-center gap-2"
                                                >
                                                    <CreditCard size={14} />
                                                    <span>Acheter via GeniusPay</span>
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
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-dark">Passage en Caisse Sécurisé GeniusPay</h4>
                                            <p className="text-xs text-gray-500">Intégration Sandbox Wave, Orange Money, MTN, Moov et Carte Bancaire.</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gold shrink-0 font-mono">Clés Sandbox Actives</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL CHECKOUT GENIUSPAY SANDBOX */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowCheckoutModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-dark font-bold text-xl"
                        >
                            ✕
                        </button>

                        {!issuedTicket ? (
                            <>
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest mb-2">
                                        <Sparkles size={12} /> Guichet GeniusPay Sandbox
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-dark">{selectedTicket?.name}</h3>
                                    <p className="text-gray-500 text-xs mt-1">{selectedEvent?.title}</p>
                                    <div className="text-3xl font-black text-gold mt-3">
                                        {selectedTicket?.price.toLocaleString()} <span className="text-sm font-bold text-dark">FCFA</span>
                                    </div>
                                </div>

                                <form onSubmit={handleConfirmPayment} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Nom & Prénoms</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Jean Koffi"
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="jean@gmail.com"
                                                value={customerInfo.email}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Mobile Money</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="0700000000"
                                                value={customerInfo.phone}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                    </div>

                                    {/* Logos Paiement */}
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-600 font-bold">Moyens acceptés :</span>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 rounded bg-[#1BA4E8] text-white text-[10px] font-black">Wave</span>
                                            <span className="px-2 py-0.5 rounded bg-[#FF6600] text-white text-[10px] font-black">Orange</span>
                                            <span className="px-2 py-0.5 rounded bg-[#FFCC00] text-black text-[10px] font-black">MTN</span>
                                            <span className="px-2 py-0.5 rounded bg-[#1A1F71] text-white text-[10px] font-black">VISA</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={paying}
                                        className="w-full bg-gold text-dark py-4 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-dark hover:text-white transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck size={16} />
                                        {paying ? 'Validation Sandbox en cours...' : `Régler ${selectedTicket?.price.toLocaleString()} FCFA`}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* BILLET ÉLECTRONIQUE AVEC QR CODE GÉNÉRÉ */
                            <div className="text-center space-y-6 py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <Check size={32} />
                                </div>

                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-green-600">Paiement Validé avec Succès !</span>
                                    <h3 className="text-2xl font-serif font-bold text-dark mt-1">{issuedTicket.ticket_name}</h3>
                                    <p className="text-gray-500 text-xs">{issuedTicket.event_title}</p>
                                </div>

                                {/* Pass Virtuel */}
                                <div className="p-6 rounded-2xl bg-dark text-white text-left relative overflow-hidden shadow-xl border border-gold/30">
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-3">
                                        <div>
                                            <span className="text-gold text-[10px] font-mono font-bold tracking-widest uppercase">AKNEL EVENT PASS</span>
                                            <h4 className="text-base font-bold">{issuedTicket.buyer_name}</h4>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-gold">{issuedTicket.price.toLocaleString()} FCFA</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1 text-xs text-gray-300">
                                            <p><span className="text-gray-500">Date :</span> {issuedTicket.date}</p>
                                            <p><span className="text-gray-500">Lieu :</span> AKNEL Hall, Cocody Riviera</p>
                                            <p className="font-mono text-[10px] text-gold pt-2">{issuedTicket.qr_token}</p>
                                        </div>
                                        <div className="w-20 h-20 bg-white rounded-xl p-2 flex items-center justify-center text-dark shrink-0">
                                            <QrCode size={64} className="text-dark" />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400">
                                    Présentez ce Pass électronique ou faites une capture d'écran pour l'accès en salle le jour de l'événement.
                                </p>

                                <button
                                    onClick={() => setShowCheckoutModal(false)}
                                    className="w-full bg-dark text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gold hover:text-dark transition-all"
                                >
                                    Fermer le Guichet
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Events;
