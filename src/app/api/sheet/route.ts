import { google } from 'googleapis';
import path from 'path';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JWT } from 'google-auth-library'; // Tambahkan ini

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'src/config/credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient() as JWT; // ← atau OAuth2Client jika pakai user auth
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
