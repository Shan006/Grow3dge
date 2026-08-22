'use client';

interface ScorecardData {
  okrAchievementScore: number;
  pcfProgressionScore: number;
  executionSystemsScore: number;
  learningReflectionScore: number;
  nextPhaseReadinessScore: number;
  overallSummaryScore: number | null;
  overallFinishLabel: string;
  biggestStrength: string | null;
  biggestRisk: string | null;
  topNextPhasePriority: string | null;
}

interface ScorecardPanelProps {
  scorecard: ScorecardData;
}

function ScoreBar({
  label,
  score,
  maxScore = 5,
}: {
  label: string;
  score: number;
  maxScore?: number;
}) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-semibold text-text-primary">
          {score}/{maxScore}
        </span>
      </div>
      <div className="w-full h-2 bg-badge-locked-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background:
              score >= 4
                ? 'var(--color-badge-earned-text)'
                : score >= 3
                  ? 'var(--color-accent-primary)'
                  : 'var(--color-badge-needs-attention-text)',
          }}
        />
      </div>
    </div>
  );
}

function getFinishLabelStyle(label: string): { text: string; className: string } {
  switch (label) {
    case 'strong_finish':
      return { text: 'Strong Finish', className: 'text-badge-earned-text bg-badge-earned-bg' };
    case 'solid_finish':
      return { text: 'Solid Finish', className: 'text-accent bg-accent/10' };
    case 'needs_support_next_phase':
      return { text: 'Needs Support', className: 'text-badge-needs-attention-text bg-badge-needs-attention-bg' };
    default:
      return { text: label, className: 'text-text-muted bg-badge-locked-bg' };
  }
}

/**
 * Displays the 5 dimension scores + overall label.
 * Bar visualization using accent colors for filled portions.
 */
export function ScorecardPanel({ scorecard }: ScorecardPanelProps) {
  const finishLabel = getFinishLabelStyle(scorecard.overallFinishLabel);

  const dimensions = [
    { label: 'OKR Achievement', score: scorecard.okrAchievementScore },
    { label: 'PCF Progression', score: scorecard.pcfProgressionScore },
    { label: 'Execution & Systems', score: scorecard.executionSystemsScore },
    { label: 'Learning & Reflection', score: scorecard.learningReflectionScore },
    { label: 'Next Phase Readiness', score: scorecard.nextPhaseReadinessScore },
  ];

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Final Scorecard</h2>
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${finishLabel.className}`}
        >
          {finishLabel.text}
        </span>
      </div>

      {/* Overall summary score */}
      {scorecard.overallSummaryScore !== null && (
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-subtle">
          <div className="text-4xl font-extrabold text-accent">
            {scorecard.overallSummaryScore}
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">Overall Score</div>
            <div className="text-xs text-text-muted">out of 5</div>
          </div>
        </div>
      )}

      {/* Score dimensions */}
      <div className="space-y-4 mb-6">
        {dimensions.map((dim) => (
          <ScoreBar key={dim.label} label={dim.label} score={dim.score} />
        ))}
      </div>

      {/* Insights */}
      {(scorecard.biggestStrength || scorecard.biggestRisk || scorecard.topNextPhasePriority) && (
        <div className="border-t border-border-subtle pt-4 space-y-3">
          {scorecard.biggestStrength && (
            <div>
              <div className="text-xs font-semibold text-badge-earned-text mb-1">
                Biggest Strength
              </div>
              <p className="text-sm text-text-secondary">{scorecard.biggestStrength}</p>
            </div>
          )}
          {scorecard.biggestRisk && (
            <div>
              <div className="text-xs font-semibold text-badge-needs-attention-text mb-1">
                Biggest Risk
              </div>
              <p className="text-sm text-text-secondary">{scorecard.biggestRisk}</p>
            </div>
          )}
          {scorecard.topNextPhasePriority && (
            <div>
              <div className="text-xs font-semibold text-accent mb-1">
                Top Next Phase Priority
              </div>
              <p className="text-sm text-text-secondary">{scorecard.topNextPhasePriority}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
