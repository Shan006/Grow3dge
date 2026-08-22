import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/auth/logout
 *
 * Destroys the current session.
 */
export async function POST() {
  const session = await getSession();
  session.destroy();

  return NextResponse.json({ success: true });
}
