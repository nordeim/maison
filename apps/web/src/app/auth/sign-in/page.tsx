/**
 * Maison — Sign-in page
 *
 * Email/password sign-in via Better Auth client.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Maison account.',
};

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: 400, width: '100%' }}>
        <p className="eyebrow">Welcome back</p>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2.5rem',
            fontWeight: 400,
            marginBottom: '2rem',
          }}
        >
          Sign in to <em style={{ color: '#a86b4a' }}>Maison</em>
        </h1>

        {/* Phase 1: replace with Better Auth client form */}
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          action="/api/auth/sign-in/email"
          method="POST"
        >
          <label>
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#8a8178',
              }}
            >
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                border: '1px solid #e5ddd1',
                background: '#ffffff',
                fontSize: 16,
              }}
            />
          </label>
          <label>
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#8a8178',
              }}
            >
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                border: '1px solid #e5ddd1',
                background: '#ffffff',
                fontSize: 16,
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: '0.95rem 1.75rem',
              background: '#a86b4a',
              color: '#faf8f5',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#8a8178' }}>
          Don&apos;t have an account?{' '}
          <a href="/auth/sign-up" style={{ color: '#a86b4a', borderBottom: '1px solid #a86b4a' }}>
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
