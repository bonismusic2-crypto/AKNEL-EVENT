import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://oncpyjqbfkfkjqisdzli.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3B5anFiZmtma2pxaXNkemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU3NjcsImV4cCI6MjA5MTg2MTc2N30.qCrwZkFJDsues_Cv-2QIIy_ZniKzh14auxHfVs_0sv4';

const GENIUSPAY_WEBHOOK_SECRET = process.env.GENIUSPAY_WEBHOOK_SECRET || 'whsec_il1Vj4h9rAK18PjhUrMOzJb3kjqRXwDMNaO8wEO5LwXGjNb6';

export default async function handler(req, res) {
  // CORS configuration
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        console.warn('⚠️ [GeniusPay Webhook] Impossible de parser le body string:', parseErr.message);
      }
    }

    console.log('🔔 [GeniusPay Webhook Node.js] Payload reçu:', JSON.stringify(body, null, 2));

    const event = body.event || body.type || '';
    const data = body.data || body;
    const status = String(data.status || body.status || '').toLowerCase();
    const metadata = data.metadata || data.custom_data || body.metadata || body.custom_data || {};

    // Vérification de la réussite du paiement
    const isSuccess =
      event === 'payment.success' ||
      event === 'charge.success' ||
      event === 'transaction.success' ||
      event === 'payment_intent.succeeded' ||
      ['successful', 'completed', 'paid', 'approved', 'success'].includes(status);

    if (!isSuccess) {
      console.log(`ℹ️ [GeniusPay Webhook] Événement ignoré (non finalisé) : event=${event}, status=${status}`);
      return res.status(200).json({ received: true, ignored: true, reason: `Status '${status}' is not completed.` });
    }

    // 1. Extraction exhaustive des identifiants et métadonnées
    let userId =
      metadata.user_id ||
      metadata.userId ||
      data.user_id ||
      body.user_id ||
      null;

    // Tentative d'extraction de l'UUID utilisateur depuis la description ou la référence
    const descriptionStr = String(data.description || body.description || '');
    if (!userId && descriptionStr) {
      const uuidMatch = descriptionStr.match(/(?:UID:)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (uuidMatch && uuidMatch[1]) {
        userId = uuidMatch[1];
      }
    }

    const customerEmail =
      data.customer?.email ||
      data.customer_email ||
      data.email ||
      body.customer?.email ||
      body.customer_email ||
      body.email ||
      metadata.user_email ||
      metadata.customer_email ||
      metadata.email ||
      null;

    const rawAmount = data.amount || body.amount || data.total_amount || metadata.amount || 1000;
    const amount = Number(rawAmount) || 1000;
    const reference = data.reference || data.id || data.tx_id || data.transaction_id || body.reference || body.id || `GP_${Date.now()}`;
    const planType = metadata.plan_type || data.plan_type || '';

    // Détermination de la formule (Annuelle ou Mensuelle)
    const isAnnual =
      planType === 'annual' ||
      amount >= 10000 ||
      amount === 15 ||
      descriptionStr.toLowerCase().includes('annuel') ||
      descriptionStr.toLowerCase().includes('1 an');

    const durationDays = isAnnual ? 365 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();
    const planName = isAnnual
      ? 'Abonnement Annuel (10 000 FCFA / ~15 €)'
      : 'Abonnement Mensuel (1 000 FCFA / ~1,50 €)';
    const amountEur = isAnnual ? 15.0 : 1.5;
    const amountFcfa = isAnnual ? 10000 : 1000;

    let finalUserId = userId;
    let finalUserEmail = customerEmail;

    // 2. Résolution du compte utilisateur Supabase
    // Étape A : Si on a déjà un userId, vérifier s'il existe dans auth
    if (finalUserId) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(finalUserId);
        if (authUser?.user) {
          finalUserId = authUser.user.id;
          if (!finalUserEmail && authUser.user.email) {
            finalUserEmail = authUser.user.email;
          }
        }
      } catch (authErr) {
        console.warn('⚠️ [GeniusPay Webhook] Info vérification userId:', authErr?.message || authErr);
      }
    }

    // Étape B : Si pas de userId vérifié, rechercher par email dans Supabase Auth
    if (!finalUserId && finalUserEmail) {
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        if (usersData?.users && usersData.users.length > 0) {
          const matched = usersData.users.find(
            (u) => u.email?.toLowerCase() === finalUserEmail.toLowerCase()
          );
          if (matched) {
            finalUserId = matched.id;
          }
        }
      } catch (listErr) {
        console.warn('⚠️ [GeniusPay Webhook] Info listUsers:', listErr?.message || listErr);
      }
    }

    // Étape C : Recherche de secours dans la table profiles par email
    if (!finalUserId && finalUserEmail) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', finalUserEmail)
          .maybeSingle();
        if (profile?.id) {
          finalUserId = profile.id;
        }
      } catch (profErr) {
        console.warn('⚠️ [GeniusPay Webhook] Info profile lookup:', profErr?.message || profErr);
      }
    }

    console.log(`🔍 [GeniusPay Webhook] Résolution User -> ID: ${finalUserId || 'NON TROUVÉ'}, Email: ${finalUserEmail || 'N/A'}, Réf: ${reference}`);

    // 3. Mise à jour de la base de données
    if (finalUserId) {
      // A. Mise à jour ou Insertion dans la table 'subscriptions'
      const { data: existingSubs } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', finalUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingSubs && existingSubs.length > 0) {
        const { error: updateSubErr } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            plan_name: planName,
            plan_price: amountFcfa,
            amount: amountEur,
            currency: 'XOF',
            payment_method: 'geniuspay',
            geniuspay_tx_id: String(reference),
            expires_at: expiresAt,
            current_period_end: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubs[0].id);

        if (updateSubErr) {
          console.error('❌ [GeniusPay Webhook] Erreur update subscriptions:', updateSubErr);
        } else {
          console.log(`✅ [GeniusPay Webhook] Table subscriptions mise à jour pour ${finalUserId}`);
        }
      } else {
        const { error: insertSubErr } = await supabase
          .from('subscriptions')
          .insert({
            user_id: finalUserId,
            status: 'active',
            plan_name: planName,
            plan_price: amountFcfa,
            amount: amountEur,
            currency: 'XOF',
            payment_method: 'geniuspay',
            geniuspay_tx_id: String(reference),
            starts_at: new Date().toISOString(),
            expires_at: expiresAt,
            current_period_end: expiresAt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertSubErr) {
          console.error('❌ [GeniusPay Webhook] Erreur insert subscriptions:', insertSubErr);
        } else {
          console.log(`✅ [GeniusPay Webhook] Table subscriptions créée pour ${finalUserId}`);
        }
      }

      // B. Mise à jour et Upsert dans la table 'profiles' (Accès VIP garanti)
      const profileData = {
        id: finalUserId,
        is_vip: true,
        subscription_status: 'active',
        vip_until: expiresAt,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertProfErr } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (upsertProfErr) {
        console.warn('⚠️ [GeniusPay Webhook] Upsert profiles fallback vers update:', upsertProfErr?.message || upsertProfErr);
        await supabase
          .from('profiles')
          .update({
            is_vip: true,
            subscription_status: 'active',
            vip_until: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', finalUserId);
      } else {
        console.log(`✅ [GeniusPay Webhook] Profil VIP activé pour ${finalUserId}`);
      }

      // C. Mise à jour de la table orders si une commande correspond
      if (reference) {
        await supabase
          .from('orders')
          .update({ payment_status: 'completed' })
          .or(`pawa_pay_ref.eq.${reference},id.eq.${reference}`)
          .catch(() => {});
      }

      return res.status(200).json({
        received: true,
        success: true,
        user_id: finalUserId,
        subscription_status: 'active',
        plan: planName,
        expires_at: expiresAt,
        reference: reference,
      });
    } else {
      console.warn(`⚠️ [GeniusPay Webhook] Aucun utilisateur Supabase trouvé pour Email: ${customerEmail} / UserID: ${userId}`);
      return res.status(200).json({
        received: true,
        success: false,
        warning: 'User not found in Supabase Auth or Profiles',
        customer_email: customerEmail,
        reference: reference,
      });
    }
  } catch (error) {
    console.error('❌ [GeniusPay Webhook] Exception:', error);
    return res.status(400).json({ error: error?.message || 'Internal Server Error' });
  }
}
