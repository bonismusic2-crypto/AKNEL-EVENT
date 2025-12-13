import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, CheckCircle, Clock } from 'lucide-react';

const Messages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase.from('messages').select('*').order('date', { ascending: false });
            if (data) setMessages(data);
        };
        fetchMessages();
    }, []);

    const toggleRead = async (id, currentStatus) => {
        // Optimistic update
        const newMessages = messages.map(msg => msg.id === id ? { ...msg, read: !currentStatus } : msg);
        setMessages(newMessages);

        await supabase.from('messages').update({ read: !currentStatus }).eq('id', id);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif font-bold text-dark">Messagerie</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-500">Statut</th>
                            <th className="p-4 text-sm font-semibold text-gray-500">Nom</th>
                            <th className="p-4 text-sm font-semibold text-gray-500">Sujet</th>
                            <th className="p-4 text-sm font-semibold text-gray-500">Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {messages.map(msg => (
                            <tr key={msg.id} className={`hover:bg-gray-50 transition-colors ${!msg.read ? 'bg-blue-50/30' : ''}`}>
                                <td className="p-4">
                                    {msg.read ? <CheckCircle size={18} className="text-green-500" /> : <Clock size={18} className="text-blue-500" />}
                                </td>
                                <td className="p-4 font-medium text-dark">{msg.name}</td>
                                <td className="p-4 text-gray-600">{msg.subject}</td>
                                <td className="p-4 text-gray-400 text-sm">{msg.date}</td>
                                <td className="p-4">
                                    <button onClick={() => toggleRead(msg.id, msg.read)} className="text-xs font-bold text-gold hover:underline">
                                        {msg.read ? 'Marquer non-lu' : 'Marquer lu'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Messages;
