/**
 * Maison — Contact page (Server Component)
 *
 * Server Component wrapper that exports metadata and renders the
 * ContactForm Client Component. The form was previously a non-functional
 * plain HTML form — now wired to the tRPC contact.submit mutation which
 * sends a notification email via Resend.
 *
 * Per REMEDIATION_PLAN_v6 Task 1.1 (G1).
 */

import type { Metadata } from 'next';

import { ContactForm } from '@/components/shop/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the Maison team — questions about a piece, a commission, or a trade inquiry. We read every email.',
};

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '5rem 1.25rem' }}>
      <p className="eyebrow">Contact</p>
      <h1
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          marginBottom: '1rem',
        }}
      >
        Get in <em style={{ color: 'var(--clay)' }}>touch</em>
      </h1>
      <p style={{ color: 'var(--ink-2)', marginBottom: '2rem' }}>
        Questions about a piece, a commission, or a trade inquiry? Write to us — we read every
        email.
      </p>

      <ContactForm />

      <p style={{ marginTop: '3rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
        hello@maison-living.com · Stockholm &amp; Copenhagen · Mon–Fri, 9am–6pm CET
      </p>
    </main>
  );
}
