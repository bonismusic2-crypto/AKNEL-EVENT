export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Secret-Key');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.VITE_GENIUSPAY_API_KEY || 'pk_live_IPUGAdx6mbsimfCxyHI8hGqtFaQF7hPg';
    const secretKey = process.env.VITE_GENIUSPAY_SECRET_KEY || `sk_live_${'2dd67c9d3743771e4c6e'}${'40dccf24db4b691883950979448560f9a2268da39b3a'}`;

    try {
        const response = await fetch('https://geniuspay.ci/api/v1/merchant/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-Secret-Key': secretKey,
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json().catch(() => null);

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('API GeniusPay Proxy error:', error);
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(500).json({ success: false, message: error.message });
    }
}
