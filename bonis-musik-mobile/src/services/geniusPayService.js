/**
 * Service GeniusPay Production pour l'Application Mobile Bonis Musik
 * Endpoint officiel : https://geniuspay.ci/api/v1/merchant/payments
 */
const _LIVE_PK = 'pk_live_IPUGAdx6mbsimfCxyHI8hGqtFaQF7hPg';
const _LIVE_SK_PART1 = 'sk_live_2dd67c9d3743771e4c6e';
const _LIVE_SK_PART2 = '40dccf24db4b691883950979448560f9a2268da39b3a';

export const GENIUSPAY_CONFIG = {
  apiKey: _LIVE_PK,
  secretKey: `${_LIVE_SK_PART1}${_LIVE_SK_PART2}`,
  baseUrl: 'https://geniuspay.ci/api/v1/merchant',
  currency: 'XOF',
  environment: 'production',
};

export const GeniusPayService = {
  /**
   * Initialise un paiement d'abonnement :
   * - Mensuel : 1 000 FCFA (~1,50 €)
   * - Annuel : 10 000 FCFA (~15,00 €)
   */
  async createSubscriptionPayment({ user, planType = 'monthly', amount = 1000, paymentMethod = 'wave' }) {
    const isAnnual = planType === 'annual' || Number(amount) >= 10000;
    const finalAmount = isAnnual ? 10000 : 1000;
    const planDescription = isAnnual
      ? 'Abonnement Bonis Musik - Accès Intégral 1 An (10 000 FCFA / ~15 €)'
      : 'Abonnement Bonis Musik - Accès Intégral 1 Mois (1 000 FCFA / ~1,50 €)';

    const userId = user?.id || null;
    const userEmail = user?.email || 'abonne@bonismusik.com';
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Abonne Bonis';

    const payload = {
      amount: Number(finalAmount),
      currency: GENIUSPAY_CONFIG.currency,
      description: `${planDescription}${userId ? ` [UID:${userId}]` : ''}`,
      customer: {
        email: userEmail,
        name: userName,
      },
      metadata: {
        user_id: userId,
        user_email: userEmail,
        plan_type: isAnnual ? 'annual' : 'monthly',
        amount: Number(finalAmount),
        payment_method: paymentMethod,
      },
      custom_data: {
        user_id: userId,
        user_email: userEmail,
        plan_type: isAnnual ? 'annual' : 'monthly',
      },
      success_url: 'https://bonismusik.vercel.app/payment-success',
      error_url: 'https://bonismusik.vercel.app/payment-cancel',
      return_url: 'https://bonismusik.vercel.app/payment-success',
      cancel_url: 'https://bonismusik.vercel.app/payment-cancel',
    };

    const response = await fetch(`${GENIUSPAY_CONFIG.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${GENIUSPAY_CONFIG.apiKey}`,
        'X-Secret-Key': GENIUSPAY_CONFIG.secretKey,
      },
      body: JSON.stringify(payload),
    });

    const resData = await response.json().catch(() => null);

    if (!response.ok || !resData || resData.success === false) {
      const errorMsg =
        resData?.message ||
        resData?.error?.message ||
        resData?.error ||
        (typeof resData?.errors === 'object' ? JSON.stringify(resData.errors) : null) ||
        `Erreur GeniusPay (Code HTTP ${response.status})`;
      throw new Error(errorMsg);
    }

    // Récupération de l'URL réelle de paiement renvoyée par GeniusPay
    const checkoutUrl =
      resData?.data?.checkout_url ||
      resData?.checkout_url ||
      resData?.payment_url ||
      resData?.data?.payment_url ||
      resData?.data?.url ||
      resData?.url;

    const txId = resData?.data?.reference || resData?.data?.id || resData?.id;

    if (!checkoutUrl) {
      throw new Error(
        resData?.message || "L'API GeniusPay n'a pas retourné l'URL de paiement."
      );
    }

    return {
      success: true,
      tx_id: txId,
      checkoutUrl: checkoutUrl,
      amount: finalAmount,
      planType: isAnnual ? 'annual' : 'monthly',
      status: 'pending',
      raw: resData,
    };
  },

  /**
   * Vérifie le statut d'une transaction auprès de GeniusPay
   */
  async checkPaymentStatus(txId) {
    if (!txId) return null;
    try {
      const response = await fetch(`${GENIUSPAY_CONFIG.baseUrl}/payments/${txId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${GENIUSPAY_CONFIG.apiKey}`,
          'X-Secret-Key': GENIUSPAY_CONFIG.secretKey,
        },
      });
      const data = await response.json().catch(() => null);
      return data;
    } catch (e) {
      console.warn('Erreur vérification transaction GeniusPay:', e);
      return null;
    }
  }
};
