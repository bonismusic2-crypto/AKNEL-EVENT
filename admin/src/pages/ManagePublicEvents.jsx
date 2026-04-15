import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Plus, Edit2, Trash2, Users, MapPin } from 'lucide-react';

const ManagePublicEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await supabase.from('public_events').select('*, ticket_types(*)').order('date', { ascending: true });
            if (data) setEvents(data);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700';
            case 'past': return 'bg-gray-100 text-gray-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-dark">Gestion Événements</h1>
                <button className="bg-dark text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-gold-dark transition-all shadow-lg">
                    <Plus size={18} /> Nouvel Événement
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-gold animate-pulse italic">Chargement de l'agenda...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.map(event => (
                        <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-md transition-shadow">
                            <div className="w-full md:w-32 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                {event.image_url ? <img src={event.image_url} className="w-full h-full object-cover" alt="" /> : <Calendar size={24} className="text-gray-400" />}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-serif font-bold text-dark">{event.title}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadge(event.status)}`}>
                                        {event.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={14} className="text-gold" /> {new Date(event.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} className="text-gold" /> {event.venue_name}</span>
                                    <span className="flex items-center gap-1"><Users size={14} className="text-gold" /> {event.ticket_types?.length || 0} types de tickets</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="p-3 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-xl transition-all"><Edit2 size={18} /></button>
                                <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 italic">Aucun événement trouvé. Créez votre première date !</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManagePublicEvents;
