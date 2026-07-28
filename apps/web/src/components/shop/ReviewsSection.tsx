/**
 * Maison — Product reviews section (Client Component)
 *
 * Shows approved reviews with ratings, average rating, review form.
 * Uses tRPC reviews.list query + reviews.create mutation.
 */

'use client';

import { useState } from 'react';

import { useSession } from '@maison/auth/client';

import { trpc } from '@/lib/trpc/client';
import { formatDate } from '@/lib/utils';

interface ReviewsSectionProps {
  productSlug: string;
}

export function ReviewsSection({ productSlug }: ReviewsSectionProps) {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = trpc.reviews.list.useQuery({ productSlug });
  const createReview = trpc.reviews.create.useMutation();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createReview.mutateAsync({
      productSlug,
      rating,
      title: title || undefined,
      body: body || undefined,
    });
    setSubmitted(true);
    setShowForm(false);
    setTitle('');
    setBody('');
    setRating(5);
  };

  if (isLoading) return null;

  const reviews = data?.items ?? [];
  const avgRating = data?.averageRating ?? 0;
  const totalReviews = data?.totalReviews ?? 0;

  return (
    <section
      style={{
        marginTop: '4rem',
        paddingTop: '3rem',
        borderTop: '1px solid var(--line)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 500,
            }}
          >
            Customer <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>reviews</em>
          </h2>
          {totalReviews > 0 && (
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--gold)' }}>
                {'★'.repeat(Math.round(avgRating))}
                {'☆'.repeat(5 - Math.round(avgRating))}
              </span>{' '}
              {avgRating} out of 5 · {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>
        {session && !submitted && (
          <button
            onClick={() => {
              setShowForm(!showForm);
            }}
            style={{
              padding: '0.6rem 1.25rem',
              border: '1px solid var(--ink)',
              background: 'transparent',
              color: 'var(--ink)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {submitted && (
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(139,154,130,0.1)',
            border: '1px solid var(--sage)',
            marginBottom: '2rem',
          }}
        >
          <p style={{ color: 'var(--sage)', fontSize: '0.875rem' }}>
            ✓ Thank you! Your review has been submitted and is pending approval.
          </p>
        </div>
      )}

      {showForm && session && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          style={{
            padding: '2rem',
            background: 'var(--bg-2)',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 500,
            }}
          >
            Write a Review
          </h3>
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.5rem',
                display: 'block',
              }}
            >
              Rating
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: star <= rating ? 'var(--gold)' : 'var(--line)',
                  }}
                  aria-label={`${String(star)} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.3rem',
                display: 'block',
              }}
            >
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              maxLength={100}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--line)',
                background: 'var(--bg-card)',
                fontSize: 14,
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.3rem',
                display: 'block',
              }}
            >
              Your Review (optional)
            </label>
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
              }}
              rows={4}
              maxLength={5000}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--line)',
                background: 'var(--bg-card)',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={createReview.isPending}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'var(--clay)',
              color: 'var(--bg)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            {createReview.isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p style={{ color: 'var(--muted)', padding: '1rem 0' }}>
          {session
            ? 'No reviews yet. Be the first to share your thoughts.'
            : 'No reviews yet. Sign in to write the first review.'}
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '1.5rem 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{review.customerName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--gold)', fontSize: '0.875rem' }}>
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </p>
                  {review.isVerifiedPurchase && (
                    <p
                      style={{
                        fontSize: 10,
                        color: 'var(--sage)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      ✓ Verified Purchase
                    </p>
                  )}
                </div>
              </div>
              {review.title && (
                <h4
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.0625rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  {review.title}
                </h4>
              )}
              {review.body && (
                <p
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: 'var(--ink-2)',
                  }}
                >
                  {review.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
