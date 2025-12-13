import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, MessageSquare, Calendar, TrendingUp, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
            <h3 className="text-3xl font-bold text-dark mt-2">{value}</h3>
            {subtext && <p className="text-green-600 text-xs mt-2 font-medium flex items-center gap-1"><TrendingUp size={12} /> {subtext} cette semaine</p>}
        </div>
        <div className={`p-4 rounded-full ${color} text-white shadow-lg`}>
            {icon}
        </div>
    </div>
);

const DashboardHome = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await supabase.from('pages').select('content').eq('slug', 'stats').single();
            if (data) setStats(data.content);
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="p-8 text-center text-gray-500">Chargement des données...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-dark">Vue d'ensemble</h1>
                <p className="text-gray-500">Bienvenue sur votre tableau de bord administrateur.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Visiteurs Totaux"
                    value={stats.visitors}
                    icon={<Users size={24} />}
                    color="bg-blue-600"
                    subtext={stats.growth}
                />
                <StatCard
                    title="Nouveaux Messages"
                    value={stats.new_messages}
                    icon={<MessageSquare size={24} />}
                    color="bg-purple-600"
                />
                <StatCard
                    title="Réservations"
                    value={stats.pending_reservations}
                    icon={<Calendar size={24} />}
                    color="bg-gold"
                    subtext="En attente"
                />
                <StatCard
                    title="Performance"
                    value="98%"
                    icon={<Activity size={24} />}
                    color="bg-green-500"
                    subtext="Temps de réponse"
                />
            </div>

            {/* Recent Activity Mockup */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-dark mb-6 font-serif">Activité Récente</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-gray-600 text-sm"><span className="font-bold text-dark">Jean Dupont</span> a envoyé une demande de contact.</p>
                        <span className="text-xs text-gray-400 ml-auto">Il y a 2h</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-gold"></div>
                        <p className="text-gray-600 text-sm"><span className="font-bold text-dark">Tech Corp</span> a confirmé un devis Gala.</p>
                        <span className="text-xs text-gray-400 ml-auto">Il y a 5h</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
