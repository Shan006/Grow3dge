import { connectDB } from '@/lib/db/mongoose';
import { Deliverable, MODULE_NAMES, ModuleName } from '@/models/Deliverable';
import { Scorecard } from '@/models/Scorecard';
import { BadgeAward } from '@/models/BadgeAward';

const DELIVERABLES_PER_MODULE = 4;

export interface ModuleEligibility {
  module: ModuleName;
  deliverables: Array<{
    deliverableName: string;
    deliverableNumber: number;
    qualitativeRating: string;
    submissionState: string;
  }>;
  deliverablesCompleted: number;
  deliverablesRequired: number;
  strongCount: number;
  badgeEarned: boolean;
  firstEarnedAt: Date | null;
}

/**
 * Evaluates badge eligibility for each of the 6 modules for a given project.
 *
 * A module badge is earned only when ALL 4 deliverables in that module
 * are rated "strong". Direct client quote: "They only get the badge
 * for completing the module strongly."
 */
export async function evaluateModuleEligibility(
  projectName: string
): Promise<ModuleEligibility[]> {
  await connectDB();

  const deliverables = await Deliverable.find({ projectName });
  const existingAwards = await BadgeAward.find({
    projectName,
    awardType: 'module_badge',
  });

  const results: ModuleEligibility[] = [];

  for (const moduleName of MODULE_NAMES) {
    const moduleDeliverables = deliverables.filter(
      (d) => d.module === moduleName
    );
    const strongCount = moduleDeliverables.filter(
      (d) => d.qualitativeRating === 'strong'
    ).length;

    // Badge requires ALL 4 deliverables rated "strong"
    const badgeEarned =
      moduleDeliverables.length === DELIVERABLES_PER_MODULE &&
      strongCount === DELIVERABLES_PER_MODULE;

    // Check for existing award record
    const existingAward = existingAwards.find((a) => a.module === moduleName);
    let firstEarnedAt: Date | null = existingAward?.firstEarnedAt || null;

    // If badge is newly earned, create the award record
    if (badgeEarned && !existingAward) {
      const newAward = await BadgeAward.create({
        projectName,
        founderEmail: deliverables[0]?.founderEmail || '',
        awardType: 'module_badge',
        module: moduleName,
        firstEarnedAt: new Date(),
      });
      firstEarnedAt = newAward.firstEarnedAt;
    }

    results.push({
      module: moduleName,
      deliverables: moduleDeliverables.map((d) => ({
        deliverableName: d.deliverableName,
        deliverableNumber: d.deliverableNumber,
        qualitativeRating: d.qualitativeRating,
        submissionState: d.submissionState,
      })),
      deliverablesCompleted: moduleDeliverables.length,
      deliverablesRequired: DELIVERABLES_PER_MODULE,
      strongCount,
      badgeEarned,
      firstEarnedAt,
    });
  }

  return results;
}

/**
 * Evaluates whether a project is eligible for certification.
 *
 * Certificate/scorecard display is NOT gated on badge count.
 * It shows current state always, as long as a Scorecard record exists.
 *
 * Client language: "The final scorecard can be separate from the badges...
 * both of which are displayed within the certification."
 */
export async function evaluateCertificationEligibility(
  projectName: string
): Promise<boolean> {
  await connectDB();
  const scorecard = await Scorecard.findOne({ projectName });
  return Boolean(scorecard);
}
