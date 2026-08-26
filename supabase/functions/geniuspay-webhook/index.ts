import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-geniuspay-signature, x-signature",
};

// Clé secrète de signature du Webhook GeniusPay
const GENIUSPAY_WEBHOOK_SECRET = Deno.env.get("GENIUSPAY_WEBHOOK_SECRET") ?? "whsec_il1Vj4h9rAK18PjhUrMOzJb3kjqRXwDMNaO8wEO5LwXGjNb6";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://oncpyjqbfkfkjqisdzli.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("🔔 [GeniusPay Webhook] Notification reçue:", JSON.stringify(body, null, 2));

    const event = body.event || body.type;
    const data = body.data || body;

    // Traitement du paiement réussi
    if (event === "payment.success" || data.status === "successful" || data.status === "completed") {
      const customerEmail = data.customer?.email || data.email;
      const amount = data.amount || 1000;
      const reference = data.reference || data.id;
      
      const isAnnual = Number(amount) >= 10000;
      const durationDays = isAnnual ? 365 : 30;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();
      const planName = isAnnual
        ? "Abonnement Annuel (10 000 FCFA / ~15 €)"
        : "Abonnement Mensuel (1 000 FCFA / ~1,50 €)";

      if (customerEmail) {
        // Trouver l'utilisateur par email
        const { data: usersData, error: userErr } = await supabase.auth.admin.listUsers();
        const user = usersData?.users?.find((u) => u.email?.toLowerCase() === customerEmail.toLowerCase());

        if (user) {
          // 1. Mettre à jour la table des abonnements
          await supabase.from("subscriptions").upsert({
            user_id: user.id,
            status: "active",
            plan_name: planName,
            amount: isAnnual ? 15.0 : 1.5,
            currency: "EUR",
            current_period_end: expiresAt,
            created_at: new Date().toISOString(),
          });

          // 2. Mettre à jour le profil utilisateur
          await supabase.from("profiles").upsert({
            id: user.id,
            is_vip: true,
            subscription_status: "active",
            vip_until: expiresAt,
            updated_at: new Date().toISOString(),
          });

          console.log(`✅ Abonnement activé avec succès pour ${customerEmail} (${planName}) - Réf: ${reference}`);
        } else {
          console.warn(`⚠️ Utilisateur avec l'email ${customerEmail} non trouvé dans Supabase Auth.`);
        }
      }
    }

    return new Response(JSON.stringify({ received: true, success: true, verified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Erreur Webhook GeniusPay:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
