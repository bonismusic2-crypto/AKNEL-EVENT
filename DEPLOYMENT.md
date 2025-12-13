# 🚀 Guide de Déploiement Vercel

## Structure du projet

Ce projet contient **2 applications** :
1. **Site Public** (racine du projet)
2. **Admin Dashboard** (dossier `admin/`)

## 📦 Déploiement sur Vercel

### Option 1 : Déploiement via Interface Vercel (Recommandé)

#### 1️⃣ Déployer le Site Public

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repo : `bonismusic2-crypto/AKNEL-EVENT`
4. **Configuration :**
   - Framework Preset : **Vite**
   - Root Directory : **`.`** (laisser vide = racine)
   - Build Command : `npm run build`
   - Output Directory : `dist`
5. Cliquez sur **Deploy**

Votre site sera disponible à : `https://aknel-event.vercel.app`

#### 2️⃣ Déployer l'Admin Dashboard

1. Retournez sur Vercel Dashboard
2. Cliquez sur **"Add New Project"**
3. **Réimportez le même repo** : `bonismusic2-crypto/AKNEL-EVENT`
4. **Configuration (IMPORTANT) :**
   - Framework Preset : **Vite**
   - Root Directory : **`admin`** ⚠️ (Très important !)
   - Build Command : `npm run build`
   - Output Directory : `dist`
5. Cliquez sur **Deploy**

Votre admin sera disponible à : `https://aknel-event-admin.vercel.app`

---

## 🔐 Important : Variables d'Environnement

Les credentials Supabase sont actuellement **en dur dans le code**. Pour la production, vous devriez :

1. Créer des variables d'environnement dans Vercel :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Mettre à jour `supabaseClient.js` pour utiliser ces variables

---

## ✅ Résultat Final

Vous aurez **2 URL distinctes** :

- 🌍 **Site Public** : `https://aknel-event.vercel.app` (ou votre domaine custom)
- ⚙️ **Admin** : `https://aknel-event-admin.vercel.app`

Les deux apps partageront la **même base de données Supabase** !

---

## 🎯 Domaines Personnalisés (Optionnel)

Vous pouvez configurer :
- Site : `www.aknelevent.com`
- Admin : `admin.aknelevent.com`

Dans les paramètres de chaque projet Vercel.
