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

    // Comptes admin reconnus
    const validUsers = [
        { email: 'admin1@aknelevent.com', password: 'admin123' },
        { email: 'admin2@aknelevent.com', password: 'admin456' },
        { email: 'admin3@aknelevent.com', password: 'admin789' },
        { email: 'admin@aknelevent.com', password: 'admin' },
        { email: 'bonis@aknelevent.com', password: 'bonis' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // Vérification insensible aux espaces et à la casse
        const user = validUsers.find(
            (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
        );

        setTimeout(() => {
            if (user) {
                // Stocker l'authentification
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminEmail', cleanEmail);
                navigate('/admin');
            } else {
                setError('Email ou mot de passe incorrect. Assurez-vous d\'écrire le mot de passe sans espace supplémentaire.');
            }
            setLoading(false);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <img src={logo} alt="AKNEL Event" className="h-20 w-auto mx-auto mb-4" />
                    <p className="text-gray-500 mt-2 font-bold uppercase tracking-wider text-xs">Admin Dashboard</p>
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
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition text-dark"
                                placeholder="admin1@aknelevent.com"
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
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition text-dark"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg text-center font-medium leading-relaxed border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-dark font-bold py-3.5 rounded-lg hover:bg-dark hover:text-white transition-all duration-300 shadow-md uppercase tracking-wider text-sm disabled:opacity-50"
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
