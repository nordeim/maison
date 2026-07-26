/**
 * Maison — Review moderation actions (Client Component)
 */

"use client";

import { trpc } from "@/lib/trpc/client";

export function ReviewActions({ reviewId }: { reviewId: string }) {
  const approve = trpc.reviews.approve.useMutation();
  const reject = trpc.reviews.reject.useMutation();

  const handleApprove = async () => {
    await approve.mutateAsync({ reviewId });
    window.location.reload();
  };

  const handleReject = async () => {
    if (!confirm("Reject (delete) this review?")) return;
    await reject.mutateAsync({ reviewId });
    window.location.reload();
  };

  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <button onClick={handleApprove} disabled={approve.isPending} style={{ padding: "0.4rem 1rem", background: "var(--sage)", color: "var(--bg)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
        {approve.isPending ? "…" : "Approve"}
      </button>
      <button onClick={handleReject} disabled={reject.isPending} style={{ padding: "0.4rem 1rem", border: "1px solid var(--clay)", background: "transparent", color: "var(--clay)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
        {reject.isPending ? "…" : "Reject"}
      </button>
    </div>
  );
}
