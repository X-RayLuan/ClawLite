import { google } from 'googleapis';
import { readFileSync } from 'fs';

// Read .env.local manually
const envLines = readFileSync('.env.local', 'utf-8').split('\n');
let credentialsJson = '';
let sheetId = '';

for (const line of envLines) {
  if (line.startsWith('GOOGLE_SERVICE_ACCOUNT_KEY=')) {
    credentialsJson = line.substring('GOOGLE_SERVICE_ACCOUNT_KEY='.length).trim();
  }
  if (line.startsWith('GOOGLE_SHEET_ID=')) {
    sheetId = line.substring('GOOGLE_SHEET_ID='.length).trim();
  }
}

if (!credentialsJson || !sheetId) {
  console.error('❌ Missing GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SHEET_ID in .env.local');
  process.exit(1);
}

try {
  const credentials = JSON.parse(credentialsJson);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📝 Writing test row to Google Sheet...');
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:C',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[new Date().toISOString(), 'test@clawlite.ai', 'api-test']],
    },
  });

  console.log('✅ Successfully wrote to Google Sheet!');
  console.log(`🔗 Check your sheet: https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.code) console.error('   Code:', error.code);
}
