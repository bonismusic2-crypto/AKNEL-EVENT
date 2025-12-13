import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { Input, TextArea, Button } from '../components/ui/Form';

const EditServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase.from('services').select('*').order('id');
            if (data) setServices(data);
        };
        fetchServices();
    }, []);

    const onSubmit = async (e, index) => {
        e.preventDefault();
        const service = services[index];
        setLoading(true);
        try {
            const { error } = await supabase.from('services').update(service).eq('id', service.id);
            if (error) throw error;
            alert('Service mis à jour !');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...services];
        newServices[index] = { ...newServices[index], [field]: value };
        setServices(newServices);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-800">Modifier les Services</h1>

            {services.map((service, index) => (
                <div key={service.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 text-blue-600">Service {index + 1}</h3>
                    <form onSubmit={(e) => onSubmit(e, index)} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                            <input
                                value={service.title}
                                onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={service.description}
                                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows="2"
                            />
                        </div>
                        <Button type="submit" isLoading={loading}>Mettre à jour ce service</Button>
                    </form>
                </div>
            ))}
        </div>
    );
};

export default EditServices;
