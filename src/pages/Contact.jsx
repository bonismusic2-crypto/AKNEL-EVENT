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

    return (
        <Layout>
            <div className="relative py-32 bg-dark flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl font-serif font-bold text-white mb-4">Contactez-nous</h1>
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
                </div>
            </section>
        </Layout>
    );
};

export default Contact;
