/**
 * Maison — Admin orders page (Server Component)
 *
 * Order table with status, fulfillment actions (Client Component for mutations).
 */

import { OrderActions } from '@/components/admin/OrderActions';
import { api } from '@/lib/trpc/server';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function AdminOrdersPage() {
  let orders: {
    items: {
      id: string;
      orderNumber: string;
      email: string;
      status: string;
      totalCents: number;
      placedAt: Date | null;
      shippedAt: Date | null;
    }[];
    total: number;
  } = { items: [], total: 0 };

  try {
    const caller = await api();
    orders = await caller.admin.ordersList({ status: 'all', limit: 50 });
  } catch (err) {
    console.error('[admin orders] Failed to fetch:', err);
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
        }}
      >
        Orders ({orders.total})
      </h2>

      {orders.items.length === 0 ? (
        <p style={{ color: 'var(--muted)', padding: '2rem 0' }}>No orders yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid var(--line)',
                  textAlign: 'left',
                }}
              >
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  Order #
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  Customer
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  Total
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{order.orderNumber}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--ink-2)' }}>{order.email}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--muted)' }}>
                    {order.placedAt ? formatDate(order.placedAt) : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                    {formatPrice(order.totalCents)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        padding: '0.2rem 0.6rem',
                        background:
                          order.status === 'delivered'
                            ? 'rgba(139,154,130,0.15)'
                            : order.status === 'cancelled' || order.status === 'refunded'
                              ? 'rgba(168,107,74,0.15)'
                              : 'rgba(196,162,101,0.15)',
                        color:
                          order.status === 'delivered'
                            ? 'var(--sage)'
                            : order.status === 'cancelled' || order.status === 'refunded'
                              ? 'var(--clay)'
                              : 'var(--warning)',
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <OrderActions orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
