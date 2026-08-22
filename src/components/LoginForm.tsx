'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Simple email login form.
 * No password, no verification code — entering the email establishes a session.
 */
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Founder Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@project.com"
          required
          className="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-md
                     text-text-primary placeholder-text-muted
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                     transition-colors"
        />
      </div>

      {error && (
        <div className="p-3 bg-badge-needs-attention-bg rounded-md">
          <p className="text-sm text-badge-needs-attention-text">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full bg-accent text-white rounded-full px-6 py-3 font-semibold text-sm
                   hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
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
            Signing in...
          </>
        ) : (
          'View My Certifications'
        )}
      </button>

      <p className="text-xs text-text-muted text-center">
        Enter the email associated with your Builder Growth Incubator project.
        No password required.
      </p>
    </form>
  );
}
