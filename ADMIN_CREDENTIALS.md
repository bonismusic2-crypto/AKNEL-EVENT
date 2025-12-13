# 🔐 CODES D'ACCÈS ADMIN DASHBOARD

## Comptes Administrateurs

| Email                      | Mot de passe |
|----------------------------|--------------|
| admin1@aknelevent.com      | admin123     |
| admin2@aknelevent.com      | admin456     |
| admin3@aknelevent.com      | admin789     |

---

## Accès

URL Admin : https://aknel-event-admin.vercel.app/login
(ou http://localhost:5179/login en local)

## Sécurité

⚠️ **Important** : Ces identifiants sont pour un environnement de développement/test.
Pour la production, il est recommandé d'utiliser un système d'authentification plus robuste (Supabase Auth, Auth0, etc.) avec des mots de passe hachés.

## Fonctionnement

- Les identifiants sont stockés en dur dans le code (Login.jsx)
- L'authentification est vérifiée via localStorage
- Toutes les routes admin sont protégées
- Le bouton "Déconnexion" efface la session
