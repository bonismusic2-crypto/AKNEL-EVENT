import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Phone, Mail, MapPin } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import useContent from '../hooks/useContent';

const Contact = () => {
    const { data: contactInfo, loading } = useContent('contact');
    const [form, setForm] = useState({
        name: '', phone: '', email: '', type: '', date: '', message: ''
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Merci de votre demande !");
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-serif text-gold text-2xl">Chargement...</div>;

    if (!contactInfo) {
        return (
            <Layout>
                <div className="h-screen flex items-center justify-center flex-col text-center px-4">
                    <h1 className="text-3xl text-red-500 mb-4 font-serif">Contenu non trouvé</h1>
                    <p className="text-gray-500">Les coordonnées n'ont pas pu être chargées.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="relative py-32 bg-dark flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Contactez-nous</h1>
                </div>
            </div>

            {/* ... keeping the rest of the form the same, just updating contact info ... */}
            <section className="py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16">

                        {/* Contact Info */}
                        <div className="lg:w-1/3 space-y-10">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-dark mb-6">Nos Coordonnées</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-dark">Téléphone</h5>
                                            <p className="text-gray-600">{contactInfo.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold shrink-0">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-dark">Email</h5>
                                            <p className="text-gray-600">{contactInfo.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-dark">Adresse</h5>
                                            <p className="text-gray-600">{contactInfo.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form -- kept same for brevity, can make fields dynamic if needed but usually standard */}
                        <div className="lg:w-2/3 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-serif font-bold text-dark mb-6">Demander un Devis</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nom Complet</label>
                                        <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Téléphone</label>
                                        <input type="tel" name="phone" required onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Message</label>
                                    <textarea name="message" rows="4" onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"></textarea>
                                </div>
                                <Button type="submit" variant="solid" className="w-full py-4 text-lg">Envoyer la demande</Button>
                            </form>
                        </div>
                    </div>

                    {/* Google Maps Section */}
                    <div className="mt-16">
                        <h2 className="text-3xl font-serif font-bold text-center text-dark mb-8">Notre Localisation</h2>
                        <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.4247697841543!2d-3.9827405!3d5.3563896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1ed6c90e0e0cd%3A0x4e3e8e3e8e3e8e3e!2sCocody%20Rivera%20Palmeraie!5e0!3m2!1sfr!2sci!4v1234567890123"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Localisation AKNEL Event"
                            />
                        </div>
                        <div className="text-center mt-4">
                            <a
                                href="https://maps.app.goo.gl/ZayzYYadqpB7cRHo7?g_st=awb"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-gold hover:text-yellow-600 font-medium transition-colors"
                            >
                                <MapPin size={20} />
                                Ouvrir dans Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Contact;
