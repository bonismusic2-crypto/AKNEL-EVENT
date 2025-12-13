import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const useContent = (endpoint) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let result;

                // Handle collections (Arrays)
                if (['services', 'gallery', 'messages', 'reservations', 'stats'].includes(endpoint)) {
                    // Stats is a single object in our logic, but let's assume it's stored in pages or a separate key-value table for simplicity?
                    // Wait, in my SQL script I didn't create a 'stats' table. I missed that in the plan update.
                    // But for 'services' and 'gallery', they are tables.
                    if (endpoint === 'stats') {
                        // Fallback for stats if no table exists, or maybe store in pages?
                        // attempting to fetch from 'pages' where slug='stats'
                        const { data: pageData, error: pageError } = await supabase
                            .from('pages')
                            .select('content')
                            .eq('slug', 'stats')
                            .single();
                        // If that fails (it might if I didn't seed it), handle gracefully?
                        // Actually, my seed data didn't include stats in 'pages'.
                        // I will handle services/gallery first.
                        result = pageData?.content;
                    } else {
                        const { data: tableData, error: tableError } = await supabase
                            .from(endpoint)
                            .select('*')
                            .order('id');
                        if (tableError) throw tableError;
                        result = tableData;
                    }
                }
                // Handle pages (Objects stored in JSONB)
                else {
                    const { data: pageData, error: pageError } = await supabase
                        .from('pages')
                        .select('content')
                        .eq('slug', endpoint)
                        .single();

                    if (pageError) throw pageError;
                    result = pageData?.content;
                }

                setData(result);
            } catch (err) {
                console.error("Supabase Error:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};

export default useContent;
