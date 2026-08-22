import { NextRequest, NextResponse } from 'next/server';
import { syncFromClickUp } from '@/services/clickup/syncService';

/**
 * POST /api/sync/clickup
 *
 * Triggers a full re-sync from the ClickUp Certifications list.
 * Protected by CRON_SECRET bearer token.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: CRON_SECRET not set' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse optional body
    let fullResync = false;
    try {
      const body = await request.json();
      fullResync = body?.fullResync === true;
    } catch {
      // Empty body is fine
    }

    const result = await syncFromClickUp({ fullResync });

    const statusCode = result.tasksRejected > 0 && result.tasksProcessed > 0 ? 207 : 200;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}
