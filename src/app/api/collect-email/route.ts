import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function addWaitlistCustomerToSupabase(email: string, source: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase env vars not configured');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/add_waitlist_customer`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      p_email: email,
      p_source: source,
      p_seen_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase RPC failed: ${response.status} ${await response.text()}`);
  }
}

async function appendWaitlistCustomerToGoogleSheets(email: string, source: string) {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!rawKey || !spreadsheetId) {
    return;
  }

  let credentials: any;
  try {
    credentials = JSON.parse(rawKey);
  } catch {
    credentials = JSON.parse(Buffer.from(rawKey, 'base64').toString('utf-8'));
  }

  if (typeof credentials?.private_key === 'string') {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A:C',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[new Date().toISOString(), email, source]],
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedSource = String(source || 'unknown').trim() || 'unknown';

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await addWaitlistCustomerToSupabase(normalizedEmail, normalizedSource);

    // Optional backup mirror while migration settles.
    appendWaitlistCustomerToGoogleSheets(normalizedEmail, normalizedSource).catch((sheetError) => {
      console.error('Google Sheets mirror failed (non-blocking):', sheetError);
    });

    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM,
          to: [normalizedEmail],
          subject: 'You are on the ClawLite waitlist ✅',
          html: '<p>Thanks for joining ClawLite. We\'ll notify you when your access is ready.</p>',
          text: 'Thanks for joining ClawLite. We\'ll notify you when your access is ready.'
        });
      } catch (mailError) {
        console.error('Resend send failed (non-blocking):', mailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving waitlist email:', error);
    return NextResponse.json(
      {
        error: 'Failed to save email',
        detail: error?.message || 'unknown',
        code: error?.code || null,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
