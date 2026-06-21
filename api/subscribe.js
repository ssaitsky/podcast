// Vercel serverless function. Receives email + source, forwards to Kit.
// Same setup as the main site (svetlanasaitsky.com).

const KIT_API_KEY = 'dpE-uwyWSSgKcXkZQyJ-cw';

const FORM_IDS = {
  'PDF - Listening':   '9592985', // Masterful Listening Website_Free PDF
  'VIP Waitlist':      '9593004', // VIP Podcast List
  'Story Submission':  '9593004', // no dedicated form yet — lands in VIP Podcast List, tag is what actually organizes these
};

async function findOrCreateTag(tagName) {
  const listRes = await fetch(`https://api.convertkit.com/v3/tags?api_key=${KIT_API_KEY}`);
  const listData = await listRes.json();
  const existing = (listData.tags || []).find(
    (t) => t.name.toLowerCase() === tagName.toLowerCase()
  );
  if (existing) return existing.id;

  const createRes = await fetch('https://api.convertkit.com/v3/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: KIT_API_KEY, tag: { name: tagName } }),
  });
  const createData = await createRes.json();
  return createData.id;
}

async function tagSubscriber(email, tagName) {
  try {
    const tagId = await findOrCreateTag(tagName);
    if (!tagId) return;
    await fetch(`https://api.convertkit.com/v3/tags/${tagId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: KIT_API_KEY, email }),
    });
  } catch (err) {
    console.error('Kit tagging error:', err);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, source, firstName, extraFields } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const formId = FORM_IDS[source] || FORM_IDS['VIP Waitlist'];

  try {
    const kitRes = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: KIT_API_KEY,
        email,
        first_name: firstName ? firstName.trim().split(' ')[0] : '',
        fields: { source: source || 'Podcast Site', ...(extraFields || {}) },
      }),
    });
    const data = await kitRes.json();
    if (!kitRes.ok) return res.status(kitRes.status).json({ error: data });

    await tagSubscriber(email, source || 'Podcast Site');

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Kit' });
  }
}
