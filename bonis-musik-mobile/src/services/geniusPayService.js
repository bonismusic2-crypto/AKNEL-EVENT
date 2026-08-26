/**
 * Service GeniusPay Sandbox pour l'Application Mobile Bonis Musik
 * Endpoint officiel : https://geniuspay.ci/api/v1/merchant/payments
 */
export const GENIUSPAY_CONFIG = {
  apiKey: 'sk_sandbox_0DkFG1q0rgNO21kvb5xILMBYeYmhf0Zg',
  secretKey: 'ss_sandbox_4zyu2Kqqeft0SlmTVG1nGDynYP5jpJwwK79li5xdMVdWxrBK',
  baseUrl: 'https://geniuspay.ci/api/v1/merchant',
  currency: 'XOF',
  environment: 'sandbox',
};

export const GeniusPayService = {
  /**
   * Initialise un paiement d'abonnement VIP (1 300 FCFA / ~2€)
   */
  async createSubscriptionPayment({ user, amount = 1300, paymentMethod = 'wave' }) {
    const payload = {
      amount: Number(amount),
      currency: GENIUSPAY_CONFIG.currency,
      description: 'Abonnement Bonis Musik Premium VIP (1 mois)',
      customer: {
        email: user?.email || 'abonne@bonismusik.com',
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Abonne Bonis',
        phone: user?.user_metadata?.phone || '',
      },
      success_url: 'bonismusik://payment-success',
      error_url: 'bonismusik://payment-cancel',
      return_url: 'bonismusik://payment-success',
      cancel_url: 'bonismusik://payment-cancel',
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
      amount: amount,
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
