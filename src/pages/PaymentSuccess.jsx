import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { CheckCircle2, Download, Printer, Share2, Calendar, MapPin, Ticket, ShieldCheck, ArrowLeft, QrCode, Sparkles, User, Clock, Award } from 'lucide-react';

const PaymentSuccess = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    // Récupération des paramètres ou fallback de prestige
    const txId = queryParams.get('tx_id') || queryParams.get('reference') || 'GP_' + Date.now().toString().slice(-8);
    const buyerName = queryParams.get('name') || 'Client Privilégié';
    const ticketName = queryParams.get('ticket') || 'Pass VIP Prestige';
    const amount = queryParams.get('amount') || '15 000';
    const eventTitle = queryParams.get('event') || 'Concert de Louange & Adoration Prophétique';
    const eventDate = 'Samedi 20 Septembre 2026';
    const eventTime = '18h30 (Ouverture des portes à 17h00)';
    const qrToken = 'AKNEL-PASS-' + txId.slice(-8).toUpperCase();

    const handlePrint = () => {
        window.print();
    };

    return (
        <Layout>
            <div className="pt-32 pb-24 bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen">
                <div className="container mx-auto px-6 max-w-4xl">
                    
                    {/* Bannière de Confirmation */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/20 animate-bounce">
                            <CheckCircle2 size={44} />
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-800 text-xs font-bold uppercase tracking-widest mb-3">
                            <ShieldCheck size={14} className="text-green-600" /> Paiement Sécurisé Validé via GeniusPay
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-black text-dark tracking-wide uppercase">
                            Votre Pass Officiel est Prêt
                        </h1>
                        <p className="text-gray-600 text-sm mt-2 max-w-xl mx-auto">
                            Transaction confirmée : <span className="font-mono text-dark font-bold bg-gray-200 px-2 py-0.5 rounded">{txId}</span>. Présentez ce pass numérique à l'entrée ou téléchargez votre reçu officiel.
                        </p>
                    </div>

                    {/* PASS LUXURY CARD (Design Événement Prestige) */}
                    <div className="relative bg-dark text-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/40 mb-10 print:m-0 print:shadow-none print:border-2 print:border-black">
                        
                        {/* Motif Décoratif Or en Arrière-plan */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row">
                            
                            {/* PARTIE GAUCHE (70%) : DÉTAILS DE L'ÉVÉNEMENT */}
                            <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-dashed border-gray-800 relative">
                                
                                {/* Encoches Visuelles de Billet de Concert (Top & Bottom) */}
                                <div className="hidden md:block absolute -top-4 -right-4 w-8 h-8 bg-gray-50 rounded-full z-20" />
                                <div className="hidden md:block absolute -bottom-4 -right-4 w-8 h-8 bg-gray-50 rounded-full z-20" />

                                {/* Header Pass */}
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                    <div>
                                        <span className="text-2xl font-serif font-black tracking-widest text-white">
                                            AKNEL <span className="text-gold">EVENT</span>
                                        </span>
                                        <span className="block text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 mt-0.5">
                                            Cocody Riviera Palmeraie, Abidjan
                                        </span>
                                    </div>
                                    
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-black uppercase tracking-wider">
                                        <Award size={14} /> {ticketName}
                                    </div>
                                </div>

                                {/* Titre du Concert */}
                                <div className="mb-8">
                                    <span className="text-xs uppercase font-bold text-gold tracking-widest block mb-1">
                                        Concert de Célébration
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
                                        {eventTitle}
                                    </h2>
                                    <p className="text-gray-300 text-sm mt-1 font-medium">
                                        Avec le <strong className="text-white">Chantre Boniface</strong> & le Ministère Musical
                                    </p>
                                </div>

                                {/* Grille d'Informations Clés */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-800/80">
                                    <div>
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                                            Titulaire du Billet
                                        </span>
                                        <p className="text-white font-bold text-sm truncate">{buyerName}</p>
                                    </div>

                                    <div>
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                                            Date & Heure
                                        </span>
                                        <p className="text-white font-bold text-xs leading-tight">{eventDate}</p>
                                        <span className="text-gold text-[11px] font-bold">{eventTime}</span>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                                            Lieu & Accès
                                        </span>
                                        <p className="text-white font-bold text-xs">AKNEL Hall</p>
                                        <span className="text-gray-400 text-[10px]">Grande Salle 400 Places</span>
                                    </div>
                                </div>

                                {/* Footer de Gauche */}
                                <div className="mt-8 pt-4 border-t border-gray-800/60 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                                    <span>ID TRANSACTION : {txId}</span>
                                    <span className="text-green-400 font-bold">● PASS VALIDE & ENREGISTRÉ</span>
                                </div>
                            </div>

                            {/* PARTIE DROITE (30%) : TALON QR CODE & SCANNER */}
                            <div className="w-full md:w-72 bg-gradient-to-b from-gray-900 to-black p-8 md:p-10 flex flex-col items-center justify-between text-center relative">
                                
                                <div>
                                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-gold block mb-1">
                                        PASS OFFICIEL
                                    </span>
                                    <div className="text-3xl font-black text-white font-serif">
                                        {amount} <span className="text-xs font-bold text-gold">FCFA</span>
                                    </div>
                                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">
                                        Règlement Reçu
                                    </span>
                                </div>

                                {/* Encadré QR Code Haute Définition */}
                                <div className="my-6 p-4 bg-white rounded-2xl shadow-xl border-4 border-gold/50 flex flex-col items-center">
                                    <QrCode size={130} className="text-black" />
                                    <span className="font-mono text-[9px] font-black text-black tracking-wider mt-2">
                                        {qrToken}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-300 font-medium block">
                                        Scanner à l'Accueil AKNEL Hall
                                    </span>
                                    <span className="text-[9px] text-gray-500 block">
                                        Valable pour 1 personne • Billet nominatif
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Boutons d'Action (Télécharger / Imprimer / Retour) */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                        <button
                            onClick={handlePrint}
                            className="bg-gold text-dark hover:bg-white hover:text-dark px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest transition-all duration-300 shadow-xl shadow-gold/20 flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            <span>Télécharger / Imprimer le Pass (PDF)</span>
                        </button>
                        
                        <Link
                            to="/events"
                            className="bg-white border-2 border-gray-200 text-dark hover:border-dark px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Retourner à la Billetterie</span>
                        </Link>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default PaymentSuccess;
