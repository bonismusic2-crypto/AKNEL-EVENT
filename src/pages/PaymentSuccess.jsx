import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { CheckCircle2, Download, Printer, Share2, Calendar, MapPin, Ticket, ShieldCheck, ArrowLeft, QrCode } from 'lucide-react';

const PaymentSuccess = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    // Paramètres récupérés depuis l'URL ou fallback
    const txId = queryParams.get('tx_id') || queryParams.get('reference') || 'GP_' + Date.now().toString().slice(-8);
    const buyerName = queryParams.get('name') || 'Client Privilégié';
    const ticketName = queryParams.get('ticket') || 'Pass VIP Prestige';
    const amount = queryParams.get('amount') || '15 000';
    const eventTitle = queryParams.get('event') || 'Concert de Louange & Adoration Prophétique';
    const eventDate = 'Samedi 20 Septembre 2026 à 18h30';
    const qrToken = 'AKNEL-PASS-' + txId.slice(-6).toUpperCase();

    const handlePrint = () => {
        window.print();
    };

    return (
        <Layout>
            <div className="pt-32 pb-24 bg-gray-50 min-h-screen">
                <div className="container mx-auto px-6 max-w-3xl">
                    
                    {/* Carte de Confirmation */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md animate-bounce">
                            <CheckCircle2 size={44} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-green-600 font-mono">Paiement Validé avec Succès via GeniusPay</span>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-dark mt-2">
                            Félicitations pour Votre Réservation !
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Votre transaction <span className="font-mono text-dark font-bold">{txId}</span> a été confirmée. Votre billet électronique officiel est prêt ci-dessous.
                        </p>
                    </div>

                    {/* BILLET OFFICIEL IMPRIMABLE & TÉLÉCHARGEABLE */}
                    <div id="printable-ticket" className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/30 mb-8 print:shadow-none print:border print:m-0">
                        {/* Header Billet */}
                        <div className="bg-dark text-white p-6 md:p-8 flex justify-between items-start relative overflow-hidden">
                            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <Ticket size={12} /> Billet d'Accès Officiel
                                </div>
                                <h2 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight">
                                    {eventTitle}
                                </h2>
                                <p className="text-gold text-xs mt-1 font-bold">Chantre Boniface & Invités Spéciaux</p>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-2xl md:text-3xl font-black text-gold font-serif">{amount} <span className="text-xs font-bold text-white">FCFA</span></span>
                                <span className="block text-[10px] text-green-400 font-bold uppercase tracking-wider mt-1">● Payé</span>
                            </div>
                        </div>

                        {/* Corps du Billet */}
                        <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6 items-center">
                            <div className="md:col-span-8 space-y-4 text-xs">
                                <div>
                                    <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Titulaire du Pass</span>
                                    <span className="text-base font-bold text-dark">{buyerName}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Catégorie</span>
                                        <span className="font-bold text-dark text-sm">{ticketName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Date & Heure</span>
                                        <span className="font-bold text-dark">{eventDate}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Lieu de l'Événement</span>
                                    <span className="font-bold text-dark">AKNEL Hall, Cocody Riviera Palmeraie, Abidjan</span>
                                </div>
                            </div>

                            {/* Bloc QR Code */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                <div className="w-28 h-28 bg-white rounded-xl p-2 shadow-sm flex items-center justify-center mb-2">
                                    <QrCode size={96} className="text-dark" />
                                </div>
                                <span className="font-mono text-[10px] font-bold text-dark">{qrToken}</span>
                                <span className="text-[9px] text-gray-400 mt-1">À scanner à l'entrée</span>
                            </div>
                        </div>

                        {/* Footer Billet */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 gap-2">
                            <span>Émis par AKNEL Event SARL • Cocody Riviera Palmeraie</span>
                            <span>Transaction ID: {txId}</span>
                        </div>
                    </div>

                    {/* Actions : Télécharger / Imprimer / Retour */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                        <button
                            onClick={handlePrint}
                            className="bg-gold text-dark hover:bg-dark hover:text-white px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            <span>Télécharger / Imprimer le Reçu (PDF)</span>
                        </button>
                        
                        <Link to="/events" className="border-2 border-gray-300 text-gray-700 hover:border-dark hover:text-dark px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2">
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
