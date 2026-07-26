/**
 * Maison — Trade application actions (Client Component)
 */

"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export function TradeActions({ applicationId, defaultDiscount }: { applicationId: string; defaultDiscount: number }) {
  const [discount, setDiscount] = useState(defaultDiscount);
  const approve = trpc.trade.approve.useMutation();
  const reject = trpc.trade.reject.useMutation();
  const utils = trpc.useUtils();

  const handleApprove = async () => {
    await approve.mutateAsync({ applicationId, discountPercent: discount });
    utils.trade.list.invalidate();
  };

  const handleReject = async () => {
    await reject.mutateAsync({ applicationId });
    utils.trade.list.invalidate();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--line-soft)" }}>
      <label style={{ fontSize: 12, color: "var(--muted)" }}>
        Discount:
        <select value={discount} onChange={(e) => setDiscount(parseInt(e.target.value, 10))} style={{ marginLeft: "0.5rem", padding: "0.25rem 0.5rem", border: "1px solid var(--line)", background: "var(--bg)", fontSize: 12 }}>
          <option value={10}>10%</option>
          <option value={15}>15%</option>
          <option value={20}>20%</option>
        </select>
      </label>
      <button onClick={handleApprove} disabled={approve.isPending} style={{ padding: "0.4rem 1rem", background: "var(--sage)", color: "var(--bg)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
        {approve.isPending ? "…" : "Approve"}
      </button>
      <button onClick={handleReject} disabled={reject.isPending} style={{ padding: "0.4rem 1rem", border: "1px solid var(--clay)", background: "transparent", color: "var(--clay)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
        {reject.isPending ? "…" : "Reject"}
      </button>
    </div>
  );
}
