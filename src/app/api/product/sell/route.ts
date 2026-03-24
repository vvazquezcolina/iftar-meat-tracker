import { NextResponse } from 'next/server';
import { markSold } from '@/lib/sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qr_id } = body;

    if (!qr_id) {
      return NextResponse.json({ error: 'Missing required field: qr_id' }, { status: 400 });
    }

    await markSold(qr_id);

    return NextResponse.json({ success: true, message: 'Product marked as sold' }, { status: 200 });
  } catch (error) {
    console.error('Error marking product as sold:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
