/**
 * Maison — Announcement bar
 *
 * Server Component. Static promotional strip above the header.
 */

export function AnnouncementBar() {
  return (
    <div
      style={{
        background: 'var(--bg-dark)',
        color: 'var(--bg)',
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        padding: '0.7rem var(--gutter)',
        fontWeight: 400,
      }}
      role="banner"
    >
      Free shipping on orders over{' '}
      <span style={{ color: 'var(--gold)', fontWeight: 500 }}>$150</span>
      {' · '}
      Complimentary gift wrapping on all orders
      {' · '}
      30-day returns
    </div>
  );
}
