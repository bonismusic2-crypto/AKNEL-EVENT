-- Mise à jour de la page About pour clarifier l'offre double
UPDATE public.pages 
SET content = '{
    "hero_title": "Notre Histoire",
    "main_title": "Une salle d''exception et une expertise événementielle",
    "text": "AKNEL Event, c''est bien plus qu''un simple lieu : c''est un espace prestigieux situé à Cocody Rivera Palmeraie ET une équipe d''experts en organisation d''événements. Que vous cherchiez simplement à louer notre magnifique salle pour votre événement ou que vous souhaitiez bénéficier de notre accompagnement complet, nous mettons notre savoir-faire à votre service.",
    "values": [
        { "title": "Notre Salle", "desc": "Un espace moderne et élégant de 200m² pouvant accueillir jusqu''à 150 personnes, entièrement équipé." },
        { "title": "Notre Expertise", "desc": "Une équipe passionnée qui organise vos mariages, galas, séminaires et célébrations de A à Z." },
        { "title": "Votre Choix", "desc": "Location simple de la salle OU organisation complète : vous choisissez la formule qui vous convient." }
    ]
}'::jsonb
WHERE slug = 'about';

-- Mise à jour de la page Home pour refléter l'offre double
UPDATE public.pages 
SET content = jsonb_set(
    content,
    '{intro,text}',
    '"AKNEL Event vous propose sa magnifique salle événementielle située à Cocody Rivera Palmeraie. Louez simplement notre espace pour votre événement ou bénéficiez de notre service complet d''organisation : décoration, traiteur, coordination, et bien plus encore."'
)
WHERE slug = 'home';
