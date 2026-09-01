/**
 * Service GeniusPay Sandbox pour le Site Web AKNEL Event
 * Utilise la Serverless Function Vercel /api/geniuspay-payment
 */
export const GeniusPayWebService = {
    /**
     * Initialise l'achat de billets pour un concert/événement
     */
    async createTicketPayment({ event, ticket, customer, quantity = 1 }) {
        const totalAmount = Number(ticket.price) * Number(quantity);

        const successParams = new URLSearchParams({
            ticket: ticket.name,
            amount: totalAmount.toLocaleString('fr-FR'),
            name: customer.name,
            phone: customer.phone || '',
            event: event.title,
        }).toString();

        const payload = {
            amount: Number(totalAmount),
            currency: 'XOF',
            description: `Billet Officiel : ${ticket.name} - ${event.title} [Client: ${customer.name}]`,
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
            metadata: {
                ticket_name: ticket.name,
                event_title: event.title,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone,
                quantity: quantity,
                type: 'event_ticket',
            },
            custom_data: {
                ticket_name: ticket.name,
                customer_email: customer.email,
                customer_phone: customer.phone,
                type: 'event_ticket',
            },
            success_url: `${window.location.origin}/payment-success?${successParams}`,
            error_url: `${window.location.origin}/payment-cancel`,
            return_url: `${window.location.origin}/payment-success?${successParams}`,
            cancel_url: `${window.location.origin}/payment-cancel`,
        };

        const response = await fetch('/api/geniuspay-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const resData = await response.json().catch(() => null);

        if (!response.ok || !resData || resData.success === false) {
            const errorMsg =
                resData?.message ||
                resData?.error?.message ||
                resData?.error ||
                `Erreur GeniusPay (Code HTTP ${response.status})`;
            throw new Error(errorMsg);
        }

        // L'API GeniusPay Merchant renvoie checkout_url
        const checkoutUrl =
            resData?.data?.checkout_url ||
            resData?.checkout_url ||
            resData?.payment_url ||
            resData?.data?.payment_url ||
            resData?.data?.url ||
            resData?.url;

        const txId = resData?.data?.reference || resData?.data?.id || resData?.id || 'GP_' + Date.now();

        return {
            success: true,
            tx_id: txId,
            checkoutUrl: checkoutUrl,
            amount: totalAmount,
            status: 'pending',
            raw: resData,
        };
    }
};
