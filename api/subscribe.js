// Vercel serverless function. Receives email + source, forwards to Kit.
// Same setup as the main site (svetlanasaitsky.com).

const KIT_API_KEY = 'dpE-uwyWSSgKcXkZQyJ-cw';

const FORM_IDS = {
  'PDF - Listening': '9592985', // Masterful Listening Website_Free PDF
  'VIP Waitlist':    '9593004', // VIP Podcast List
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, source } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const formId = FORM_IDS[source] || '9452127';

  try {
    const kitRes = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: KIT_API_KEY, email, fields: { source: source || 'Podcast Site' } }),
    });
    const data = await kitRes.json();
    if (!kitRes.ok) return res.status(kitRes.status).json({ error: data });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Kit' });
  }
}
