import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { Input, TextArea, Button } from '../components/ui/Form';

const EditAbout = () => {
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchAbout = async () => {
            const { data } = await supabase.from('pages').select('content').eq('slug', 'about').single();
            if (data) reset(data.content);
        };
        fetchAbout();
    }, [reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('pages').update({ content: data }).eq('slug', 'about');
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
                <h1 className="text-2xl font-bold text-slate-800">Modifier "À Propos"</h1>
                {success && <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">Enregistré !</span>}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
                <Input label="Titre Héro" name="hero_title" register={register} />
                <Input label="Titre Principal" name="main_title" register={register} />
                <TextArea label="Texte Principal" name="text" register={register} rows="6" />

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={loading}>Enregistrer</Button>
                </div>
            </form>
        </div>
    );
};

export default EditAbout;
