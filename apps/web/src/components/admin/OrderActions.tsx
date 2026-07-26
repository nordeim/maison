/**
 * Maison — Order actions (Client Component)
 *
 * Dropdown for updating order status (fulfillment actions).
 * Calls tRPC admin.ordersUpdateStatus mutation.
 */

"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirm" },
  { value: "shipped", label: "Mark Shipped" },
  { value: "delivered", label: "Mark Delivered" },
  { value: "cancelled", label: "Cancel" },
  { value: "refunded", label: "Refund" },
];

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateStatus = trpc.admin.ordersUpdateStatus.useMutation();
  const utils = trpc.useUtils();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      await updateStatus.mutateAsync({
        orderId,
        status: newStatus as "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded",
      });
      utils.admin.ordersList.invalidate();
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      style={{
        padding: "0.35rem 0.75rem",
        fontSize: 12,
        border: "1px solid var(--line)",
        background: "var(--bg)",
        color: "var(--ink)",
        cursor: isUpdating ? "wait" : "pointer",
      }}
      aria-label={`Update order status (currently ${currentStatus})`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
