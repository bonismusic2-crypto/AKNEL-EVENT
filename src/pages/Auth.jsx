import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (loginError) throw loginError;
            } else {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        }
                    }
                });
                if (signUpError) throw signUpError;
                
                // If the user profile isn't created automatically by a trigger, 
                // we could do it here, but typically Supabase triggers are better.
            }
            navigate('/profile');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen py-32 flex items-center justify-center bg-gray-50 px-6">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-dark p-8 text-center text-white">
                        <h1 className="text-3xl font-serif font-bold text-gold">
                            {isLogin ? 'Connexion' : 'Inscription'}
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {isLogin ? 'Accédez à vos tickets et votre musique' : 'Rejoignez la communauté Aknel'}
                        </p>
                    </div>
                    
                    <form className="p-8 space-y-6" onSubmit={handleAuth}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-shake">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {!isLogin && (
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="opacity-50" size={20} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Nom complet" 
                                        required 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-medium"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="password" 
                                    placeholder="Mot de passe" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-dark text-white hover:bg-gold-dark py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : null}
                            {isLogin ? 'Se connecter' : "S'inscrire"}
                        </button>

                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-gray-500 hover:text-gold transition-colors font-medium"
                            >
                                {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Auth;
