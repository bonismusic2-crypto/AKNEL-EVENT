import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { Input, TextArea, Button } from '../components/ui/Form';

const EditHome = () => {
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Fetch current data
        const fetchHome = async () => {
            const { data, error } = await supabase.from('pages').select('content').eq('slug', 'home').single();
            if (data) reset(data.content);
        };
        fetchHome();
    }, [reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('pages')
                .update({ content: data })
                .eq('slug', 'home');

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Modifier la Page d'Accueil</h1>
                {success && <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">Modifications enregistrées !</span>}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">

                {/* Hero Section */}
                <section>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Section Héro (Haut de page)</h3>
                    <div className="grid gap-4">
                        <Input label="Titre Principal" name="hero.title" register={register} />
                        <TextArea label="Sous-titre" name="hero.subtitle" register={register} rows="2" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Texte Bouton 1" name="hero.buttonText" register={register} />
                            <Input label="Lien Bouton 1" name="hero.buttonUrl" register={register} />
                        </div>
                    </div>
                </section>

                {/* Intro Section */}
                <section>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Introduction</h3>
                    <div className="grid gap-4">
                        <Input label="Titre Intro" name="intro.title" register={register} />
                        <TextArea label="Texte d'introduction" name="intro.text" register={register} rows="4" />
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={loading}>Enregistrer les modifications</Button>
                </div>
            </form>
        </div>
    );
};

export default EditHome;
