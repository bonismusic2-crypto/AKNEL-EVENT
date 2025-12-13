# AKNEL Event Website

Site web événementiel de luxe pour AKNEL Event avec dashboard administrateur.

## 🌟 Fonctionnalités

### Site Public
- Design luxueux Or & Noir
- 5 pages dynamiques (Home, About, Services, Gallery, Contact)
- Galerie photos & vidéos
- Bouton WhatsApp flottant
- Responsive design

### Admin Dashboard
- Gestion complète du contenu
- Upload de photos/vidéos vers le Cloud
- Gestion des messages & réservations
- Statistiques en temps réel

## 🛠️ Technologies

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase
- **Storage**: Supabase Storage
- **Icons**: Lucide React

## 🚀 Installation

```bash
# Installer les dépendances principales
npm install

# Installer les dépendances de l'admin
cd admin
npm install
cd ..
```

## 📦 Lancement

```bash
# Site Public (Port 5178)
npm run dev

# Admin Dashboard (Port 5179)
cd admin
npx vite --port 5179
```

## 🗄️ Configuration Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Exécuter les scripts SQL dans l'ordre :
   - `supabase_setup.sql` (Tables principales)
   - `supabase_update.sql` (Messages, Réservations, Stats)
   - `storage_setup.sql` (Bucket photos/vidéos)
   - `video_gallery_update.sql` (Support vidéo)
   - `update_whatsapp.sql` (Numéro WhatsApp)

3. Créer un bucket Storage public nommé `gallery`

4. Mettre à jour les credentials dans :
   - `src/lib/supabaseClient.js`
   - `admin/src/lib/supabaseClient.js`

## 📱 Contact

WhatsApp: +225 0556018787

---

Développé avec ❤️ pour AKNEL Event
