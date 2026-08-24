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

    const apiKey = process.env.VITE_GENIUSPAY_API_KEY || 'sk_sandbox_0DkFG1q0rgNO21kvb5xILMBYeYmhf0Zg';
    const secretKey = process.env.VITE_GENIUSPAY_SECRET_KEY || 'ss_sandbox_4zyu2Kqqeft0SlmTVG1nGDynYP5jpJwwK79li5xdMVdWxrBK';

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
