import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const info: Record<string, unknown> = {};

  try {
    let email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const creds = process.env.GOOGLE_CREDENTIALS;

    info.hasGOOGLE_CREDENTIALS = !!creds;
    info.credentialsLength = creds?.length || 0;
    info.hasEmailEnv = !!email;
    info.hasKeyEnv = !!process.env.GOOGLE_PRIVATE_KEY;
    info.spreadsheetId = spreadsheetId;

    if (creds) {
      try {
        const parsed = JSON.parse(creds);
        email = parsed.client_email;
        privateKey = parsed.private_key;
        info.parsedEmail = email;
        info.parsedKeyLength = privateKey?.length || 0;
        info.parsedKeyStart = privateKey?.substring(0, 27);
      } catch (e) {
        info.parseError = (e as Error).message;
      }
    }

    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    info.finalEmail = email;
    info.finalKeyLength = privateKey.length;
    info.finalKeyStart = privateKey.substring(0, 27);
    info.finalKeyHasNewlines = privateKey.includes('\n');

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId!,
      range: 'Precios!A1:B3',
    });

    return NextResponse.json({ success: true, info, data: res.data.values });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      info,
      error: err.message,
    });
  }
}
