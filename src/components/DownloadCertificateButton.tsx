'use client';

import { useState } from 'react';

interface DownloadCertificateButtonProps {
  disabled?: boolean;
}

/**
 * Primary CTA button that triggers certificate download.
 * Calls /api/certificate/generate and handles the file download.
 */
export function DownloadCertificateButton({
  disabled = false,
}: DownloadCertificateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (format: 'png' | 'pdf' = 'png') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/certificate/generate?format=${format}`
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message || data.error || 'Failed to generate certificate'
        );
      }

      // Create download link from response blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      link.download = filenameMatch?.[1] || `certificate.${format}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => handleDownload('png')}
          disabled={disabled || isLoading}
          className="bg-accent text-white rounded-full px-6 py-2.5 font-semibold text-sm
                     hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
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
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Certificate (PNG)
            </>
          )}
        </button>
        <button
          onClick={() => handleDownload('pdf')}
          disabled={disabled || isLoading}
          className="border border-border-default text-text-secondary rounded-full px-6 py-2.5 font-semibold text-sm
                     hover:text-text-primary hover:border-text-muted transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          PDF
        </button>
      </div>
      {error && (
        <p className="text-sm text-badge-needs-attention-text">{error}</p>
      )}
    </div>
  );
}
