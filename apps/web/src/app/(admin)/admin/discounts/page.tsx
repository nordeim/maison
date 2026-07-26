/**
 * Maison — Admin: Discounts management (Server Component)
 *
 * Lists all promo codes with create form (Client Component).
 */

import { api } from "@/lib/trpc/server";
import { DiscountManager } from "@/components/admin/DiscountManager";

export default async function AdminDiscountsPage() {
  let discounts: Array<{
    id: string;
    code: string;
    type: string;
    value: number;
    minOrderCents: number;
    maxUses: number | null;
    usesCount: number;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  }> = [];

  try {
    discounts = await api().admin.discountsList();
  } catch (err) {
    console.error("[admin discounts] Failed to fetch:", err);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Discount Codes</h2>

      <DiscountManager initialDiscounts={discounts} />
    </div>
  );
}
