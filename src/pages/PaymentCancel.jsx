import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';

const PaymentCancel = () => {
    return (
        <Layout>
            <div className="pt-36 pb-24 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-6 max-w-xl text-center">
                    
                    {/* Icône d'annulation */}
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <XCircle size={44} />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-widest text-amber-600 font-mono">Transaction Interrompue</span>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark mt-2 mb-4">
                        Paiement Non Finalisé
                    </h1>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                        Vous avez interrompu ou annulé votre paiement sur la passerelle GeniusPay. Aucun débit n'a été effectué sur votre compte Mobile Money ou carte bancaire.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/events"
                            className="bg-gold text-dark hover:bg-dark hover:text-white px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} />
                            <span>Réessayer la Réservation</span>
                        </Link>
                        
                        <a
                            href="https://wa.me/2250556018787?text=Bonjour%20AKNEL%20Event,%20j'ai%20besoin%20d'aide%20pour%20finaliser%20mon%20achat%20de%20billet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-2 border-gray-300 text-gray-700 hover:border-dark hover:text-dark px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={16} />
                            <span>Assistance WhatsApp</span>
                        </a>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default PaymentCancel;
