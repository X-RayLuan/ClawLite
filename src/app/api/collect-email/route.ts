import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Google Service Account credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    
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
      range: 'Sheet1!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), email, source || 'unknown']],
      },
    });

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
