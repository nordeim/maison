/**
 * Maison — Admin inventory page (Server Component)
 */

import { api } from '@/lib/trpc/server';

export default async function AdminInventoryPage() {
  let inventory: {
    items: {
      id: string;
      sku: string;
      name: string;
      stockQuantity: number;
      leadTimeDays: number;
      productName: string | null;
      productSlug: string | null;
    }[];
    total: number;
  } = { items: [], total: 0 };

  try {
    const caller = await api();
    inventory = await caller.admin.inventoryList({ lowStockOnly: false });
  } catch (err) {
    console.error('[admin inventory] Failed to fetch:', err);
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
        Inventory ({inventory.total})
      </h2>

      {inventory.items.length === 0 ? (
        <p style={{ color: 'var(--muted)', padding: '2rem 0' }}>
          No variants found. Variants are created automatically when you seed the database.
        </p>
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
                  Product
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
                  SKU
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
                  Variant
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
                  Stock
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
                  Lead Time
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
              </tr>
            </thead>
            <tbody>
              {inventory.items.map((variant) => (
                <tr key={variant.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                    {variant.productSlug ? (
                      <a href={`/products/${variant.productSlug}`} style={{ color: 'inherit' }}>
                        {variant.productName ?? '—'}
                      </a>
                    ) : (
                      (variant.productName ?? '—')
                    )}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {variant.sku}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--ink-2)' }}>{variant.name}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                    {variant.stockQuantity}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--muted)' }}>
                    {variant.leadTimeDays === 0
                      ? 'In stock'
                      : `${String(variant.leadTimeDays)} days`}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color:
                          variant.stockQuantity === 0
                            ? 'var(--clay)'
                            : variant.stockQuantity < 5
                              ? 'var(--warning)'
                              : 'var(--sage)',
                      }}
                    >
                      {variant.stockQuantity === 0
                        ? 'Out of stock'
                        : variant.stockQuantity < 5
                          ? 'Low'
                          : 'OK'}
                    </span>
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
