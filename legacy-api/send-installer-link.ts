import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function getReleaseLink(os: string) {
  if (os === 'windows') {
    return 'https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite-setup.exe';
  }
  return 'https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite.dmg';
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
    
    const macOSInstructions = os === 'macos' 
      ? `\n\n⚠️ macOS Security Notice:\nAfter downloading, you may see "ClawLite cannot be opened because it is from an unidentified developer."\n\nTo allow ClawLite:\n1. Open System Settings → Privacy & Security\n2. Scroll down to the Security section\n3. Click "Open Anyway" next to the ClawLite message\n4. Click "Open" in the confirmation dialog\n\nAlternatively, right-click the app and select "Open" the first time.\n\nThis is a one-time setup. Once allowed, ClawLite will open normally.`
      : '';
    
    const text = `Thanks for trying ClawLite.\n\nDownload your installer here:\n${releaseLink}${macOSInstructions}\n\nIf the latest release is not available yet, this link may show 404 until published.\n\n- ClawLite Team`;
    
    const macOSHtml = os === 'macos'
      ? `
        <div style="margin:20px 0;padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;">
          <p style="margin:0 0 8px;font-weight:600;color:#92400e;">⚠️ macOS Security Notice</p>
          <p style="margin:0 0 8px;font-size:14px;color:#78350f;">After downloading, you may see "ClawLite cannot be opened because it is from an unidentified developer."</p>
          <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#78350f;">To allow ClawLite:</p>
          <ol style="margin:0;padding-left:20px;font-size:14px;color:#78350f;">
            <li>Open <strong>System Settings → Privacy & Security</strong></li>
            <li>Scroll down to the <strong>Security</strong> section</li>
            <li>Click <strong>"Open Anyway"</strong> next to the ClawLite message</li>
            <li>Click <strong>"Open"</strong> in the confirmation dialog</li>
          </ol>
          <p style="margin:8px 0 0;font-size:13px;color:#92400e;">Alternatively, right-click the app and select "Open" the first time.</p>
          <p style="margin:8px 0 0;font-size:13px;color:#92400e;font-style:italic;">This is a one-time setup. Once allowed, ClawLite will open normally.</p>
        </div>
      `
      : '';
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#111827;">
        <h2 style="margin:0 0 12px;">Your ClawLite Installer Link</h2>
        <p>Thanks for trying ClawLite.</p>
        <p>
          <a href="${releaseLink}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600;">
            Download Installer
          </a>
        </p>
        ${macOSHtml}
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
