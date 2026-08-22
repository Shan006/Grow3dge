'use client';

import { BadgeImage } from './BadgeImage';

interface DeliverableInfo {
  deliverableName: string;
  deliverableNumber: number;
  qualitativeRating: string;
  submissionState: string;
}

interface ModuleCardProps {
  module: string;
  deliverables: DeliverableInfo[];
  deliverablesCompleted: number;
  deliverablesRequired: number;
  strongCount: number;
  badgeEarned: boolean;
  firstEarnedAt: string | null;
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'strong':
      return 'text-badge-earned-text bg-badge-earned-bg';
    case 'solid':
      return 'text-accent bg-accent/10';
    case 'needs_attention':
      return 'text-badge-needs-attention-text bg-badge-needs-attention-bg';
    default:
      return 'text-text-muted bg-badge-locked-bg';
  }
}

function formatRating(rating: string): string {
  return rating.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * One of 6 module cards on the dashboard.
 * Shows the badge, deliverable progress, and individual deliverable ratings.
 */
export function ModuleCard({
  module,
  deliverables,
  deliverablesCompleted,
  deliverablesRequired,
  strongCount,
  badgeEarned,
  firstEarnedAt,
}: ModuleCardProps) {
  const progressPercent = (deliverablesCompleted / deliverablesRequired) * 100;

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-6 transition-all hover:border-border-default">
      {/* Header with Prominent Badge */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="mb-5 relative">
          {/* Subtle glow effect behind earned badges */}
          {badgeEarned && (
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-125 z-0" />
          )}
          <BadgeImage 
            moduleName={module} 
            earned={badgeEarned} 
            size={112} 
            className="relative z-10 hover:scale-105 transition-transform duration-300" 
          />
        </div>
        <h3 className="text-lg font-bold text-text-primary">
          {module}
        </h3>
        <p className="text-sm text-text-muted mt-1">
          {deliverablesCompleted} of {deliverablesRequired} deliverables
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-badge-locked-bg rounded-full mb-4">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPercent}%`,
            background:
              badgeEarned
                ? 'var(--color-badge-earned-text)'
                : strongCount > 0
                  ? 'var(--color-accent-primary)'
                  : 'var(--color-text-muted)',
          }}
        />
      </div>

      {/* Badge status */}
      {badgeEarned ? (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-badge-earned-bg text-badge-earned-text">
            Badge Earned
          </span>
          {firstEarnedAt && (
            <span className="text-xs text-text-muted">
              {new Date(firstEarnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-badge-locked-bg text-badge-locked-text">
            {strongCount}/{deliverablesRequired} strong
          </span>
        </div>
      )}

      {/* Deliverable list */}
      <div className="space-y-2">
        {deliverables.map((d) => (
          <div
            key={d.deliverableNumber}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-text-secondary truncate flex-1 mr-2">
              {d.deliverableName}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${getRatingColor(d.qualitativeRating)}`}
            >
              {formatRating(d.qualitativeRating)}
            </span>
          </div>
        ))}

        {/* Empty slots for missing deliverables */}
        {Array.from({
          length: deliverablesRequired - deliverablesCompleted,
        }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-text-muted italic">Awaiting submission</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-badge-locked-bg text-badge-locked-text">
              Pending
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
