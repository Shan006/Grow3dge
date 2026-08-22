import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { authenticateByEmail } from '@/services/auth/emailAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * POST /api/auth/login
 *
 * Simple email-only login. No password, no verification code.
 * Entering the email establishes a session.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email format', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const founder = await authenticateByEmail(email);

    // Establish session
    const session = await getSession();
    session.email = founder.email;
    session.projectName = founder.projectName || null;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      founder: {
        email: founder.email,
        projectName: founder.projectName,
        displayName: founder.displayName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
