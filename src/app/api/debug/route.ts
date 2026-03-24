import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const keyInfo = {
      emailSet: !!email,
      emailValue: email?.substring(0, 20) + '...',
      keyLength: rawKey.length,
      keyStart: rawKey.substring(0, 30),
      hasRealNewlines: rawKey.includes('\n'),
      hasEscapedNewlines: rawKey.includes('\\n'),
      spreadsheetId: spreadsheetId,
    };

    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

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

    return NextResponse.json({ success: true, keyInfo, data: res.data.values });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack?.split('\n').slice(0, 5),
    });
  }
}
