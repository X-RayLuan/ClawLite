import type { VercelRequest, VercelResponse } from '@vercel/node';

type AnyObj = Record<string, any>;

const recentEvents: AnyObj[] = [];

function getSecret(req: VercelRequest): string {
  const h1 = req.headers['x-webhook-secret'];
  const h2 = req.headers['x-resend-webhook-secret'];
  const q = req.query.secret;
  return String((Array.isArray(h1) ? h1[0] : h1) || (Array.isArray(h2) ? h2[0] : h2) || (Array.isArray(q) ? q[0] : q) || '');
}

function normalizeEvents(body: any): AnyObj[] {
  if (Array.isArray(body)) return body;
  if (body?.events && Array.isArray(body.events)) return body.events;
  if (body?.type || body?.event) return [body];
  return [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-webhook-secret,x-resend-webhook-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      endpoint: 'resend-webhook',
      recent: recentEvents.slice(0, 20),
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const expectedSecret = process.env.RESEND_WEBHOOK_SECRET || '';
  const providedSecret = getSecret(req);
  if (expectedSecret && providedSecret !== expectedSecret) {
    return res.status(401).json({ ok: false, error: 'Invalid webhook secret' });
  }

  const events = normalizeEvents(req.body);
  if (!events.length) return res.status(200).json({ ok: true, received: 0 });

  const stamped = events.map((evt) => ({
    receivedAt: new Date().toISOString(),
    type: evt?.type || evt?.event || 'unknown',
    messageId: evt?.data?.email_id || evt?.data?.emailId || evt?.email_id || evt?.emailId || null,
    to: evt?.data?.to || evt?.to || null,
  }));
  recentEvents.unshift(...stamped);
  while (recentEvents.length > 200) recentEvents.pop();

  const forwardUrl = process.env.MISSION_CONTROL_WEBHOOK_URL;
  if (forwardUrl) {
    try {
      await fetch(forwardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(expectedSecret ? { 'x-webhook-secret': expectedSecret } : {}),
        },
        body: JSON.stringify(events),
      });
    } catch {
      // no-op
    }
  }

  return res.status(200).json({ ok: true, received: events.length });
}
