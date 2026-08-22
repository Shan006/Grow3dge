import { connectDB } from '@/lib/db/mongoose';
import { resolveDropdownValue, ClickUpCustomField } from '@/lib/clickup/resolveDropdown';
import { coerceNumber } from '@/lib/clickup/coerceNumber';
import { Deliverable, MODULE_NAMES, ModuleName } from '@/models/Deliverable';
import { Scorecard } from '@/models/Scorecard';
import { SyncLog, ISyncLog } from '@/models/SyncLog';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

interface RejectedTask {
  taskId: string;
  reason: string;
}

/**
 * Helper to extract a custom field value by name from a ClickUp task.
 */
function getCustomField(
  task: Record<string, unknown>,
  fieldName: string
): ClickUpCustomField | undefined {
  const customFields = (task.custom_fields || []) as ClickUpCustomField[];
  return customFields.find(
    (f) => f.name.toLowerCase() === fieldName.toLowerCase()
  );
}

/**
 * Resolves a text-type custom field value.
 */
function getTextFieldValue(
  task: Record<string, unknown>,
  fieldName: string
): string | null {
  const field = getCustomField(task, fieldName);
  if (!field || field.value === undefined || field.value === null) return null;
  return String(field.value);
}

/**
 * Resolves a dropdown-type custom field to its display name.
 */
function getDropdownFieldValue(
  task: Record<string, unknown>,
  fieldName: string
): string | null {
  const field = getCustomField(task, fieldName);
  if (!field) return null;
  return resolveDropdownValue(field);
}

/**
 * Resolves a number-type custom field value.
 */
function getNumberFieldValue(
  task: Record<string, unknown>,
  fieldName: string
): number | null {
  const field = getCustomField(task, fieldName);
  if (!field) return null;
  return coerceNumber(field.value);
}

/**
 * Validates shared required fields for all record types.
 */
function validateSharedFields(
  task: Record<string, unknown>
): string | null {
  const recordTitle = getTextFieldValue(task, 'Record Title');
  const recordUrl = getTextFieldValue(task, 'Record URL');
  const projectName = getTextFieldValue(task, 'Project Name');
  const teamName = getTextFieldValue(task, 'Team Name');
  const recordType = getDropdownFieldValue(task, 'Record Type');

  if (!recordTitle) return 'Missing Record Title';
  if (!recordUrl) return 'Missing Record URL';
  if (!projectName) return 'Missing Project Name';
  if (!teamName) return 'Missing Team Name';
  if (!recordType) return 'Missing Record Type';

  return null;
}

/**
 * Transforms and upserts a module_review task into the deliverables collection.
 */
async function processModuleReview(
  task: Record<string, unknown>
): Promise<string | null> {
  const moduleName = getDropdownFieldValue(task, 'Module');
  const qualitativeRating = getDropdownFieldValue(task, 'Qualitative Rating');
  const submissionState = getDropdownFieldValue(task, 'Submission State');
  const moduleWeek = getTextFieldValue(task, 'Module Week');
  const deliverableName = getTextFieldValue(task, 'Deliverable Name') || getTextFieldValue(task, 'Record Title');

  if (!moduleName) return 'Missing Module field';
  if (!MODULE_NAMES.includes(moduleName as ModuleName))
    return `Invalid module name: ${moduleName}`;
  if (!qualitativeRating) return 'Missing Qualitative Rating';
  if (!submissionState) return 'Missing Submission State';
  if (!moduleWeek) return 'Missing Module Week';

  // Normalize qualitative rating
  const normalizedRating = qualitativeRating
    .toLowerCase()
    .replace(/\s+/g, '_') as 'strong' | 'solid' | 'needs_attention';

  // Normalize submission state
  const normalizedState = submissionState
    .toLowerCase()
    .replace(/\s+/g, '_') as 'on_time' | 'late' | 'no_due_date' | 'empty_submission';

  const founderEmail = getTextFieldValue(task, 'Founder Email');
  if (!founderEmail) return 'Missing Founder Email';

  await Deliverable.findOneAndUpdate(
    { clickupTaskId: (task as Record<string, unknown>).id as string },
    {
      $set: {
        clickupTaskId: (task as Record<string, unknown>).id as string,
        recordTitle: getTextFieldValue(task, 'Record Title')!,
        recordUrl: getTextFieldValue(task, 'Record URL')!,
        sourceTaskUrl: getTextFieldValue(task, 'Source Task URL'),
        projectName: getTextFieldValue(task, 'Project Name')!,
        teamName: getTextFieldValue(task, 'Team Name')!,
        ecosystemName: getTextFieldValue(task, 'Ecosystem Name'),
        founderEmail,
        module: moduleName as ModuleName,
        deliverableNumber: coerceNumber(moduleWeek) || 1,
        deliverableName: deliverableName || 'Unknown',
        qualitativeRating: normalizedRating,
        submissionState: normalizedState,
        daysLate: getNumberFieldValue(task, 'Days Late'),
        templateCompleteness: getDropdownFieldValue(task, 'Template Completeness')?.toLowerCase().replace(/\s+/g, '_') || null,
        contentAccess: getDropdownFieldValue(task, 'Content Access')?.toLowerCase().replace(/\s+/g, '_') || null,
        deliverableLinkUrl: getTextFieldValue(task, 'Deliverable Link URL'),
        whatSubmittedSummary: getTextFieldValue(task, 'What Submitted Summary'),
        strengthsSummary: getTextFieldValue(task, 'Strengths Summary'),
        gapsRisksSummary: getTextFieldValue(task, 'Gaps Risks Summary'),
        nextStepsQuestions: getTextFieldValue(task, 'Next Steps Questions'),
        syncedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return null; // success
}

/**
 * Transforms and upserts a final_scorecard task into the scorecards collection.
 */
async function processFinalScorecard(
  task: Record<string, unknown>
): Promise<string | null> {
  const okrScore = getNumberFieldValue(task, 'OKR Achievement Score');
  const pcfScore = getNumberFieldValue(task, 'PCF Progression Score');
  const executionScore = getNumberFieldValue(task, 'Execution Systems Score');
  const learningScore = getNumberFieldValue(task, 'Learning Reflection Score');
  const readinessScore = getNumberFieldValue(task, 'Next Phase Readiness Score');
  const overallLabel = getDropdownFieldValue(task, 'Overall Finish Label');

  if (okrScore === null) return 'Missing OKR Achievement Score';
  if (pcfScore === null) return 'Missing PCF Progression Score';
  if (executionScore === null) return 'Missing Execution Systems Score';
  if (learningScore === null) return 'Missing Learning Reflection Score';
  if (readinessScore === null) return 'Missing Next Phase Readiness Score';
  if (!overallLabel) return 'Missing Overall Finish Label';

  const normalizedLabel = overallLabel
    .toLowerCase()
    .replace(/\s+/g, '_') as 'strong_finish' | 'solid_finish' | 'needs_support_next_phase';

  const founderEmail = getTextFieldValue(task, 'Founder Email');
  if (!founderEmail) return 'Missing Founder Email';

  await Scorecard.findOneAndUpdate(
    { clickupTaskId: (task as Record<string, unknown>).id as string },
    {
      $set: {
        clickupTaskId: (task as Record<string, unknown>).id as string,
        recordTitle: getTextFieldValue(task, 'Record Title')!,
        recordUrl: getTextFieldValue(task, 'Record URL')!,
        projectName: getTextFieldValue(task, 'Project Name')!,
        teamName: getTextFieldValue(task, 'Team Name')!,
        ecosystemName: getTextFieldValue(task, 'Ecosystem Name'),
        founderEmail,
        okrAchievementScore: okrScore,
        pcfProgressionScore: pcfScore,
        executionSystemsScore: executionScore,
        learningReflectionScore: learningScore,
        nextPhaseReadinessScore: readinessScore,
        overallSummaryScore: getNumberFieldValue(task, 'Overall Summary Score'),
        overallFinishLabel: normalizedLabel,
        biggestStrength: getTextFieldValue(task, 'Biggest Strength'),
        biggestRisk: getTextFieldValue(task, 'Biggest Risk'),
        topNextPhasePriority: getTextFieldValue(task, 'Top Next Phase Priority'),
        syncedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return null; // success
}

/**
 * Fetches all tasks from the ClickUp Certifications list and syncs them to MongoDB.
 * Partial-failure tolerant: continues processing remaining tasks on individual failures.
 */
export async function syncFromClickUp(options?: { fullResync?: boolean }) {
  await connectDB();

  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;

  if (!apiToken || !listId) {
    throw new Error('CLICKUP_API_TOKEN and CLICKUP_LIST_ID must be set');
  }

  // Create sync log entry
  const syncLog = await SyncLog.create({
    startedAt: new Date(),
    status: 'running',
  });

  const rejectedTasks: RejectedTask[] = [];
  let tasksProcessed = 0;

  try {
    // Fetch tasks from ClickUp with pagination
    let page = 0;
    let hasMore = true;
    const allTasks: Record<string, unknown>[] = [];

    while (hasMore) {
      const response = await fetch(
        `${CLICKUP_API_BASE}/list/${listId}/task?page=${page}&include_closed=true&subtasks=true`,
        {
          headers: {
            Authorization: apiToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `ClickUp API error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as {
        tasks: Record<string, unknown>[];
        last_page: boolean;
      };
      allTasks.push(...data.tasks);
      hasMore = !data.last_page;
      page++;
    }

    // Process each task
    for (const task of allTasks) {
      const taskId = (task.id as string) || 'unknown';

      // Validate shared fields
      const sharedError = validateSharedFields(task);
      if (sharedError) {
        rejectedTasks.push({ taskId, reason: sharedError });
        continue;
      }

      const recordType = getDropdownFieldValue(task, 'Record Type');

      try {
        if (recordType === 'module_review') {
          const error = await processModuleReview(task);
          if (error) {
            rejectedTasks.push({ taskId, reason: error });
          } else {
            tasksProcessed++;
          }
        } else if (recordType === 'final_scorecard') {
          const error = await processFinalScorecard(task);
          if (error) {
            rejectedTasks.push({ taskId, reason: error });
          } else {
            tasksProcessed++;
          }
        } else {
          rejectedTasks.push({
            taskId,
            reason: `Unknown record type: ${recordType}`,
          });
        }
      } catch (err) {
        rejectedTasks.push({
          taskId,
          reason: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Update sync log
    const finalStatus =
      rejectedTasks.length === 0
        ? 'success'
        : tasksProcessed > 0
          ? 'partial_failure'
          : 'failure';

    await SyncLog.findByIdAndUpdate(syncLog._id, {
      finishedAt: new Date(),
      status: finalStatus,
      tasksProcessed,
      tasksRejected: rejectedTasks.length,
      rejectedTaskIds: rejectedTasks,
    });

    return {
      success: true,
      tasksProcessed,
      tasksRejected: rejectedTasks.length,
      syncLogId: syncLog._id.toString(),
    };
  } catch (error) {
    // Fatal error — couldn't complete sync
    await SyncLog.findByIdAndUpdate(syncLog._id, {
      finishedAt: new Date(),
      status: 'failure',
      tasksProcessed,
      tasksRejected: rejectedTasks.length,
      rejectedTaskIds: rejectedTasks,
      errorMessage:
        error instanceof Error ? error.message : 'Unknown fatal error',
    });

    throw error;
  }
}
