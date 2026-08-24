/**
 * Service GeniusPay Sandbox pour le Site Web AKNEL Event
 * Point d'entrée : https://geniuspay.ci/api/v1/merchant
 */
export const GENIUSPAY_CONFIG = {
    apiKey: import.meta.env.VITE_GENIUSPAY_API_KEY || 'sk_sandbox_0DkFG1q0rgNO21kvb5xILMBYeYmhf0Zg',
    secretKey: import.meta.env.VITE_GENIUSPAY_SECRET_KEY || 'ss_sandbox_4zyu2Kqqeft0SlmTVG1nGDynYP5jpJwwK79li5xdMVdWxrBK',
    baseUrl: import.meta.env.VITE_GENIUSPAY_BASE_URL || 'https://geniuspay.ci/api/v1/merchant',
    currency: 'XOF',
    environment: 'sandbox',
};

export const GeniusPayWebService = {
    /**
     * Initialise l'achat de billets pour un concert/événement
     */
    async createTicketPayment({ event, ticket, customer, quantity = 1 }) {
        const totalAmount = Number(ticket.price) * Number(quantity);

        const payload = {
            amount: totalAmount,
            currency: GENIUSPAY_CONFIG.currency,
            description: `Achat Billet : ${ticket.name} - ${event.title}`,
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
            metadata: {
                event_id: event.id,
                ticket_id: ticket.id,
                quantity: quantity,
                ticket_name: ticket.name,
                event_title: event.title,
            },
            return_url: `${window.location.origin}/events?status=success`,
            cancel_url: `${window.location.origin}/events?status=cancelled`,
        };

        const response = await fetch(`${GENIUSPAY_CONFIG.baseUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GENIUSPAY_CONFIG.apiKey}`,
                'X-Secret-Key': GENIUSPAY_CONFIG.secretKey,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.message || data?.error || `Erreur serveur GeniusPay (Code HTTP ${response.status})`;
            throw new Error(errorMsg);
        }

        // Redirection vers le guichet de paiement GeniusPay
        const paymentUrl = data?.payment_url || data?.checkout_url || data?.url || data?.data?.payment_url || data?.data?.checkout_url;

        return {
            success: true,
            tx_id: data?.id || data?.reference || data?.data?.id || 'GP_' + Date.now(),
            checkoutUrl: paymentUrl,
            amount: totalAmount,
            status: data?.status || 'pending',
            raw: data,
        };
    }
};
