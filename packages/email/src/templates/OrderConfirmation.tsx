/**
 * Maison — Order confirmation email
 *
 * Sent via Trigger.dev job after checkout.confirmOrder succeeds.
 */

import { EmailLayout } from '../components/EmailLayout';
import { EmailButton } from '../components/EmailButton';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    priceCents: number;
  }>;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  orderUrl: string;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotalCents,
  shippingCents,
  taxCents,
  totalCents,
  orderUrl,
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Order ${orderNumber} confirmed`}>
      <h2
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontWeight: 500,
          color: '#1f1b17',
          margin: '0 0 16px',
        }}
      >
        Thank you for your order
      </h2>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '16px',
          lineHeight: 1.65,
          color: '#4a433b',
          margin: '0 0 24px',
        }}
      >
        {customerName ? `Dear ${customerName},` : 'Hello,'}
      </p>
      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '16px',
          lineHeight: 1.65,
          color: '#4a433b',
          margin: '0 0 24px',
        }}
      >
        Your order <strong>{orderNumber}</strong> has been confirmed. We're preparing your pieces
        with care — you'll receive a shipping notification when they're on their way.
      </p>

      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          marginBottom: '24px',
          fontFamily: '-apple-system, sans-serif',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid #e5ddd1',
              color: '#8a8178',
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <th align="left" style={{ padding: '8px 0' }}>
              Item
            </th>
            <th align="center" style={{ padding: '8px 0' }}>
              Qty
            </th>
            <th align="right" style={{ padding: '8px 0' }}>
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #efe9df', color: '#1f1b17' }}>
              <td style={{ padding: '12px 0' }}>{item.name}</td>
              <td align="center" style={{ padding: '12px 0' }}>
                {item.quantity}
              </td>
              <td align="right" style={{ padding: '12px 0' }}>
                {formatPrice(item.priceCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '14px',
          color: '#4a433b',
          marginBottom: '24px',
        }}
      >
        <tbody>
          <tr>
            <td align="left" style={{ padding: '4px 0' }}>
              Subtotal
            </td>
            <td align="right" style={{ padding: '4px 0' }}>
              {formatPrice(subtotalCents)}
            </td>
          </tr>
          <tr>
            <td align="left" style={{ padding: '4px 0' }}>
              Shipping
            </td>
            <td align="right" style={{ padding: '4px 0' }}>
              {formatPrice(shippingCents)}
            </td>
          </tr>
          <tr>
            <td align="left" style={{ padding: '4px 0' }}>
              Tax
            </td>
            <td align="right" style={{ padding: '4px 0' }}>
              {formatPrice(taxCents)}
            </td>
          </tr>
          <tr
            style={{
              borderTop: '1px solid #e5ddd1',
              fontWeight: 600,
              color: '#1f1b17',
            }}
          >
            <td align="left" style={{ padding: '12px 0 4px' }}>
              Total
            </td>
            <td align="right" style={{ padding: '12px 0 4px' }}>
              {formatPrice(totalCents)}
            </td>
          </tr>
        </tbody>
      </table>

      <EmailButton href={orderUrl}>View your order</EmailButton>

      <p
        style={{
          fontFamily: '-apple-system, sans-serif',
          fontSize: '13px',
          color: '#8a8178',
          margin: '24px 0 0',
          lineHeight: 1.65,
        }}
      >
        If you have any questions, reply to this email or write to hello@maison-living.com. We're
        here Mon–Fri, 9am–6pm CET.
      </p>
    </EmailLayout>
  );
}
