import { google } from 'googleapis';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'src/config/credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  const range = 'Sheet1!A1:D10';

  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return NextResponse.json({ data: res.data.values });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { values } = body; // values = array, contoh: ["Azmi", "azmi@email.com", "Laki-laki"]

  if (!Array.isArray(values)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    const range = 'Sheet1'; // akan otomatis tambah baris

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    return NextResponse.json({ message: 'Data berhasil ditambahkan' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { rowIndex, values } = await req.json();
  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `Sheet1!A${rowIndex}:C${rowIndex}`, // Misal 3 kolom
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });

  return NextResponse.json({ message: 'Berhasil diupdate' });
}

export async function DELETE(req: Request) {
  const { rowIndex } = await req.json();
  const sheets = await getSheetsClient();

  const requests = [
    {
      deleteDimension: {
        range: {
          sheetId: 0, // default Sheet1 ID = 0
          dimension: 'ROWS',
          startIndex: rowIndex - 1,
          endIndex: rowIndex,
        },
      },
    },
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    requestBody: { requests },
  });

  return NextResponse.json({ message: 'Berhasil dihapus' });
}
