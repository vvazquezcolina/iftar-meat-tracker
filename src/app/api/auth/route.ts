import { NextResponse } from 'next/server';
import { validateAdminPin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: 'Missing required field: pin' }, { status: 400 });
    }

    const success = validateAdminPin(pin);

    return NextResponse.json({ success }, { status: 200 });
  } catch (error) {
    console.error('Error validating auth:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
