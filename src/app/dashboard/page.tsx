'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleCard } from '@/components/ModuleCard';
import { ScorecardPanel } from '@/components/ScorecardPanel';
import { CertificatePreview } from '@/components/CertificatePreview';
import { DownloadCertificateButton } from '@/components/DownloadCertificateButton';

interface ModuleData {
  module: string;
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
  firstEarnedAt: string | null;
}

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

interface ProgressData {
  projectName: string;
  modules: ModuleData[];
  scorecard: ScorecardData | null;
  certificationEligible: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch('/api/founder/progress');

        if (response.status === 401) {
          router.push('/');
          return;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load progress');
        }

        const progressData = await response.json();
        setData(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-text-secondary">Loading your progress...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-bg-surface border border-border-subtle rounded-md p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Unable to Load Progress
          </h2>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-accent text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleLogout}
              className="border border-border-default text-text-secondary rounded-full px-6 py-2.5 font-semibold text-sm hover:text-text-primary hover:border-text-muted transition-colors"
            >
              Sign Out / Login Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const earnedBadgeCount = data.modules.filter((m) => m.badgeEarned).length;

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">
              Builder Growth Incubator
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-sm font-medium text-text-primary">
              {data.projectName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-10">
          <p className="text-sm tracking-[0.15em] uppercase text-text-muted mb-2">
            Avalanche Track — Certifications
          </p>
          <h1 className="text-3xl font-bold leading-tight text-text-primary mb-2">
            {data.projectName}
          </h1>
          <p className="text-base text-text-secondary">
            {earnedBadgeCount} of 6 module badges earned
            {data.certificationEligible && ' · Certificate available'}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Badge Grid (2/3 width) */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Module Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.modules.map((mod) => (
                <ModuleCard
                  key={mod.module}
                  module={mod.module}
                  deliverables={mod.deliverables}
                  deliverablesCompleted={mod.deliverablesCompleted}
                  deliverablesRequired={mod.deliverablesRequired}
                  strongCount={mod.strongCount}
                  badgeEarned={mod.badgeEarned}
                  firstEarnedAt={mod.firstEarnedAt}
                />
              ))}
            </div>
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Scorecard */}
            {data.scorecard && <ScorecardPanel scorecard={data.scorecard} />}

            {/* Certificate Section */}
            {data.certificationEligible && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text-primary">
                  Certificate
                </h2>
                <CertificatePreview
                  projectName={data.projectName}
                  modules={data.modules}
                  scorecard={data.scorecard}
                />
                <DownloadCertificateButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
