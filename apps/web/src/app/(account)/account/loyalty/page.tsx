/**
 * Maison — Account loyalty page (Client Component)
 *
 * Shows loyalty points, tier, progress to next tier, perks, history.
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import { formatDate } from '@/lib/utils';

const TIER_COLORS: Record<string, string> = {
  member: 'var(--ink)',
  silver: '#c0c0c0',
  gold: 'var(--gold)',
  platinum: '#e5e4e2',
};

export default function AccountLoyaltyPage() {
  const { data: account, isLoading } = trpc.loyalty.myAccount.useQuery();
  const { data: history } = trpc.loyalty.myHistory.useQuery({ limit: 20 });

  if (isLoading) {
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
          Loyalty Program
        </h2>
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      </div>
    );
  }

  if (!account) {
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
          Loyalty Program
        </h2>
        <p style={{ color: 'var(--muted)' }}>Unable to load loyalty account.</p>
      </div>
    );
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
        Loyalty <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>Program</em>
      </h2>

      {/* Tier card */}
      <div
        style={{
          padding: '2rem',
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              Current Tier
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 500,
                color: TIER_COLORS[account.tier],
                textTransform: 'capitalize',
              }}
            >
              {account.tier}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              Available Points
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 500,
                color: 'var(--clay)',
              }}
            >
              {account.pointsBalance}
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--ink-2)',
            marginBottom: '1rem',
          }}
        >
          {account.tierPerk}
        </p>

        {/* Progress to next tier */}
        {account.nextTier && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--muted)',
                marginBottom: '0.5rem',
              }}
            >
              <span>{account.lifetimePoints} lifetime points</span>
              <span>
                {account.pointsToNextTier} points to {account.nextTier}
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--line)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${String(account.progressToNextTier)}%`,
                  background: 'var(--clay)',
                  transition: 'width 0.6s var(--ease-maison)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tier ladder */}
      <div
        className="tier-ladder"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {[
          { tier: 'member', min: 0, perk: '1× points' },
          { tier: 'silver', min: 500, perk: '1.25× points' },
          { tier: 'gold', min: 2000, perk: '1.5× points' },
          { tier: 'platinum', min: 5000, perk: '2× points' },
        ].map((t) => (
          <div
            key={t.tier}
            style={{
              padding: '1rem',
              border: `1px solid ${account.tier === t.tier ? 'var(--clay)' : 'var(--line)'}`,
              background: account.tier === t.tier ? 'rgba(168,107,74,0.05)' : 'var(--bg-card)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: TIER_COLORS[t.tier],
                textTransform: 'capitalize',
              }}
            >
              {t.tier}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t.min}+ points</p>
            <p
              style={{
                fontSize: 10,
                color: 'var(--ink-2)',
                marginTop: '0.25rem',
              }}
            >
              {t.perk}
            </p>
          </div>
        ))}
      </div>

      {/* History */}
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          fontWeight: 500,
          marginBottom: '1rem',
        }}
      >
        Points History
      </h3>
      {history?.items.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>
          No points activity yet. Earn points by placing orders!
        </p>
      ) : (
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {history?.items.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{tx.description ?? tx.type}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {formatDate(tx.createdAt)}
                </p>
              </div>
              <p
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: tx.points > 0 ? 'var(--sage)' : 'var(--clay)',
                }}
              >
                {tx.points > 0 ? '+' : ''}
                {tx.points}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`@media (max-width: 768px) { .tier-ladder { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
