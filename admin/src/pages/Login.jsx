import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Comptes admin hardcodés
    const validUsers = [
        { email: 'admin1@aknelevent.com', password: 'admin123' },
        { email: 'admin2@aknelevent.com', password: 'admin456' },
        { email: 'admin3@aknelevent.com', password: 'admin789' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Vérification des credentials
        const user = validUsers.find(
            (u) => u.email === email && u.password === password
        );

        setTimeout(() => {
            if (user) {
                // Stocker l'authentification
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminEmail', email);
                navigate('/');
            } else {
                setError('Email ou mot de passe incorrect');
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <img src={logo} alt="AKNEL Event" className="h-20 w-auto mx-auto mb-4" />
                    <p className="text-gray-500 mt-2">Admin Dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
                                placeholder="admin@aknelevent.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                {/* Info */}
                <div className="text-center text-xs text-gray-500">
                    <p>Accès réservé aux administrateurs</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
