import { google } from 'googleapis';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf-8');
const credentials = JSON.parse(envContent.match(/GOOGLE_SERVICE_ACCOUNT_KEY=(.+)/)[1]);
const spreadsheetId = envContent.match(/GOOGLE_SHEET_ID=(.+)/)[1];

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

try {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:C',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[new Date().toISOString(), 'test@clawlite.ai', 'api-test']],
    },
  });
  console.log('✅ Successfully wrote to Google Sheet!');
} catch (error) {
  console.error('❌ Error:', error.message);
}
