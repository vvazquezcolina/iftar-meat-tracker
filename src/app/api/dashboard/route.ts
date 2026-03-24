import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getDashboardStats } from '@/lib/sheets';

export async function GET(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getDashboardStats();

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
