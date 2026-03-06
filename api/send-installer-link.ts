import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function getReleaseLink(os: string) {
  if (os === 'windows') {
    return 'https://github.com/X-RayLuan/Mac-Installer/releases/latest/download/clawlite-setup.exe';
  }
  return 'https://github.com/X-RayLuan/Mac-Installer/releases/latest/download/clawlite.dmg';
}

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
    const { email, os = 'macos' } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const from = process.env.RESEND_FROM || 'hello@clawlite.ai';
    const releaseLink = getReleaseLink(os);

    const subject = 'Your ClawLite Installer Download Link';
    const text = `Thanks for trying ClawLite.\n\nDownload your installer here:\n${releaseLink}\n\nIf the latest release is not available yet, this link may show 404 until published.\n\n- ClawLite Team`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#111827;">
        <h2 style="margin:0 0 12px;">Your ClawLite Installer Link</h2>
        <p>Thanks for trying ClawLite.</p>
        <p>
          <a href="${releaseLink}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600;">
            Download Installer
          </a>
        </p>
        <p style="font-size:13px;color:#6b7280;">If the latest release is not available yet, this link may show 404 until published.</p>
        <p style="font-size:13px;color:#6b7280;">- ClawLite Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from,
      to: [email],
      subject,
      text,
      html,
    });

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to send installer link' });
  }
}
