import { Resend } from "resend";

function getResendClient() {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return null;
  }

  return {
    client: new Resend(process.env.RESEND_API_KEY),
    from: process.env.RESEND_FROM,
  };
}

export async function sendClawLiteApiKeyEmail(input: {
  to: string;
  apiKey: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] Missing RESEND_API_KEY or RESEND_FROM; skipping ClawLite API key email.");
    return { sent: false, skipped: true as const };
  }

  const text = [
    "Your ClawLite API Key",
    "",
    `API key: ${input.apiKey}`,
    "",
    "Store this key now. It is shown only once and cannot be recovered later.",
    "Use it as your ClawLite API key for ClawRouter requests and dashboard integrations.",
    "",
    "If you did not expect this email, please ignore it.",
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 12px;">Your ClawLite API Key</h2>
      <p style="margin:0 0 12px;">Your new ClawLite API key is ready:</p>
      <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all;">
        ${input.apiKey}
      </div>
      <p style="margin:0 0 8px;"><strong>Important:</strong> this key is shown only once. Save it now.</p>
      <p style="margin:0;">Use it as your ClawLite API key for ClawRouter requests and dashboard integrations.</p>
    </div>
  `;

  const result = await resend.client.emails.send({
    from: resend.from,
    to: [input.to],
    subject: "Your ClawLite API Key",
    text,
    html,
  });

  return { sent: true as const, id: result.data?.id || null };
}
