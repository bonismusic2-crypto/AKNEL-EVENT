-- Mise à jour des informations de contact
UPDATE public.pages 
SET content = jsonb_set(
    jsonb_set(
        jsonb_set(
            content, 
            '{phone}', 
            '"+225 05 56 01 87 87"'
        ),
        '{address}',
        '"Abidjan Cocody Rivera Palmeraie"'
    ),
    '{whatsapp}',
    '"https://wa.me/2250556018787"'
)
WHERE slug = 'contact';
