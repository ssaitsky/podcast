// Vercel serverless function. Receives email + source, forwards to Kit.
// Same setup as the main site (svetlanasaitsky.com).

const KIT_API_KEY = 'dpE-uwyWSSgKcXkZQyJ-cw';
const RESEND_API_KEY = process.env.Resend_API_Key;
const NOTIFY_EMAIL = 'svetlana.thisisit@gmail.com';

const FORM_IDS = {
  'PDF - Listening':    '9592985', // PODCAST_Free PDF
  'VIP Waitlist':       '9593004', // PODCAST_ VIP Podcast List
  'Story Submission':   '9593119', // PODCAST_Story Submission
  'Speaking Inquiry':   '9611957', // PODCAST_Speaking/Guest Request
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

async function sendNotification(subject, text) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: 'onboarding@resend.dev', to: NOTIFY_EMAIL, subject, text }),
    });
  } catch (err) {
    console.error('Resend notification error:', err);
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

    const name = (firstName || email).trim();
    if (source === 'Story Submission') {
      const topic = extraFields?.topic || '—';
      const message = extraFields?.message || '—';
      await sendNotification(
        `Masterful Listening — story/question from ${name}`,
        `From: ${name} (${email})\nTopic: ${topic}\n\n${message}`
      );
    }
    if (source === 'Speaking Inquiry') {
      const message = extraFields?.message || '—';
      await sendNotification(
        `Masterful Listening — speaking/guest inquiry from ${name}`,
        `From: ${name} (${email})\n\n${message}`
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Kit' });
  }
}
