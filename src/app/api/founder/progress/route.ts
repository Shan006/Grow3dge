import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { Scorecard } from '@/models/Scorecard';
import {
  evaluateModuleEligibility,
  evaluateCertificationEligibility,
} from '@/services/eligibility/badgeEngine';

/**
 * GET /api/founder/progress
 *
 * Returns the logged-in founder's full progress view including
 * module eligibility, scorecard, and certification status.
 */
export async function GET() {
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
        { error: 'No project matched to your email yet. Data may not have synced.' },
        { status: 404 }
      );
    }

    await connectDB();

    const projectName = session.projectName;

    // Evaluate module eligibility (also creates badge awards as needed)
    const modules = await evaluateModuleEligibility(projectName);

    // Fetch scorecard
    const scorecard = await Scorecard.findOne({ projectName });

    // Check certification eligibility
    const certificationEligible =
      await evaluateCertificationEligibility(projectName);

    return NextResponse.json({
      projectName,
      modules,
      scorecard: scorecard
        ? {
            okrAchievementScore: scorecard.okrAchievementScore,
            pcfProgressionScore: scorecard.pcfProgressionScore,
            executionSystemsScore: scorecard.executionSystemsScore,
            learningReflectionScore: scorecard.learningReflectionScore,
            nextPhaseReadinessScore: scorecard.nextPhaseReadinessScore,
            overallSummaryScore: scorecard.overallSummaryScore,
            overallFinishLabel: scorecard.overallFinishLabel,
            biggestStrength: scorecard.biggestStrength,
            biggestRisk: scorecard.biggestRisk,
            topNextPhasePriority: scorecard.topNextPhasePriority,
          }
        : null,
      certificationEligible,
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
