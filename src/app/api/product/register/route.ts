import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { registerProduct } from '@/lib/sheets';

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { qr_id, tipo_carne, peso_kg } = body;

    if (!qr_id || !tipo_carne || peso_kg === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: qr_id, tipo_carne, peso_kg' },
        { status: 400 }
      );
    }

    const product = await registerProduct(qr_id, tipo_carne, peso_kg);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error registering product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
