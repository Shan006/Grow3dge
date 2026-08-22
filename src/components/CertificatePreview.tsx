'use client';

interface ModuleStatus {
  module: string;
  badgeEarned: boolean;
}

interface CertificatePreviewProps {
  projectName: string;
  modules: ModuleStatus[];
  scorecard: {
    okrAchievementScore: number;
    pcfProgressionScore: number;
    executionSystemsScore: number;
    learningReflectionScore: number;
    nextPhaseReadinessScore: number;
    overallFinishLabel: string;
  } | null;
}

/**
 * In-app preview of the certificate before download.
 * Renders a visual representation matching the downloadable certificate.
 */
export function CertificatePreview({
  projectName,
  modules,
  scorecard,
}: CertificatePreviewProps) {
  const earnedCount = modules.filter((m) => m.badgeEarned).length;

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
      {/* Certificate preview card */}
      <div
        className="relative p-8 text-center"
        style={{
          background:
            'linear-gradient(135deg, #0A0A0C 0%, #1a1a2e 50%, #0A0A0C 100%)',
        }}
      >
        <div className="border border-border-default rounded-xl p-8">
          <p className="text-xs tracking-[0.25em] uppercase text-text-muted mb-3">
            Builder Growth Incubator
          </p>
          <h3
            className="text-2xl font-extrabold mb-2"
            style={{
              background: 'linear-gradient(90deg, #C026D3, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Certificate of Completion
          </h3>
          <p className="text-lg font-bold text-text-primary mb-1">{projectName}</p>
          <p className="text-sm text-text-muted">
            {earnedCount} of 6 module badges earned
          </p>

          {/* Mini score display */}
          {scorecard && (
            <div className="flex justify-center gap-4 mt-4">
              {[
                { label: 'OKR', score: scorecard.okrAchievementScore },
                { label: 'PCF', score: scorecard.pcfProgressionScore },
                { label: 'Exec', score: scorecard.executionSystemsScore },
                { label: 'Learn', score: scorecard.learningReflectionScore },
                { label: 'Ready', score: scorecard.nextPhaseReadinessScore },
              ].map(({ label, score }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold text-accent">{score}</div>
                  <div className="text-[10px] text-text-muted">{label}</div>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-text-muted mt-4">Avalanche Track</p>
        </div>
      </div>

      {/* Preview label */}
      <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs text-text-muted">Certificate Preview</span>
        <span className="text-xs text-text-muted">
          Download for full resolution
        </span>
      </div>
    </div>
  );
}
