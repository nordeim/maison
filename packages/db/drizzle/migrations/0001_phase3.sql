-- Maison — Phase 3 migration
-- Adds: product_reviews, gift_cards, gift_card_redemptions, trade_applications, loyalty_accounts, loyalty_transactions

-- ─── Product Reviews ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "product_reviews" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
    "customer_id" uuid REFERENCES "customers"("id") ON DELETE set null,
    "customer_name" text NOT NULL,
    "customer_email" text,
    "rating" integer NOT NULL,
    "title" text,
    "body" text,
    "photo_urls" text[],
    "is_approved" boolean NOT NULL DEFAULT false,
    "is_verified_purchase" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "product_reviews_product_id_idx" ON "product_reviews"("product_id");
CREATE INDEX IF NOT EXISTS "product_reviews_approved_idx" ON "product_reviews"("is_approved");

-- ─── Gift Cards ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "gift_cards" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" text NOT NULL UNIQUE,
    "initial_balance_cents" integer NOT NULL,
    "balance_cents" integer NOT NULL,
    "currency" text NOT NULL DEFAULT 'USD',
    "purchaser_customer_id" uuid REFERENCES "customers"("id") ON DELETE set null,
    "purchaser_email" text NOT NULL,
    "recipient_email" text NOT NULL,
    "recipient_name" text,
    "message" text,
    "purchased_from_order_id" uuid REFERENCES "orders"("id") ON DELETE set null,
    "expires_at" timestamptz,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "gift_card_redemptions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "gift_card_id" uuid NOT NULL REFERENCES "gift_cards"("id") ON DELETE cascade,
    "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
    "amount_cents" integer NOT NULL,
    "redeemed_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gift_cards_code_idx" ON "gift_cards"("code");
CREATE INDEX IF NOT EXISTS "gift_card_redemptions_gift_card_id_idx" ON "gift_card_redemptions"("gift_card_id");

-- ─── Trade Applications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "trade_applications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text REFERENCES "users"("id") ON DELETE cascade,
    "email" text NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "company" text NOT NULL,
    "role" text NOT NULL,
    "website" text,
    "instagram" text,
    "project_types" text,
    "discount_percent" integer DEFAULT 10,
    "status" text NOT NULL DEFAULT 'pending',
    "reviewed_by" text REFERENCES "users"("id") ON DELETE set null,
    "reviewed_at" timestamptz,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "trade_applications_status_idx" ON "trade_applications"("status");
CREATE INDEX IF NOT EXISTS "trade_applications_email_idx" ON "trade_applications"("email");

-- ─── Loyalty Program ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "loyalty_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid NOT NULL UNIQUE REFERENCES "customers"("id") ON DELETE cascade,
    "points_balance" integer NOT NULL DEFAULT 0,
    "lifetime_points" integer NOT NULL DEFAULT 0,
    "tier" text NOT NULL DEFAULT 'member',
    "joined_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "loyalty_account_id" uuid NOT NULL REFERENCES "loyalty_accounts"("id") ON DELETE cascade,
    "order_id" uuid REFERENCES "orders"("id") ON DELETE set null,
    "type" text NOT NULL,
    "points" integer NOT NULL,
    "description" text,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "loyalty_transactions_account_idx" ON "loyalty_transactions"("loyalty_account_id");
CREATE INDEX IF NOT EXISTS "loyalty_transactions_created_at_idx" ON "loyalty_transactions"("created_at");

-- ─── Add loyalty_tier to customers (for quick access) ─────────────
-- This is a denormalized field for quick tier lookup without joining loyalty_accounts
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "loyalty_tier" text DEFAULT 'member';
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "trade_discount_percent" integer DEFAULT 0;
