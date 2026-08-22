import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <p className="text-sm tracking-[0.25em] uppercase text-text-muted mb-4">
          Avalanche Track
        </p>
        <h1 className="text-5xl font-extrabold leading-tight text-text-primary mb-4">
          Builder Growth{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #C026D3, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Incubator
          </span>
        </h1>
        <p className="text-base font-normal leading-relaxed text-text-secondary max-w-md mx-auto">
          Track your progress, earn module badges, and download your
          certification.
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <footer className="mt-16 text-center">
        <p className="text-xs text-text-muted">
          Builder Growth Incubator — Certification & Badge Platform
        </p>
      </footer>
    </main>
  );
}
