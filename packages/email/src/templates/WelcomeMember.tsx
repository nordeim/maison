/**
 * Maison — Welcome email for new customers
 */

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';

interface WelcomeEmailProps {
  name?: string;
  shopUrl: string;
}

export function WelcomeEmail({ name, shopUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Maison">
      <h2
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontWeight: 500,
          color: '#1f1b17',
          margin: '0 0 16px',
        }}
      >
        Welcome to Maison
      </h2>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '16px',
          lineHeight: 1.7,
          color: '#4a433b',
          margin: '0 0 16px',
        }}
      >
        {name ? `Dear ${name},` : 'Hello,'}
      </p>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '16px',
          lineHeight: 1.7,
          color: '#4a433b',
          margin: '0 0 16px',
        }}
      >
        Thank you for creating a Maison account. You&apos;re now part of a small community of people
        who believe that the objects we live with should be made with care, age gracefully, and
        bring quiet joy to daily rituals.
      </p>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '16px',
          lineHeight: 1.7,
          color: '#4a433b',
          margin: '0 0 16px',
        }}
      >
        As an account holder, you can save pieces to your wishlist, track your orders, and check out
        faster next time.
      </p>
      <EmailButton href={shopUrl}>Shop the collection</EmailButton>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '13px',
          color: '#8a8178',
          margin: '24px 0 0',
          lineHeight: 1.65,
        }}
      >
        With gratitude,
        <br />
        The Maison team
      </p>
    </EmailLayout>
  );
}
