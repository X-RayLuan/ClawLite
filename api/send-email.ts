import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, text, email, message } = req.body || {};

    const recipient = to || email;
    const bodyText = text || message;

    if (!recipient || !subject || (!html && !bodyText)) {
      return res.status(400).json({ error: 'Missing required fields: to|email, subject, html|text|message' });
    }

    const from = process.env.RESEND_FROM;
    if (!from) {
      return res.status(500).json({ error: 'RESEND_FROM is not configured' });
    }

    const result = await resend.emails.send({
      from,
      to: Array.isArray(recipient) ? recipient : [recipient],
      subject,
      html: html || undefined,
      text: bodyText || undefined,
    });

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to send email' });
  }
}
