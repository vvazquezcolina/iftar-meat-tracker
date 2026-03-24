import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getPrices, updatePrice } from '@/lib/sheets';

export async function GET() {
  try {
    const prices = await getPrices();
    return NextResponse.json(prices, { status: 200 });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tipo_carne, precio_por_kg } = body;

    if (!tipo_carne || precio_por_kg === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: tipo_carne, precio_por_kg' },
        { status: 400 }
      );
    }

    await updatePrice(tipo_carne, precio_por_kg);

    return NextResponse.json(
      { success: true, message: 'Price updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
