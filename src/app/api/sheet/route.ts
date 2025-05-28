import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getSheetsClient() {
  const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (!credentialsBase64) throw new Error('Missing credentials');

  const credentialsJSON = JSON.parse(
    Buffer.from(credentialsBase64, 'base64').toString('utf-8')
  );

  const client = new google.auth.JWT({
    email: credentialsJSON.client_email,
    key: credentialsJSON.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({
    version: 'v4',
    auth: client,
  });

  return sheets;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

  try {
    // Ambil metadata spreadsheet termasuk nama-nama sheet
    const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });

    const sheetTitles = sheetMetadata.data.sheets?.map(
      (sheet) => sheet.properties?.title
    ).filter(Boolean) as string[];

    const allDataEntries = await Promise.all(sheetTitles.map(async (title) => {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: title,
      });
      return [title, res.data.values || []] as const;
    }));

    const allData = Object.fromEntries(allDataEntries);

    return NextResponse.json({ data: allData });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
