-- Mise à jour des services pour inclure la Location de Salle en premier

-- Supprimer les anciens services
DELETE FROM public.services;

-- Ajouter les nouveaux services avec Location de Salle en tête
INSERT INTO public.services (title, description, features) VALUES
(
    'Location de Salle Événementielle',
    'Notre magnifique salle de 200m² située à Cocody Rivera Palmeraie est disponible pour tous vos événements. Un espace moderne, élégant et entièrement équipé.',
    ARRAY[
        'Capacité jusqu''à 150 personnes',
        'Climatisation et sonorisation',
        'Parking privé sécurisé',
        'Tables, chaises et mobilier inclus',
        'Accès cuisine équipée',
        'Décoration de base fournie'
    ]
),
(
    'Organisation Complète d''Événements',
    'Notre équipe s''occupe de TOUT pour vous : de la conception à la réalisation. Mariages, galas, anniversaires, séminaires... Nous créons des moments inoubliables.',
    ARRAY[
        'Planification et coordination complète',
        'Décoration sur-mesure et design',
        'Traiteur et service gastronomique',
        'Animation et sonorisation',
        'Photographie et vidéographie',
        'Gestion des invités et protocole'
    ]
),
(
    'Formule Sur-Mesure',
    'Vous préférez gérer certains aspects vous-même ? Nous proposons aussi des formules à la carte : Location + Décoration, Location + Traiteur, ou tout autre combinaison selon vos besoins.',
    ARRAY[
        'Conseils et recommandations',
        'Coordination partielle',
        'Mise à disposition de notre réseau de prestataires',
        'Assistance logistique le jour J',
        'Flexibilité totale'
    ]
);
