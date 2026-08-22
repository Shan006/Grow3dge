import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { generateCertificate } from '@/services/certificate/generateCertificate';
import { evaluateCertificationEligibility } from '@/services/eligibility/badgeEngine';

/**
 * GET /api/certificate/generate
 *
 * Generates a downloadable certificate image (PNG) or PDF.
 * Query params: ?format=png (default) or ?format=pdf
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.projectName) {
      return NextResponse.json(
        { error: 'No project data found for your account' },
        { status: 404 }
      );
    }

    // Check certification eligibility (scorecard must exist)
    const eligible = await evaluateCertificationEligibility(session.projectName);
    if (!eligible) {
      return NextResponse.json(
        {
          error: 'Certificate not yet available',
          message:
            'Your final scorecard has not been processed yet. Certificates will be available once your scorecard data is synced.',
        },
        { status: 404 }
      );
    }

    const format =
      (request.nextUrl.searchParams.get('format') as 'png' | 'pdf') || 'png';
    const validFormats = ['png', 'pdf'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use png or pdf.' },
        { status: 400 }
      );
    }

    const certificateBuffer = await generateCertificate(
      session.projectName,
      session.email,
      format
    );

    const sanitizedName = session.projectName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .toLowerCase();

    const contentType = format === 'png' ? 'image/png' : 'image/svg+xml';

    return new NextResponse(new Uint8Array(certificateBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="certificate-${sanitizedName}.${format}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
