-- Mettre à jour le numéro WhatsApp dans la page Contact
UPDATE public.pages 
SET content = jsonb_set(
    content, 
    '{whatsapp}', 
    '"https://wa.me/2250556018787"'
)
WHERE slug = 'contact';

-- Mettre à jour aussi le numéro de téléphone
UPDATE public.pages 
SET content = jsonb_set(
    content, 
    '{phone}', 
    '"+225 05 56 01 87 87"'
)
WHERE slug = 'contact';
