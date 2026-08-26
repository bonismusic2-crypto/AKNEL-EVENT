import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-geniuspay-signature, x-signature, x-secret-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://oncpyjqbfkfkjqisdzli.supabase.co";
    const supabaseServiceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_KEY") ??
      "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    console.log("🔔 [GeniusPay Webhook Deno Edge] Notification reçue:", JSON.stringify(body, null, 2));

    const event = body.event || body.type || "";
    const data = body.data || body;
    const status = String(data.status || body.status || "").toLowerCase();
    const metadata = data.metadata || data.custom_data || body.metadata || body.custom_data || {};

    // Vérification du statut de succès
    const isSuccess =
      event === "payment.success" ||
      event === "charge.success" ||
      event === "transaction.success" ||
      event === "payment_intent.succeeded" ||
      ["successful", "completed", "paid", "approved", "success"].includes(status);

    if (!isSuccess) {
      console.log(`ℹ️ [GeniusPay Webhook Deno] Événement ignoré (non complété) : event=${event}, status=${status}`);
      return new Response(
        JSON.stringify({ received: true, ignored: true, reason: `Status '${status}' is not successful.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 1. Extraction robuste de l'utilisateur, de l'email et du montant
    let userId =
      metadata.user_id ||
      metadata.userId ||
      data.user_id ||
      body.user_id ||
      null;

    const descriptionStr = String(data.description || body.description || "");
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
    const reference =
      data.reference ||
      data.id ||
      data.tx_id ||
      data.transaction_id ||
      body.reference ||
      body.id ||
      `GP_${Date.now()}`;
    const planType = metadata.plan_type || data.plan_type || "";

    // Détermination de la formule
    const isAnnual =
      planType === "annual" ||
      amount >= 10000 ||
      amount === 15 ||
      descriptionStr.toLowerCase().includes("annuel") ||
      descriptionStr.toLowerCase().includes("1 an");

    const durationDays = isAnnual ? 365 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();
    const planName = isAnnual
      ? "Abonnement Annuel (10 000 FCFA / ~15 €)"
      : "Abonnement Mensuel (1 000 FCFA / ~1,50 €)";
    const amountEur = isAnnual ? 15.0 : 1.5;
    const amountFcfa = isAnnual ? 10000 : 1000;

    let finalUserId = userId;
    let finalUserEmail = customerEmail;

    // 2. Résolution de l'identifiant utilisateur Supabase
    // Étape A : Vérification directe par userId
    if (finalUserId) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(finalUserId);
        if (authUser?.user) {
          finalUserId = authUser.user.id;
          if (!finalUserEmail && authUser.user.email) {
            finalUserEmail = authUser.user.email;
          }
        }
      } catch (authErr: any) {
        console.warn("⚠️ [GeniusPay Webhook Deno] Info vérification userId:", authErr?.message || authErr);
      }
    }

    // Étape B : Recherche par email dans Supabase Auth
    if (!finalUserId && finalUserEmail) {
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        if (usersData?.users && usersData.users.length > 0) {
          const matched = usersData.users.find(
            (u: any) => u.email?.toLowerCase() === finalUserEmail.toLowerCase()
          );
          if (matched) {
            finalUserId = matched.id;
          }
        }
      } catch (listErr: any) {
        console.warn("⚠️ [GeniusPay Webhook Deno] Info listUsers:", listErr?.message || listErr);
      }
    }

    // Étape C : Recherche par email dans la table profiles
    if (!finalUserId && finalUserEmail) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", finalUserEmail)
          .maybeSingle();
        if (profile?.id) {
          finalUserId = profile.id;
        }
      } catch (profErr: any) {
        console.warn("⚠️ [GeniusPay Webhook Deno] Info profile query:", profErr?.message || profErr);
      }
    }

    console.log(`🔍 [GeniusPay Webhook Deno] User résolu: ID=${finalUserId || "NON TROUVÉ"}, Email=${finalUserEmail || "N/A"}, Réf=${reference}`);

    // 3. Mise à jour de la base de données
    if (finalUserId) {
      // A. Mise à jour ou Insertion dans 'subscriptions'
      const { data: existingSubs } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", finalUserId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingSubs && existingSubs.length > 0) {
        const { error: updateSubErr } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            plan_name: planName,
            plan_price: amountFcfa,
            amount: amountEur,
            currency: "XOF",
            payment_method: "geniuspay",
            geniuspay_tx_id: String(reference),
            expires_at: expiresAt,
            current_period_end: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubs[0].id);

        if (updateSubErr) {
          console.error("❌ [GeniusPay Webhook Deno] Erreur update subscriptions:", updateSubErr);
        } else {
          console.log(`✅ [GeniusPay Webhook Deno] Table subscriptions mise à jour pour ${finalUserId}`);
        }
      } else {
        const { error: insertSubErr } = await supabase
          .from("subscriptions")
          .insert({
            user_id: finalUserId,
            status: "active",
            plan_name: planName,
            plan_price: amountFcfa,
            amount: amountEur,
            currency: "XOF",
            payment_method: "geniuspay",
            geniuspay_tx_id: String(reference),
            starts_at: new Date().toISOString(),
            expires_at: expiresAt,
            current_period_end: expiresAt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertSubErr) {
          console.error("❌ [GeniusPay Webhook Deno] Erreur insert subscriptions:", insertSubErr);
        } else {
          console.log(`✅ [GeniusPay Webhook Deno] Table subscriptions créée pour ${finalUserId}`);
        }
      }

      // B. Mise à jour et Upsert dans 'profiles' (is_vip: true, subscription_status: 'active', vip_until: expiresAt)
      const profileData = {
        id: finalUserId,
        is_vip: true,
        subscription_status: "active",
        vip_until: expiresAt,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertProfErr } = await supabase
        .from("profiles")
        .upsert(profileData);

      if (upsertProfErr) {
        console.warn("⚠️ [GeniusPay Webhook Deno] Upsert profiles fallback vers update:", upsertProfErr?.message || upsertProfErr);
        await supabase
          .from("profiles")
          .update({
            is_vip: true,
            subscription_status: "active",
            vip_until: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", finalUserId);
      } else {
        console.log(`✅ [GeniusPay Webhook Deno] Profil VIP activé pour ${finalUserId}`);
      }

      // C. Mise à jour de la table orders si référence présente
      if (reference) {
        await supabase
          .from("orders")
          .update({ payment_status: "completed" })
          .or(`pawa_pay_ref.eq.${reference},id.eq.${reference}`)
          .catch(() => {});
      }

      return new Response(
        JSON.stringify({
          received: true,
          success: true,
          user_id: finalUserId,
          subscription_status: "active",
          plan: planName,
          expires_at: expiresAt,
          reference: reference,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.warn(`⚠️ [GeniusPay Webhook Deno] Utilisateur non trouvé pour Email: ${customerEmail} / UserID: ${userId}`);
      return new Response(
        JSON.stringify({
          received: true,
          success: false,
          warning: "User not found in Supabase Auth or Profiles",
          customer_email: customerEmail,
          reference: reference,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur Webhook GeniusPay Deno:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
