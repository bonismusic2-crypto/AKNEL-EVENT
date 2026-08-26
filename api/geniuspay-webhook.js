import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oncpyjqbfkfkjqisdzli.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3B5anFiZmtma2pxaXNkemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU3NjcsImV4cCI6MjA5MTg2MTc2N30.qCrwZkFJDsues_Cv-2QIIy_ZniKzh14auxHfVs_0sv4';

const GENIUSPAY_WEBHOOK_SECRET = process.env.GENIUSPAY_WEBHOOK_SECRET || 'whsec_il1Vj4h9rAK18PjhUrMOzJb3kjqRXwDMNaO8wEO5LwXGjNb6';

export default async function handler(req, res) {
  // Gestion CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Secret-Key, x-geniuspay-signature, x-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = req.body || {};
    console.log('🔔 [Vercel Webhook] GeniusPay Notification:', JSON.stringify(body, null, 2));

    const event = body.event || body.type;
    const data = body.data || body;

    // Traitement du paiement validé (Abonnement Mobile Money ou Carte)
    if (event === 'payment.success' || data.status === 'successful' || data.status === 'completed') {
      const customerEmail = data.customer?.email || data.email;
      const amount = Number(data.amount) || 1000;
      const reference = data.reference || data.id;

      const isAnnual = amount >= 10000;
      const durationDays = isAnnual ? 365 : 30;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();
      const planName = isAnnual
        ? 'Abonnement Annuel (10 000 FCFA / ~15 €)'
        : 'Abonnement Mensuel (1 000 FCFA / ~1,50 €)';

      if (customerEmail) {
        // 1. Recherche de l'utilisateur par email dans Supabase
        const { data: usersData } = await supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }));
        const user = usersData?.users?.find((u) => u.email?.toLowerCase() === customerEmail.toLowerCase());

        if (user) {
          // 2. Mettre à jour la table des abonnements
          await supabase.from('subscriptions').upsert({
            user_id: user.id,
            status: 'active',
            plan_name: planName,
            amount: isAnnual ? 15.0 : 1.5,
            currency: 'EUR',
            current_period_end: expiresAt,
            created_at: new Date().toISOString(),
          });

          // 3. Mettre à jour le profil utilisateur
          await supabase.from('profiles').upsert({
            id: user.id,
            is_vip: true,
            subscription_status: 'active',
            vip_until: expiresAt,
            updated_at: new Date().toISOString(),
          });

          console.log(`✅ [Vercel Webhook] Abonnement activé pour ${customerEmail} (${planName})`);
        } else {
          console.warn(`⚠️ [Vercel Webhook] Utilisateur ${customerEmail} introuvable dans Supabase Auth.`);
        }
      }
    }

    return res.status(200).json({ received: true, success: true });
  } catch (error) {
    console.error('❌ [Vercel Webhook] Erreur:', error);
    return res.status(400).json({ error: error.message });
  }
}
