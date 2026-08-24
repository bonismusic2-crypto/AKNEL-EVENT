import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, MoreHorizontal } from 'lucide-react';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            const { data } = await supabase.from('reservations').select('*').order('date', { ascending: true });
            if (data) setReservations(data);
        };
        fetchReservations();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmé': return 'bg-green-100 text-green-700';
            case 'En attente': return 'bg-gold/20 text-gold-dark';
            case 'Terminé': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif font-bold text-dark">Réservations</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-500">Client</th>
                            <th className="p-4 text-sm font-semibold text-gray-500">Type d'événement</th>
                            <th className="p-4 text-sm font-semibold text-gray-500">Date Prévue</th>
                            <th className="p-4 text-sm font-semibold text-gray-500">Statut</th>
                            <th className="p-4 text-sm font-semibold text-gray-500"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reservations.map(res => (
                            <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-dark">{res.client}</td>
                                <td className="p-4 text-gray-600">{res.service}</td>
                                <td className="p-4 text-gray-500">{res.date}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(res.status)}`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-400 hover:text-dark"><MoreHorizontal size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reservations;
