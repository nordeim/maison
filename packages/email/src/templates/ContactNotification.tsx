/**
 * Maison — Contact form notification email
 *
 * Sent to hello@maison-living.com when a visitor submits the contact form.
 * Contains the submitter's name, email, and message.
 *
 * Per REMEDIATION_PLAN_v6 Task 1.1 (G1).
 */

import { EmailLayout } from '../components/EmailLayout';

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  message: string;
}

export function ContactNotificationEmail({ name, email, message }: ContactNotificationEmailProps) {
  return (
    <EmailLayout preview={`New contact form submission from ${name}`}>
      <h2
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontWeight: 500,
          color: '#1f1b17',
          margin: '0 0 16px',
        }}
      >
        New contact form submission
      </h2>
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          marginBottom: '24px',
          fontFamily: '-apple-system, sans-serif',
          fontSize: '14px',
          color: '#4a433b',
        }}
      >
        <tbody>
          <tr>
            <td
              align="left"
              style={{
                padding: '4px 0',
                fontWeight: 600,
                color: '#1f1b17',
                width: '80px',
              }}
            >
              From:
            </td>
            <td align="left" style={{ padding: '4px 0' }}>
              {name}
            </td>
          </tr>
          <tr>
            <td
              align="left"
              style={{
                padding: '4px 0',
                fontWeight: 600,
                color: '#1f1b17',
                width: '80px',
              }}
            >
              Email:
            </td>
            <td align="left" style={{ padding: '4px 0' }}>
              {email}
            </td>
          </tr>
        </tbody>
      </table>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8a8178',
          margin: '0 0 8px',
        }}
      >
        Message
      </p>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '16px',
          lineHeight: 1.65,
          color: '#1f1b17',
          margin: '0 0 24px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {message}
      </p>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '13px',
          color: '#8a8178',
          margin: '24px 0 0',
          lineHeight: 1.65,
        }}
      >
        Reply directly to this email to respond to {name}, or forward to the appropriate team
        member.
      </p>
    </EmailLayout>
  );
}
