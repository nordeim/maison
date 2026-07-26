/**
 * Maison — Payment types
 */

import type Stripe from "stripe";

export interface CreatePaymentIntentInput {
  amountCents: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export type { Stripe };
