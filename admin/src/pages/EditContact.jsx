import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { Input, Button } from '../components/ui/Form';

const EditContact = () => {
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase.from('pages').select('content').eq('slug', 'contact').single();
            if (data) reset(data.content);
        };
        fetchContact();
    }, [reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('pages').update({ content: data }).eq('slug', 'contact');
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Modifier "Contact"</h1>
                {success && <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">Enregistré !</span>}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Coordonnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Téléphone" name="phone" register={register} />
                    <Input label="Email" name="email" register={register} />
                    <Input label="Adresse" name="address" register={register} />
                    <Input label="WhatsApp Link" name="whatsapp" register={register} />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={loading}>Enregistrer</Button>
                </div>
            </form>
        </div>
    );
};

export default EditContact;
