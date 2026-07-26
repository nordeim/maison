/**
 * Maison — Admin reviews moderation (Server Component + Client actions)
 */

import { api } from "@/lib/trpc/server";
import { formatDate } from "@/lib/utils";
import { ReviewActions } from "@/components/admin/ReviewActions";

export default async function AdminReviewsPage() {
  let pending: Array<{
    id: string;
    productName: string | null;
    productSlug: string | null;
    customerName: string;
    rating: number;
    title: string | null;
    body: string | null;
    isVerifiedPurchase: boolean;
    createdAt: Date;
  }> = [];

  try {
    pending = await api().reviews.pendingList();
  } catch (err) {
    console.error("[admin reviews] Failed to fetch:", err);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Review Moderation ({pending.length})</h2>

      {pending.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "2rem 0" }}>No pending reviews. All caught up!</p>
      ) : (
        <div>
          {pending.map((review) => (
            <div key={review.id} style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-card)", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{review.customerName}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {formatDate(review.createdAt)} · {review.productName ?? "Unknown product"}
                    {review.isVerifiedPurchase && <span style={{ color: "var(--sage)", marginLeft: "0.5rem" }}>✓ Verified Purchase</span>}
                  </p>
                </div>
                <p style={{ color: "var(--gold)", fontSize: "0.875rem" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
              </div>
              {review.title && <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.0625rem", fontWeight: 500, marginBottom: "0.5rem" }}>{review.title}</h4>}
              {review.body && <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "var(--ink-2)", marginBottom: "1rem" }}>{review.body}</p>}
              <ReviewActions reviewId={review.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
