-- Maison — Initial migration
-- Generated from packages/db/src/schema/*.ts
--
-- This migration creates all 16 tables + 4 enums for the Maison e-commerce platform.
-- Run via: pnpm db:migrate  (uses DATABASE_URL_UNPOOLED)

-- ─── Enums ─────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE "user_role" AS ENUM('customer', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "order_status" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "discount_type" AS ENUM('percentage', 'fixed', 'free_shipping');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "shipping_method" AS ENUM('standard', 'express', 'white_glove');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── Better Auth managed tables ────────────────────────────────────

CREATE TABLE IF NOT EXISTS "users" (
    "id" text PRIMARY KEY NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" boolean NOT NULL DEFAULT false,
    "name" text,
    "image" text,
    "role" "user_role" NOT NULL DEFAULT 'customer',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "expires_at" timestamptz NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "provider_id" text NOT NULL,
    "account_id" text NOT NULL,
    "access_token" text,
    "refresh_token" text,
    "expires_at" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamptz NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- ─── Application tables ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "customers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE cascade,
    "first_name" text,
    "last_name" text,
    "phone" text,
    "newsletter_subscribed" boolean NOT NULL DEFAULT false,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "addresses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
    "label" text,
    "line1" text NOT NULL,
    "line2" text,
    "city" text NOT NULL,
    "region" text,
    "postal_code" text NOT NULL,
    "country" text NOT NULL,
    "is_default_shipping" boolean NOT NULL DEFAULT false,
    "is_default_billing" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "collections" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "name" text NOT NULL,
    "description" text,
    "hero_image_url" text,
    "hero_image_alt" text,
    "sort_order" integer NOT NULL DEFAULT 0,
    "is_active" boolean NOT NULL DEFAULT true,
    "seo_title" text,
    "seo_description" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "name" text NOT NULL,
    "collection_id" uuid REFERENCES "collections"("id") ON DELETE set null,
    "price_cents" integer NOT NULL,
    "compare_at_price_cents" integer,
    "currency" text NOT NULL DEFAULT 'USD',
    "short_description" text,
    "long_description" text,
    "materials" text,
    "dimensions" text,
    "weight_grams" integer,
    "featured" boolean NOT NULL DEFAULT false,
    "is_new" boolean NOT NULL DEFAULT false,
    "is_bestseller" boolean NOT NULL DEFAULT false,
    "is_active" boolean NOT NULL DEFAULT true,
    "seo_title" text,
    "seo_description" text,
    "og_image_url" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
    "sku" text NOT NULL UNIQUE,
    "name" text NOT NULL,
    "price_cents" integer,
    "stock_quantity" integer NOT NULL DEFAULT 0,
    "lead_time_days" integer NOT NULL DEFAULT 0,
    "is_active" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "product_images" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
    "url" text NOT NULL,
    "alt_text" text,
    "sort_order" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "carts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid REFERENCES "customers"("id") ON DELETE cascade,
    "anonymous_id" text,
    "currency" text NOT NULL DEFAULT 'USD',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "cart_id" uuid NOT NULL REFERENCES "carts"("id") ON DELETE cascade,
    "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
    "variant_id" uuid REFERENCES "product_variants"("id") ON DELETE set null,
    "quantity" integer NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "order_number" text NOT NULL UNIQUE,
    "customer_id" uuid REFERENCES "customers"("id") ON DELETE set null,
    "email" text NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "subtotal_cents" integer NOT NULL,
    "shipping_cost_cents" integer NOT NULL,
    "tax_cents" integer NOT NULL,
    "discount_cents" integer NOT NULL DEFAULT 0,
    "total_cents" integer NOT NULL,
    "currency" text NOT NULL DEFAULT 'USD',
    "shipping_address" jsonb NOT NULL,
    "billing_address" jsonb NOT NULL,
    "shipping_method" "shipping_method",
    "tracking_number" text,
    "tracking_url" text,
    "stripe_payment_intent_id" text,
    "stripe_idempotency_key" text UNIQUE,
    "placed_at" timestamptz,
    "shipped_at" timestamptz,
    "delivered_at" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "line_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
    "product_id" uuid REFERENCES "products"("id") ON DELETE set null,
    "variant_id" uuid REFERENCES "product_variants"("id") ON DELETE set null,
    "product_name" text NOT NULL,
    "variant_name" text,
    "price_cents" integer NOT NULL,
    "quantity" integer NOT NULL,
    "image_url" text
);

CREATE TABLE IF NOT EXISTS "wishlist_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
    "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "wishlist_customer_product_unique" UNIQUE("customer_id", "product_id")
);

CREATE TABLE IF NOT EXISTS "discounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" text NOT NULL UNIQUE,
    "type" "discount_type" NOT NULL,
    "value" integer NOT NULL,
    "min_order_cents" integer NOT NULL DEFAULT 0,
    "max_uses" integer,
    "uses_count" integer NOT NULL DEFAULT 0,
    "starts_at" timestamptz,
    "ends_at" timestamptz,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "actor_user_id" text REFERENCES "users"("id") ON DELETE set null,
    "action" text NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" text,
    "diff" jsonb,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ───────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session"("user_id");
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account"("user_id");
CREATE INDEX IF NOT EXISTS "products_collection_id_idx" ON "products"("collection_id");
CREATE INDEX IF NOT EXISTS "products_slug_idx" ON "products"("slug");
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants"("product_id");
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images"("product_id");
CREATE INDEX IF NOT EXISTS "cart_items_cart_id_idx" ON "cart_items"("cart_id");
CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders"("customer_id");
CREATE INDEX IF NOT EXISTS "orders_order_number_idx" ON "orders"("order_number");
CREATE INDEX IF NOT EXISTS "line_items_order_id_idx" ON "line_items"("order_id");
CREATE INDEX IF NOT EXISTS "wishlist_items_customer_id_idx" ON "wishlist_items"("customer_id");
CREATE INDEX IF NOT EXISTS "audit_log_actor_user_id_idx" ON "audit_log"("actor_user_id");
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "audit_log"("created_at");

-- Full-text search index for product search (Phase 1)
CREATE INDEX IF NOT EXISTS "products_fts_idx" ON "products" USING gin (
    to_tsvector('english', coalesce("name", '') || ' ' || coalesce("short_description", '') || ' ' || coalesce("materials", ''))
);
