import { connectDB } from '@/lib/db/mongoose';
import { Founder } from '@/models/Founder';
import { Deliverable } from '@/models/Deliverable';
import { Scorecard } from '@/models/Scorecard';

/**
 * Authenticates a founder by email.
 * Creates a new Founder record if one doesn't exist.
 * Attempts to auto-resolve projectName from existing deliverable/scorecard data.
 */
export async function authenticateByEmail(email: string) {
  await connectDB();

  const normalizedEmail = email.toLowerCase().trim();

  // Find or create founder
  let founder = await Founder.findOne({ email: normalizedEmail });

  if (!founder) {
    // Try to resolve project name from existing synced data
    const projectName = await resolveProjectName(normalizedEmail);

    founder = await Founder.create({
      email: normalizedEmail,
      projectName,
      emailVerifiedAt: new Date(),
    });
  } else if (!founder.projectName) {
    // Existing founder without a project — try to resolve
    const projectName = await resolveProjectName(normalizedEmail);
    if (projectName) {
      founder.projectName = projectName;
      await founder.save();
    }
  }

  return {
    email: founder.email,
    projectName: founder.projectName,
    displayName: founder.displayName,
  };
}

/**
 * Resolves the project name for a founder by looking up their email
 * in the deliverables or scorecards collections.
 */
async function resolveProjectName(email: string): Promise<string | null> {
  // Check deliverables first (more records, more likely to match)
  const deliverable = await Deliverable.findOne({ founderEmail: email });
  if (deliverable) return deliverable.projectName;

  // Fall back to scorecard
  const scorecard = await Scorecard.findOne({ founderEmail: email });
  if (scorecard) return scorecard.projectName;

  return null;
}
