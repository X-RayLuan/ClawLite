import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Google Service Account credentials from environment variable
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
    if (!rawKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
    }

    let credentials: any;
    try {
      credentials = JSON.parse(rawKey);
    } catch {
      // Support base64-encoded JSON secrets
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
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID not configured');
    }

    // Append row: [timestamp, email, source]
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      // Avoid hard dependency on sheet tab name (e.g., not always "Sheet1")
      range: 'A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), email, source || 'unknown']],
      },
    });

    // Optional confirmation email via Resend
    // Will be skipped automatically if env vars are missing.
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM,
          to: [email],
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
    console.error('Error writing to Google Sheets:', error);
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
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
