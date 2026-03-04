import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, text } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html|text" },
        { status: 400 }
      );
    }

    const from = process.env.RESEND_FROM;
    if (!from) {
      return NextResponse.json({ error: "RESEND_FROM is not configured" }, { status: 500 });
    }

    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || undefined,
      text: text || undefined
    });

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to send email" }, { status: 500 });
  }
}
