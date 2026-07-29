# Condensation Plan

## 1. Define the session scope

`status_8.md` is primarily a TypeScript remediation and scaffolding session for `@maison/web`. Its central objective is:

> Resolve the `@maison/web` `check-types` failure that was blocking the pre-commit gate, using the Stillwater reference codebase and the project skill documentation as proven patterns.

The brief should focus on:

- The original `check-types` failure: 108 TypeScript errors across 43 files.
- The discovery that the Project Brief’s diagnosis was incomplete.
- The three true root causes:
  1. Broken `@/*` path alias resolution.
  2. Missing `apps/web/src/lib/` scaffolding.
  3. Incorrect consumption of the async tRPC server caller `api()`.
- The later final pass that resolved the remaining 5 semantic/type-contract errors via router-boundary coercion.
- The final green verification state.

It should not treat the session as merely “adding missing files.” The key insight is that the error surface was caused by multiple layered problems, not just absent scaffolding.

---

## 2. Preserve the investigative arc

The brief should retain the sequence of discovery:

1. The agent begins from the Stillwater reference and the skill documentation.
2. It inventories missing imports and expected exports.
3. It discovers that many “missing” component files actually exist.
4. It proves with an isolated probe and `tsc --traceResolution` that the `@/*` alias is resolving to the wrong directory.
5. It fixes the alias by adding a local `baseUrl` to `apps/web/tsconfig.json`.
6. It scaffolds the genuinely missing `lib/` modules.
7. It uncovers a new hidden root cause once module-resolution errors disappear: consumers call `api().router.procedure()` without awaiting the caller.
8. It fixes the `api()` consumer pattern across many pages.
9. It fixes several unambiguous secondary TypeScript errors.
10. It flags 5 remaining semantic/type-contract errors.
11. In the final pass, it resolves those 5 errors by shaping data at the router boundary and removing dead checkout logic.
12. It verifies `check-types` green across the monorepo.

---

## 3. Emphasize decisions and rationale

The brief should explain why each major decision was made:

- Why Stillwater was used as a reference.
- Why the Project Brief diagnosis was validated rather than trusted.
- Why the alias fix was necessary before scaffolding.
- Why the lib files were adapted to Maison’s actual API contracts rather than copied blindly.
- Why the `api()` consumer pattern had to change.
- Why secondary errors were split into “unambiguous” versus “semantic.”
- Why the final semantic errors were fixed via router-boundary coercion rather than widening component props.

---

## 4. Separate resolved work from outstanding work

The session resolves the TypeScript `check-types` blocker, but several adjacent concerns remain:

- ESLint infrastructure is broken.
- Tests, build, and dev runtime verification were not performed.
- Nothing was committed or pushed.
- Some coercion choices are business/display decisions that may deserve review.
- `TRPCProvider` mounting and runtime behavior remain unverified.

The brief should clearly separate these from the completed type-checking work.

---

# Condensed Brief: `@maison/web` Type-Check Remediation and Scaffolding

## Objective

Resolve the `@maison/web` TypeScript failure captured in `error.txt`. The failure was blocking the pre-commit gate and originally manifested as:

```text
@maison/web#check-types
108 TypeScript errors across 43 files
```

The work was guided by the Stillwater reference codebase and the `nextjs16-react19-tailwind4-better-auth-monorepo` skill, but adapted to Maison’s actual package contracts and codebase conventions.

---

# Key Events

## 1. The Project Brief diagnosis was validated and partially rebutted

The prior Project Brief claimed that the main problem was a scaffolding gap:

> The entire `apps/web/src/lib/` directory was absent, causing imports such as `@/lib/trpc/client`, `@/lib/trpc/server`, and `@/lib/utils` to fail.

The agent validated this against the live codebase and found it was only partially correct.

### What was true

The `src/lib/` scaffolding was genuinely missing or incomplete:

- `@/lib/trpc/client`
- `@/lib/trpc/server`
- `@/lib/utils`

These modules were required by many shop, admin, and account pages.

### What was misleading

Many component files reported as unresolved actually existed:

```text
apps/web/src/components/shop/ProductCard.tsx
apps/web/src/components/shop/AnnouncementBar.tsx
apps/web/src/components/shop/CartProvider.tsx
apps/web/src/components/shop/Header.tsx
apps/web/src/components/shop/Footer.tsx
...
```

Yet imports such as:

```ts
import { ProductCard } from '@/components/shop/ProductCard';
```

still failed with:

```text
TS2307: Cannot find module '@/components/shop/ProductCard'
```

This proved the problem was not only missing files. Module resolution itself was broken.

---

## 2. Root Cause A — Broken `@/*` path alias

The agent created an isolated probe importing a self-contained component that had no missing dependencies:

```ts
import { AnnouncementBar } from '@/components/shop/AnnouncementBar';
```

The import still failed, proving that the `@/*` alias was not resolving correctly.

Running:

```bash
tsc --traceResolution
```

revealed the decisive evidence:

```text
'baseUrl' option is set to '/home/project/maison/tooling/typescript'
Trying substitution './src/*'
Candidate module location:
/home/project/maison/tooling/typescript/src/components/shop/AnnouncementBar
Module '@/components/shop/AnnouncementBar' was not resolved.
```

### Root cause

`apps/web/tsconfig.json` extended:

```text
@maison/typescript-config/nextjs.json
```

which ultimately inherited:

```json
"baseUrl": "."
```

from `tooling/typescript/base.json`.

Because that `baseUrl` was resolved relative to the shared config package, the alias:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

was being resolved under:

```text
tooling/typescript/src/*
```

instead of:

```text
apps/web/src/*
```

### Fix

Add a local `baseUrl` to the web app’s own `tsconfig.json`:

```json
{
  "extends": "@maison/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

This matched the Stillwater reference configuration.

### Result

Error count dropped:

```text
108 → 77
```

All `@/components/*` resolution errors disappeared. Existing components now resolved correctly.

---

## 3. Root Cause B — Missing `src/lib/` scaffolding

After the alias fix, the remaining unresolved modules were exactly the genuinely missing lib modules:

```text
@/lib/trpc/client
@/lib/trpc/server
@/lib/utils
```

The agent used Stillwater as the reference implementation but adapted the files to Maison’s actual contracts.

### Required exports discovered from real consumers

By inspecting actual call sites, the required API surface was:

```ts
// @/lib/trpc/client
export const trpc = createTRPCReact<AppRouter>();
export function TRPCProvider(...): JSX.Element;

// @/lib/trpc/server
export async function api(): Promise<Caller>;

// @/lib/utils
export function cn(...inputs: ClassValue[]): string;
export function formatPrice(priceCents: number, currency?: string | null): string;
export function formatDate(date: Date | string): string;
```

### Files created or completed

```text
apps/web/src/lib/trpc/server.ts
apps/web/src/lib/trpc/client.tsx
apps/web/src/lib/utils.ts
```

No new dependencies were required. The web app already had:

```text
@trpc/react-query
@trpc/client
@tanstack/react-query
clsx
tailwind-merge
server-only
@maison/api
@maison/config
```

### Design decisions

- `server.ts` used the Stillwater server-caller pattern but adapted to Maison’s:
  ```ts
  createContext({ req })
  ```
- `client.tsx` exposed:
  ```ts
  trpc
  TRPCProvider
  ```
  for Client Components.
- `utils.ts` implemented:
  ```ts
  cn = clsx + tailwind-merge
  ```
  exactly following Stillwater.
- `formatPrice` used integer cents and defaulted currency from Maison’s canonical site config:
  ```ts
  site.shipping.currency // 'USD'
  ```
  rather than hardcoding a value.
- `formatDate` accepted both `Date` and ISO string values because server-rendered and serialized data paths can produce either.

### Result

The scaffolding gap was closed:

```text
0 remaining @/lib resolution errors
```

However, this exposed a deeper, previously masked root cause.

---

## 4. Root Cause C — Incorrect `api()` consumer pattern

Once module-resolution errors were removed, the dominant remaining error class became:

```text
TS2339: Property 'account' does not exist on type 'Promise<DecorateRouterRecord<...>>'
```

There were 28 such errors.

### Root cause

The server caller was defined as:

```ts
export async function api() {
  return appRouter.createCaller(ctx);
}
```

Therefore:

```ts
api()
```

returns a `Promise` that resolves to a tRPC caller.

But consumers were calling:

```ts
await api().account.listOrders();
```

or:

```ts
Promise.all([
  api().account.getProfile(),
  api().account.listOrders(),
  api().account.listWishlist(),
]);
```

This accessed `.account` on the unresolved `Promise`, not on the caller.

### Correct pattern

```ts
const caller = await api();
await caller.account.listOrders();
```

For parallel calls:

```ts
const caller = await api();

const [profile, orders, wishlist] = await Promise.all([
  caller.account.getProfile(),
  caller.account.listOrders(),
  caller.account.listWishlist(),
]);
```

### Why this mattered

Besides fixing the type errors, this also corrected a latent runtime issue: repeated `api()` calls rebuilt the caller, context, and potentially session/header-derived state multiple times per page.

### Files affected

The pattern was fixed across many Server Component pages, including:

```text
apps/web/src/app/(account)/account/page.tsx
apps/web/src/app/(account)/account/orders/page.tsx
apps/web/src/app/(account)/account/wishlist/page.tsx
apps/web/src/app/(admin)/admin/page.tsx
apps/web/src/app/(admin)/admin/analytics/page.tsx
apps/web/src/app/(admin)/admin/customers/page.tsx
apps/web/src/app/(admin)/admin/discounts/page.tsx
apps/web/src/app/(admin)/admin/inventory/page.tsx
apps/web/src/app/(admin)/admin/orders/page.tsx
apps/web/src/app/(admin)/admin/products/page.tsx
apps/web/src/app/(admin)/admin/reviews/page.tsx
apps/web/src/app/(admin)/admin/trade/page.tsx
apps/web/src/app/(shop)/page.tsx
apps/web/src/app/(shop)/collections/page.tsx
apps/web/src/app/(shop)/products/page.tsx
apps/web/src/app/(shop)/products/[slug]/page.tsx
apps/web/src/app/(shop)/search/page.tsx
```

A local type helper was also introduced in the product detail page:

```ts
type Caller = Awaited<ReturnType<typeof api>>;
```

A missing `Metadata` import was also added:

```ts
import type { Metadata } from 'next';
```

### Result

The 28 `TS2339` errors were eliminated, and the error count fell to 5 remaining semantic/type-contract errors.

---

## 5. Unambiguous secondary errors were fixed

The user approved fixing all unambiguous secondary errors while flagging semantic ones for review.

### Sentry `silent` option removed

Files:

```text
apps/web/sentry.client.config.ts
apps/web/sentry.edge.config.ts
apps/web/sentry.server.config.ts
```

Error:

```text
TS2353: 'silent' does not exist in type 'BrowserOptions | NodeOptions | EdgeOptions'
```

Fix:

```diff
- silent: true,
```

Reason: `silent` is not a valid option in the current Sentry configuration types.

---

### Manifest keys corrected

File:

```text
apps/web/src/app/manifest.ts
```

Next.js expects snake_case manifest fields:

```diff
- shortName: site.name,
+ short_name: site.name,

- startUrl: '/',
+ start_url: '/',

- backgroundColor: site.themeColor,
- themeColor: site.themeColor,
+ background_color: site.themeColor,
+ theme_color: site.themeColor,
```

---

### tRPC route handler `onError` fixed for `exactOptionalPropertyTypes`

File:

```text
apps/web/src/app/api/trpc/[trpc]/route.ts
```

Problem:

```ts
onError: env.NODE_ENV === 'development' ? handler : undefined
```

violated:

```text
exactOptionalPropertyTypes
```

Fix:

```ts
...(env.NODE_ENV === 'development'
  ? {
      onError: ({ path, error }) => {
        console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
      },
    }
  : {}),
```

Reason: the property is now omitted entirely in production rather than explicitly set to `undefined`.

---

### Checkout shipping label indexing guarded

File:

```text
apps/web/src/app/(shop)/checkout/page.tsx
```

Problem:

```text
TS2532: Object is possibly 'undefined'
```

Fix:

```diff
- {SHIPPING_LABELS[shipping.shippingMethod].split('(')[1]?.replace(')', '') ?? '5–7 days'}
+ {SHIPPING_LABELS[shipping.shippingMethod]?.split('(')[1]?.replace(')', '') ?? '5–7 days'}
```

Reason: `noUncheckedIndexedAccess` makes indexed lookup results possibly undefined.

---

### CartProvider cookie parsing guarded

File:

```text
apps/web/src/components/shop/CartProvider.tsx
```

Problem:

```text
TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'
```

Fix:

```diff
- return match ? decodeURIComponent(match[1]) : null;
+ return match ? decodeURIComponent(match[1] ?? '') : null;
```

Reason: regex capture groups are typed as possibly undefined under strict index access rules.

---

## 6. Five semantic/type-contract errors remained

After the above fixes, the remaining errors were:

| File | Error | Class |
|---|---|---|
| `apps/web/src/app/(shop)/page.tsx` | `boolean \| null` not assignable to `boolean` | Product flag nullability |
| `apps/web/src/app/(shop)/products/page.tsx` | `boolean \| null` not assignable to `boolean` | Product flag nullability |
| `apps/web/src/app/(admin)/admin/customers/page.tsx` | `string \| null` not assignable to `string` | Nullable email |
| `apps/web/src/app/(admin)/admin/trade/page.tsx` | Missing/nullable `userId` and `discountPercent` shape mismatch | Trade application shape |
| `apps/web/src/app/(shop)/checkout/page.tsx` | Dead `step === 'confirmation'` comparison | Control-flow narrowing |

These were initially flagged because they involved type contracts between routers, pages, and components.

---

## 7. Final fix strategy — boundary coercion at the routers

The user approved the recommended strategy:

> Boundary-coerce all three router return shapes and remove the dead checkout branch.

This aligned with the Stillwater pattern: routers should return explicit, UI-friendly shapes rather than leaking raw Drizzle nullable rows.

---

# Final Actions and Rationale

## Action 1 — Coerce product flags in `products.list`

File:

```text
packages/api/src/routers/products.ts
```

Problem:

`featured`, `isNew`, and `isBestseller` were surfacing as:

```ts
boolean | null
```

even though the schema declares them as:

```ts
.notNull().default(false)
```

The nullability was a Drizzle left-join inference artifact combined with stale page-level type annotations.

Fix:

```ts
items: itemsToSend.map((row) => ({
  ...row,
  collectionName: row.collectionName,
  featured: Boolean(row.featured),
  isNew: Boolean(row.isNew),
  isBestseller: Boolean(row.isBestseller),
})),
```

### Why

This gives UI components a strict non-null boolean contract:

```ts
featured: boolean
isNew: boolean
isBestseller: boolean
```

It avoids forcing every component to handle `null` for flags that are semantically boolean.

---

## Action 2 — Coerce customer email in `admin.customersList`

File:

```text
packages/api/src/routers/admin.ts
```

Problem:

`users.email` was surfacing as:

```ts
string | null
```

This was not because `users.email` is nullable in the schema — it is actually:

```ts
.notNull().unique()
```

The nullability appeared because of the left join between `customers` and `users`.

Fix:

```ts
items: items.map((row) => ({
  ...row,
  email: row.email ?? '',
})),
```

### Why

The admin customer list needs a displayable string contract. The empty-string fallback is a pragmatic boundary coercion for a left-join artifact.

---

## Action 3 — Shape trade application list in `trade.list`

File:

```text
packages/api/src/routers/trade.ts
```

Problem:

`trade.list` previously returned the raw Drizzle query without awaiting or shaping it:

```ts
return ctx.db.select()...
```

Also:

```ts
discountPercent
```

is genuinely nullable in the schema:

```ts
integer('discount_percent').default(10)
```

without `.notNull()`.

Fix:

```ts
const rows = whereClause
  ? await ctx.db
      .select()
      .from(tradeApplications)
      .where(whereClause)
      .orderBy(desc(tradeApplications.createdAt))
  : await ctx.db
      .select()
      .from(tradeApplications)
      .orderBy(desc(tradeApplications.createdAt));

return rows.map((row) => ({
  ...row,
  discountPercent: row.discountPercent ?? 10,
}));
```

### Why

The router now:

- awaits the query,
- returns a shaped array,
- coerces nullable `discountPercent` to the documented schema default,
- preserves `userId` in the returned shape.

The admin trade page was also updated to accept:

```ts
userId: string | null;
```

---

## Action 4 — Remove dead checkout comparison

File:

```text
apps/web/src/app/(shop)/checkout/page.tsx
```

Problem:

The page contained:

```ts
type Step = 'shipping' | 'payment' | 'review' | 'confirmation';
```

But earlier in the render logic there was an early return:

```ts
if (step === 'confirmation') {
  return (...);
}
```

After that early return, TypeScript narrowed `step` to:

```ts
'shipping' | 'payment' | 'review'
```

Therefore this later comparison was unreachable:

```ts
step === 'confirmation'
```

Fix:

```diff
- step === 'confirmation' ||
-   (step === 'payment' && s === 'shipping') ||
+ (step === 'payment' && s === 'shipping') ||
    (step === 'review' && (s === 'shipping' || s === 'payment'))
```

### Why

The comparison was genuinely dead code caused by control-flow narrowing. Removing it made the step-indicator logic match the actual reachable state machine.

---

## Action 5 — Update stale page-level product type annotations

Files:

```text
apps/web/src/app/(shop)/page.tsx
apps/web/src/app/(shop)/products/page.tsx
```

Problem:

The pages declared local product arrays as:

```ts
featured: boolean | null;
isNew: boolean | null;
isBestseller: boolean | null;
```

But the router now returns strict booleans.

Fix:

```diff
- featured: boolean | null;
- isNew: boolean | null;
- isBestseller: boolean | null;
+ featured: boolean;
+ isNew: boolean;
+ isBestseller: boolean;
```

### Why

The local annotations were stale and stricter than the component contract while looser than the new router contract. Updating them aligned the page, router, and component types.

---

# Verification

## Final `check-types` result

```bash
pnpm check-types
```

Result:

```text
Tasks: 10 successful, 10 total
```

`@maison/web` now passes type-checking with zero errors.

Error progression:

```text
108 initial errors
 77 after baseUrl alias fix
 42 after lib scaffolding
  5 after api() consumer fixes and secondary fixes
  0 after router boundary coercion and page type updates
```

## Prettier

Prettier was run against the final changed files:

```text
packages/api/src/routers/products.ts
packages/api/src/routers/admin.ts
packages/api/src/routers/trade.ts
apps/web/src/app/(shop)/checkout/page.tsx
apps/web/src/app/(admin)/admin/trade/page.tsx
apps/web/src/app/(shop)/page.tsx
apps/web/src/app/(shop)/products/page.tsx
```

Result:

```text
All matched files use Prettier code style!
```

---

# Summary of Major Changes

## Configuration

```text
apps/web/tsconfig.json
```

Added:

```json
"baseUrl": "."
```

---

## Lib scaffolding

Created or completed:

```text
apps/web/src/lib/trpc/server.ts
apps/web/src/lib/trpc/client.tsx
apps/web/src/lib/utils.ts
```

Exports:

```ts
api()
trpc
TRPCProvider
cn()
formatPrice()
formatDate()
```

---

## Server-component consumer fixes

Many pages were updated from:

```ts
await api().products.list(...)
```

to:

```ts
const caller = await api();
await caller.products.list(...)
```

and from:

```ts
Promise.all([
  api().account.getProfile(),
  api().account.listOrders(),
])
```

to:

```ts
const caller = await api();

Promise.all([
  caller.account.getProfile(),
  caller.account.listOrders(),
])
```

---

## Secondary type fixes

```text
sentry.client.config.ts
sentry.edge.config.ts
sentry.server.config.ts
src/app/manifest.ts
src/app/api/trpc/[trpc]/route.ts
src/app/(shop)/checkout/page.tsx
src/components/shop/CartProvider.tsx
src/app/(shop)/products/[slug]/page.tsx
```

---

## Final router-boundary shaping

```text
packages/api/src/routers/products.ts
packages/api/src/routers/admin.ts
packages/api/src/routers/trade.ts
```

---

# Outstanding Issues

## 1. ESLint infrastructure remains broken

Running lint for `@maison/web` failed inside the shared ESLint config package:

```text
@maison/eslint-config
Invalid top-level property: __esModule
```

This is a pre-existing infrastructure issue unrelated to the TypeScript fixes. It prevents `pnpm lint` from completing cleanly.

Recommended follow-up:

- Repair `@maison/eslint-config` export shape.
- Re-run lint across the monorepo.
- Treat this as a separate infra task.

---

## 2. Tests, build, and dev runtime were not verified

The session focused on the `check-types` gate.

The following were not run as part of the final verification:

```bash
pnpm test
pnpm build
pnpm dev
```

Therefore, runtime behavior is not fully verified.

Recommended follow-up:

- Run `pnpm test`.
- Run `pnpm build`.
- Manually verify key pages:
  - homepage
  - product listing page
  - product detail page
  - checkout
  - account pages
  - admin pages

---

## 3. `TRPCProvider` mounting remains unverified

The client-side tRPC provider was scaffolded, but the session did not fully verify that `TRPCProvider` is mounted correctly in the app layout or that client components hydrate successfully at runtime.

Recommended follow-up:

- Confirm `TRPCProvider` wraps the relevant client component tree.
- Verify React Query hydration behavior.
- Test client-side queries and mutations in the browser.

---

## 4. Some coercion choices are display/business decisions

The final fixes intentionally coerce nullable values at the router boundary:

```ts
featured: Boolean(row.featured)
isNew: Boolean(row.isNew)
isBestseller: Boolean(row.isBestseller)

email: row.email ?? ''

discountPercent: row.discountPercent ?? 10
```

These are reasonable defaults, but they are not purely mechanical:

- `Boolean(null)` becomes `false`.
- `email ?? ''` hides a missing email behind an empty string.
- `discountPercent ?? 10` treats a null discount as the schema default.

These choices should be reviewed by the product/domain owner if null has semantic meaning rather than being a join artifact.

---

## 5. Nothing was committed or pushed

The working tree contains a large cumulative diff, including prior session work.

The agent did not:

- stage,
- commit,
- push,
- open a pull request.

Recommended follow-up:

- Review the diff.
- Separate commits logically if desired:
  1. tsconfig alias fix
  2. lib scaffolding
  3. `api()` consumer pattern fixes
  4. secondary type fixes
  5. router boundary shaping
- Commit using the repository’s required SSH wrapper convention.

---

## 6. Regression coverage is recommended

Because the final issue involved routers leaking raw Drizzle nullable shapes to the frontend, a regression guard would be valuable.

Recommended:

- Add a type-level or integration test asserting that `products.list` returns strict booleans for:
  ```ts
  featured
  isNew
  isBestseller
  ```
- Add tests for shaped admin return types:
  ```ts
  admin.customersList
  trade.list
  ```

---

# Bottom Line

The `@maison/web` `check-types` failure was not merely a missing-files problem. It was caused by three layered root causes:

1. **Broken `@/*` alias resolution** due to inherited `baseUrl` from the shared TypeScript config.
2. **Missing `src/lib/` scaffolding** for tRPC server/client bindings and shared utilities.
3. **Incorrect async `api()` consumption** across Server Components.

After fixing those, five remaining semantic/type-contract errors were resolved by shaping data at the router boundary, aligning with the Stillwater reference pattern.

Final state:

```text
@maison/web check-types: 0 errors
Monorepo check-types: 10/10 packages passing
Prettier on changed files: passing
```

Remaining work is primarily runtime and infrastructure verification: ESLint config repair, tests, build, dev validation, and commit hygiene.

---

# Condensation Plan for `status_9.md`

## 1. Define the session scope

`status_9.md` is the follow-on session after the TypeScript remediation captured in `previous_session_summary.md`.

The prior session ended with:

- `@maison/web` `check-types` passing.
- Monorepo `check-types` passing: `10/10` packages.
- ESLint infrastructure still broken.
- Tests, build, dev runtime, and commit/push still outstanding.

`status_9.md` is therefore primarily an **ESLint infrastructure remediation session** for `@maison/web`.

Its central objective is:

> Resolve the `@maison/web` lint failure that was blocking the pre-commit gate after TypeScript checks had already gone green.

The brief should focus on:

- The original failure:
  - `Unexpected top-level property "__esModule"` inside `@maison/eslint-config`.
- The discovery that this was not a normal lint-error backlog, but a **configuration-format mismatch**.
- The root cause:
  - `tooling/eslint/index.js` is a modern ESLint v9 flat ESM config.
  - `apps/web/eslint.config.mjs` consumed it through the legacy `FlatCompat` shim from `@eslint/eslintrc`.
  - `FlatCompat.extends()` expects legacy eslintrc-style config objects, not flat ESM arrays.
  - ESM/CJS interop introduced an `__esModule: true` marker, which the legacy validator rejected.
- The Stillwater reference pattern:
  - shared config package uses proper `exports`.
  - app consumes shared config directly as flat config.
- The surgical two-file fix.
- The verification result:
  - fatal ESLint config error removed.
  - ESLint now runs.
  - `lint:fix` auto-resolved many issues.
  - remaining issues are genuine source-code lint violations, not config scaffolding failures.
- The outstanding work:
  - remaining lint violations.
  - no commit/push.
  - full monorepo lint/runtime verification still incomplete.

The brief should not present the session as “fixing lint errors.” The key insight is that the session fixed the **lint infrastructure blocker**, which then unmasked real lint debt.

---

## 2. Preserve the investigative arc

The brief should retain the sequence of discovery:

1. The agent begins from `error.txt` and the Project Brief.
2. It observes that `check-types` is now green/cached, but lint fails.
3. It identifies the failing package as `@maison/eslint-config`.
4. It locates the relevant files:
   - `tooling/eslint/index.js`
   - `tooling/eslint/package.json`
   - `apps/web/eslint.config.mjs`
5. It discovers that the shared config is written as a modern flat ESM config.
6. It discovers that the web app consumes that config through `FlatCompat.extends("@maison/eslint-config")`.
7. It reproduces the failure cleanly using ESLint config inspection.
8. It proves the root cause:
   - legacy loader consuming modern flat config.
   - `__esModule` interop marker leaking into config validation.
9. It consults the Stillwater reference codebase.
10. It finds that Stillwater avoids `FlatCompat` entirely:
    - shared package uses `exports`.
    - app imports shared config directly.
    - app spreads shared config into a flat array.
11. It decides on a minimal two-file fix.
12. It applies the fix.
13. It verifies that ESLint can now parse the config and run.
14. It runs `lint:fix`, reducing the visible problem count.
15. It separates the resolved scaffolding blocker from the remaining genuine lint violations.
16. It stops short of fixing all source-code lint issues to preserve scope and commit discipline.

The brief should preserve this arc because the session’s value is not just the final edit, but the diagnosis: the lint failure looked like a lint-rule problem but was actually an ESLint config-format incompatibility.

---

## 3. Emphasize decisions and rationale

The brief should explain why each major decision was made.

### Why the session focused on ESLint rather than TypeScript

The previous session had already resolved the `check-types` blocker. The new `error.txt` showed:

- `check-types`: passing/cached.
- `lint`: failing with an ESLint config validation error.

Therefore the correct next blocker was the lint gate.

### Why the error was treated as scaffolding, not lint debt

The fatal message:

```text
Unexpected top-level property "__esModule"
```

is not a normal source-code lint violation. It indicates that ESLint could not even load the config. That means the failure was infrastructural.

The brief should make clear that ESLint never reached the source code before the fix.

### Why the Project Brief was validated rather than trusted

The Project Brief suggested broader scaffolding gaps. The agent validated this against the live repository:

- searched for ESLint configs.
- inspected `tooling/eslint`.
- inspected `apps/web/eslint.config.mjs`.
- reproduced the failure.

This avoided blindly applying a generic fix.

### Why Stillwater was used as the reference

Stillwater is the canonical working reference for this monorepo pattern. It demonstrated:

- proper ESM package resolution for shared ESLint config.
- direct flat-config consumption.
- no reliance on `FlatCompat`.

The brief should note that the agent did not copy Stillwater wholesale; it only adopted the structurally relevant pattern.

### Why the fix was limited to two files

The root cause was narrow:

1. `tooling/eslint/package.json` used legacy `"main"` instead of a proper ESM `exports` map.
2. `apps/web/eslint.config.mjs` used a legacy compatibility shim to load a flat config.

Therefore the correct fix was surgical.

The brief should emphasize that this avoided unnecessary churn across the repository.

### Why Stillwater’s extra override blocks were not copied

Stillwater’s ESLint config includes overrides for:

- test files.
- `src/components/ui`.
- dashboard areas.

Maison’s web app did not currently have:

- test files.
- `src/components/ui`.
- comparable dashboard structure.

Therefore copying those overrides would have been speculative. The brief should frame this as a simplicity/YAGNI decision aligned with repository discipline.

### Why `lint:fix` was run

Running `lint:fix` served two purposes:

1. It proved ESLint was now operational.
2. It separated mechanical auto-fixable issues from issues requiring human judgment.

The brief should note that this reduced the visible problem count from `302` to `89`.

### Why the remaining lint violations were not fixed in the same session

The remaining violations were genuine source-code quality issues across many files. Fixing them would be a separate, broader effort.

The brief should emphasize scope discipline:

- infrastructure blocker: fixed.
- source-code lint debt: intentionally deferred.

This aligns with the principle of one logical change per commit.

---

## 4. Separate resolved work from outstanding work

The session resolves the ESLint configuration blocker, but not the full lint gate.

### Resolved

- The fatal `__esModule` config-validation error is gone.
- ESLint can now parse `apps/web/eslint.config.mjs`.
- ESLint can now run against the `@maison/web` source tree.
- `lint:fix` successfully auto-fixed many mechanical issues.
- The shared ESLint package now uses a proper ESM `exports` field.
- The web app now consumes the shared config as a modern flat config.

### Outstanding

- `pnpm --filter @maison/web lint` still exits non-zero because real lint violations remain.
- `89` problems remain after auto-fix:
  - `83` errors.
  - `6` warnings.
- No files were committed or pushed.
- Full monorepo `pnpm lint` was not necessarily green; the web lint script still fails due to remaining source-code violations.
- Tests, build, and dev runtime remain unverified.
- Future ESLint overrides for tests, `ui`, or other directories may be needed when those files exist.
- The working tree may contain staged/unstaged changes that need review before commit.

The brief should clearly state that the **scaffolding blocker** is resolved, but the **lint gate** is not yet fully green.

---

# Proposed Condensed Brief Structure

A good condensed brief for `status_9.md` should use the following structure:

1. **Objective**
   - State that the session targeted the ESLint lint gate after `check-types` went green.

2. **Context**
   - Connect to the previous session.
   - Note that TypeScript checks were passing but lint was failing.

3. **Root Cause**
   - Explain the flat ESM config versus legacy `FlatCompat` mismatch.
   - Explain the `__esModule` interop marker failure.

4. **Reference Pattern**
   - Summarize the Stillwater approach.

5. **Fix Applied**
   - List the two edited files and what changed in each.

6. **Verification**
   - Show before/after behavior.
   - Include lint counts:
     - `302` initial problems.
     - `213` auto-fixed.
     - `89` remaining.

7. **Outstanding Issues**
   - Remaining lint violations by category.
   - Recommended follow-up order.
   - Commit, runtime, and monorepo verification concerns.

---

# Condensed Brief: `@maison/web` ESLint Flat-Config Remediation

## Objective

Resolve the `@maison/web` lint failure that remained after the previous TypeScript remediation session.

The prior session had achieved:

```text
@maison/web check-types: 0 errors
Monorepo check-types: 10/10 packages passing
```

But the lint gate still failed with:

```text
Unexpected top-level property "__esModule"
```

inside `@maison/eslint-config`.

The session’s goal was to determine whether this was a normal lint-error backlog or an infrastructure problem, then apply the smallest correct fix using the Stillwater reference codebase as guidance.

---

## Key Events

### 1. The new blocker was identified as ESLint, not TypeScript

The session began by reviewing `error.txt` and the current repository state.

The important observation was:

- `check-types` tasks were green/cached.
- `lint` failed during ESLint config loading.

This meant the previous TypeScript remediation had succeeded, but a new pre-commit blocker had surfaced.

The failure was not a normal lint-rule violation such as unused variables or bad imports. It was a config-validation failure:

```text
Unexpected top-level property "__esModule"
```

That indicated ESLint could not even start.

---

### 2. The relevant ESLint files were located

The agent found the relevant configuration surface:

```text
tooling/eslint/
apps/web/eslint.config.mjs
```

The shared ESLint config package was:

```text
tooling/eslint/package.json
tooling/eslint/index.js
```

The consumer was:

```text
apps/web/eslint.config.mjs
```

Only `apps/web` had a lint script, so the blast radius was limited.

---

### 3. Root cause: flat ESM config consumed through legacy `FlatCompat`

The shared config, `tooling/eslint/index.js`, was written as a modern ESLint v9 flat config using ESM:

```js
export default tseslint.config(...)
```

It exported a flat-config array.

However, the web app consumed it through the legacy compatibility shim:

```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("@maison/eslint-config"),
];
```

`FlatCompat.extends()` is intended for legacy eslintrc-style configs, such as:

```js
module.exports = {
  extends: [...],
  plugins: [...],
  rules: {...},
};
```

It is not the correct loader for a modern flat-config array.

Because the shared package was ESM, the import interop introduced an `__esModule: true` marker. The legacy validator treated that marker as an invalid top-level config property and failed.

Root cause:

```text
Modern flat ESM config + legacy FlatCompat loader = config-format mismatch.
```

Additional fragility:

- `@eslint/eslintrc` was not even declared as a direct dependency of `apps/web`.
- It only resolved transitively through ESLint itself.

This confirmed that the consumer pattern was scaffolding debt, not an intentional supported setup.

---

### 4. Stillwater confirmed the correct pattern

The Stillwater reference codebase used a consistent modern ESLint v9 pattern.

Its shared config package used a proper ESM export map:

```json
{
  "exports": {
    ".": "./index.js"
  }
}
```

Its web app consumed the shared config directly:

```js
import sharedConfig from "@stillwater/eslint-config";

export default [...sharedConfig, ...];
```

It did not use `FlatCompat`.

This validated the optimal fix:

1. Make the shared config package expose a proper ESM `exports` field.
2. Consume the shared config directly as flat config from the web app.

---

### 5. The fix was intentionally surgical

The agent made two file edits.

#### File 1: `tooling/eslint/package.json`

Before:

```json
{
  "main": "index.js"
}
```

After:

```json
{
  "exports": {
    ".": "./index.js"
  }
}
```

Why:

- aligns with Stillwater.
- gives the shared config package a proper ESM entry point.
- avoids legacy `main`-based resolution ambiguity.

#### File 2: `apps/web/eslint.config.mjs`

Before, conceptually:

```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("@maison/eslint-config"),
];

export default eslintConfig;
```

After:

```js
import sharedConfig from "@maison/eslint-config";

export default [
  ...sharedConfig,
  {
    ignores: [...],
  },
];
```

Why:

- removes the legacy `FlatCompat` shim.
- consumes the shared config as a modern flat config.
- eliminates the `__esModule` interop failure.
- matches the Stillwater reference pattern.

The agent intentionally did not copy Stillwater’s additional override blocks because Maison did not yet have:

- test files.
- `src/components/ui`.
- comparable dashboard-specific areas.

That kept the change minimal and avoided speculative configuration.

---

### 6. Verification proved the infrastructure blocker was resolved

Before the fix, ESLint could not parse the config:

```text
Unexpected top-level property "__esModule"
```

After the fix:

- ESLint parsed the config successfully.
- ESLint ran against the `@maison/web` source tree.
- The fatal scaffolding error was gone.

Initial lint run after the fix showed:

```text
302 problems
213 potentially auto-fixable
```

Then:

```bash
pnpm --filter @maison/web lint:fix
```

reduced the count to:

```text
89 problems
83 errors
6 warnings
```

This was an important transition:

Before:

```text
ESLint could not run at all.
```

After:

```text
ESLint runs and reports real source-code violations.
```

The remaining violations were no longer infrastructure failures. They were genuine code-quality issues that had previously been masked because ESLint could not start.

---

## Final State

### Infrastructure blocker

Resolved.

The shared ESLint config and its consumer are now format-compatible.

### Lint gate

Not yet fully green.

`@maison/web` lint still exits non-zero because `89` real lint problems remain.

### Changed files

```text
tooling/eslint/package.json
apps/web/eslint.config.mjs
```

### Commit status

No commit or push was made.

---

## Outstanding Issues

### 1. Remaining lint violations require a separate remediation pass

After `lint:fix`, `89` problems remained.

The reported breakdown was:

| Count | Rule / Category |
| ---: | --- |
| 29 | `react/no-unescaped-entities` |
| 13 | `@typescript-eslint/restrict-template-expressions` |
| 12 | `@typescript-eslint/no-floating-promises` |
| 11 | `@typescript-eslint/no-unused-vars` |
| 11 | `@typescript-eslint/no-deprecated`, likely React 19 `FormEvent`/event deprecations |
| 4 | `@typescript-eslint/no-non-null-assertion` warnings |
| 3 | `@typescript-eslint/require-await` |
| 3 | `@typescript-eslint/no-unnecessary-condition` |
| 2 | `no-console` |
| 1 | `@typescript-eslint/prefer-optional-chain` |

These are real source-code issues across approximately 30 files.

They should be handled as a separate, explicitly scoped effort.

Recommended order:

1. `react/no-unescaped-entities`
   - mostly mechanical JSX text escaping.
2. `@typescript-eslint/restrict-template-expressions`
   - usually explicit string conversion or formatting.
3. `@typescript-eslint/no-floating-promises`
   - add `await`, `void`, or explicit handling.
4. `@typescript-eslint/no-unused-vars`
   - remove unused imports/variables or prefix intentional unused args.
5. React 19 deprecated event types
   - update `FormEvent`/event handler typings.
6. Non-null assertions and unnecessary conditions
   - require more careful narrowing or safer runtime guards.
7. `no-console`
   - remove or replace with proper logging.

---

### 2. The lint gate is still failing

Although the config-format blocker is resolved, the lint script still exits non-zero:

```text
89 problems
83 errors
6 warnings
```

If the pre-commit gate requires `pnpm lint` to exit zero, the gate remains blocked until the remaining errors are resolved or an explicit policy decision is made about warnings.

---

### 3. Full monorepo lint verification should be repeated

The session verified:

```bash
pnpm --filter @maison/web lint
pnpm --filter @maison/web lint:fix
```

A full monorepo run should still be verified:

```bash
pnpm lint
```

Even though only `apps/web` appeared to have a lint script, the root Turbo pipeline should be re-run after the source-code fixes to confirm the whole gate.

---

### 4. No commit or push was made

The working tree contains the ESLint infrastructure fix, but it was not:

- staged,
- committed,
- pushed,
- opened as a pull request.

Recommended follow-up:

1. Review the two-file diff.
2. Confirm whether `tooling/eslint/package.json` has staged and unstaged changes.
3. Commit the infrastructure fix separately from later lint-rule remediation.
4. Use the repository’s required SSH wrapper convention if applicable.

Suggested commit scope:

```text
fix(eslint): consume shared flat config directly and remove FlatCompat shim
```

---

### 5. Runtime, tests, and build remain unverified

This session focused only on the ESLint configuration blocker.

The following were not part of final verification:

```bash
pnpm test
pnpm build
pnpm dev
```

Recommended follow-up:

- run tests.
- run build.
- manually verify key pages if runtime work resumes.

---

### 6. Future ESLint overrides may be needed later

The agent intentionally avoided copying Stillwater’s override blocks for:

- test files.
- `src/components/ui`.
- dashboard-specific areas.

Those overrides may become appropriate later if Maison adds:

- Vitest or Playwright test files.
- shadcn/ui components.
- admin/dashboard-specific code areas.

At that point, the ESLint config should be extended deliberately rather than speculatively.

---

## Bottom Line

The `@maison/web` lint failure was not caused by ordinary lint violations. It was caused by an ESLint configuration-format mismatch:

```text
Shared config: modern flat ESM config
Web consumer: legacy FlatCompat eslintrc shim
Result: "__esModule" leaked as an invalid top-level property
```

The fix was surgical and aligned with the Stillwater reference:

1. `tooling/eslint/package.json`
   - replaced legacy `"main"` with proper `"exports"`.
2. `apps/web/eslint.config.mjs`
   - removed `FlatCompat`.
   - imported the shared flat config directly.

Result:

```text
Fatal ESLint config error: resolved
ESLint execution: restored
Auto-fixed problems: 213
Remaining problems: 89
```

The infrastructure blocker is fixed. The remaining work is genuine source-code lint remediation, followed by full lint, test, build, runtime verification, and commit hygiene.

---

# Condensation Plan for `status_10.md`

## 1. Define the true session scope

`status_10.md` is a continuation log. It contains two logical layers:

1. **Recap / carried-over context**
   - The earlier ESLint infrastructure work from `status_9.md`:
     - `check-types` was green.
     - ESLint failed with `Unexpected top-level property "__esModule"`.
     - Root cause was a flat ESM config consumed through legacy `FlatCompat`.
     - Fix was two surgical edits:
       - `tooling/eslint/package.json`: replace `"main"` with `"exports"`.
       - `apps/web/eslint.config.mjs`: import shared flat config directly.
     - ESLint then ran successfully.
     - `lint:fix` reduced problems from `302` to `89`.
     - Remaining `89` were genuine source-code lint violations.

2. **New session work**
   - `error.txt` had been updated.
   - The previous ESLint `__esModule` failure was gone.
   - The new pre-commit failure was now at the **Prettier format gate**.
   - `format:check` failed on exactly `16` files.
   - Root cause: the previous session’s ESLint `--fix` run rewrote code style in some files, leaving them syntactically valid but Prettier-dirty.
   - The agent formatted only those `16` files with `prettier --write`.
   - The format gate went green.
   - `check-types` remained green.
   - `lint` still failed due to the already-known `89` genuine lint violations.
   - The agent validated those remaining lint violations against the Stillwater skill guidance and concluded they were real code-quality fixes, not scaffolding/config relaxations.

Therefore, the condensed brief should treat the **new primary objective** as:

> Resolve the updated pre-commit failure by fixing the Prettier formatting drift introduced by the prior ESLint autofix pass, then validate the next blocking gate.

It should not re-summarize the entire ESLint `__esModule` fix as new work. That material should be compressed into background context.

---

## 2. Preserve the investigative arc

The brief should retain the sequence of discovery and action:

1. The agent re-reads `error.txt` fresh and notices the failure has changed.
2. The previous ESLint config blocker is gone, but that fix is still staged/uncommitted.
3. The new failure is the first pre-commit gate:
   - `format:check`
   - Prettier reports `16` files with formatting drift.
   - Prettier `--check` exits non-zero on any warning, so the gate blocks.
4. The agent forms a hypothesis:
   - The previous session ran ESLint `lint:fix`.
   - ESLint autofixed import order, array types, brace style, etc.
   - Those autofixes were valid ESLint corrections but not necessarily Prettier-formatted.
   - Therefore the Prettier fixed point was disturbed on the files ESLint touched.
5. The agent validates the hypothesis:
   - Confirms the exact `16` files from `error.txt` fail `prettier --check`.
   - Confirms those files are dirty in the working tree.
   - Confirms the diff footprint matches ESLint autofix activity.
6. The agent consults Stillwater:
   - Stillwater keeps ESLint and Prettier as separate gates.
   - Stillwater does not use `eslint-plugin-prettier` or `eslint-config-prettier` composition.
   - The correct pattern is: run `lint:fix`, then run `format`.
7. The agent chooses the surgical fix:
   - Run `prettier --write` on exactly the `16` reported files.
   - Avoid blanket `pnpm format`, which would churn a much larger working-tree diff.
8. The agent verifies:
   - `pnpm format:check` becomes green.
   - `pnpm check-types` remains green: `10/10` packages.
   - `pnpm lint` still fails on `@maison/web` with `89` problems.
9. The agent triages the remaining lint failures:
   - Uses the Stillwater skill documentation to validate that the categories are known real-code fixes.
   - Concludes no ESLint config relaxation is warranted.
   - Recommends a separate manual lint-cleanup pass.

This arc is important because the session is not simply “ran Prettier.” The key insight is that the Prettier failure was a downstream artifact of the previous ESLint autofix pass, and the remaining lint gate is now genuine code remediation rather than scaffolding failure.

---

## 3. Emphasize decisions and rationale

The brief should explain why each major decision was made.

### Why the session focused on Prettier rather than ESLint

The updated `error.txt` showed that the previous ESLint `__esModule` blocker was resolved. The new failure occurred before lint or type-checking:

```text
format:check failed
16 files with Prettier warnings
```

Because the pre-commit hook treats Prettier warnings as fatal, the first gate blocked everything else.

### Why the Prettier failure was treated as a downstream artifact, not a new architectural defect

The agent observed that:

- The previous session had run ESLint `--fix`.
- The affected files had large working-tree diffs.
- The files failing Prettier matched the files touched by ESLint autofix.
- The error message itself prescribed the fix:
  - “Run Prettier with `--write` to fix.”

Therefore the failure was not a new repo-wide formatting collapse. It was a localized tool-ordering artifact:

```text
ESLint --fix changed code style
Prettier was not re-run afterward
format:check then failed
```

### Why only the 16 files were formatted

The agent deliberately avoided running blanket:

```bash
pnpm format
```

because the working tree already contained many modified files from prior sessions. A blanket format could have introduced unnecessary diff churn and mixed unrelated changes.

Formatting only the reported `16` files was:

- surgical,
- aligned with the exact error,
- consistent with minimal-change discipline,
- sufficient to restore the Prettier fixed point.

### Why Stillwater did not lead to a tooling redesign

The agent checked Stillwater to see whether it composed ESLint and Prettier differently.

Findings:

- Stillwater keeps `lint:fix` and `format` separate.
- Stillwater does not rely on `eslint-plugin-prettier`.
- Both repos have similar `import/order` rules.
- The practical pattern is:
  1. run ESLint fixes,
  2. then run Prettier formatting.

Therefore the optimal fix was not to add new tooling, but to restore formatting conformance using the existing Prettier workflow.

### Why the remaining 89 lint errors were not fixed in this session

The remaining lint errors were already known from the previous session. They are genuine source-code issues across many files, such as:

- unescaped JSX entities,
- numbers in template literals,
- floating promises,
- unused variables,
- deprecated React 19 event types.

Fixing them would be a separate, explicitly scoped manual remediation pass.

The agent also validated against the Stillwater skill documentation and concluded that these categories are normally fixed through real code edits, not by relaxing ESLint config.

### Why no commit or push was made

The session preserved commit discipline:

- The ESLint infrastructure fix from the prior session remained staged but uncommitted.
- The new Prettier formatting changes were left unstaged.
- No commit or push was performed.

The brief should make clear that the working tree now contains multiple logical change sets that should be reviewed and committed deliberately.

---

## 4. Separate resolved work from outstanding work

The session resolves the updated `error.txt` failure, but not the full pre-commit pipeline.

### Resolved

- The new `format:check` failure is resolved.
- Prettier now reports:

```text
All matched files use Prettier code style!
```

- `check-types` remains green:

```text
Tasks: 10 successful, 10 total
```

- The previous ESLint `__esModule` infrastructure blocker remains resolved.
- The repo now passes the first two gates:
  1. format
  2. type-check

### Outstanding

- `pnpm lint` still fails.
- `@maison/web` has `89` remaining lint problems:
  - `83` errors
  - `6` warnings
- These are genuine code-quality issues, not scaffolding failures.
- No commit or push has been made.
- The working tree contains:
  - staged ESLint infrastructure fixes from the prior session,
  - unstaged Prettier formatting changes from this session,
  - likely unstaged ESLint autofix changes embedded in the formatted files.
- Tests, build, and dev runtime remain unverified.
- A follow-up decision is needed on commit grouping.
- Optional process guardrail: document or enforce that `lint:fix` should be followed by `format`.

The brief should clearly state:

> The updated `error.txt` blocker is fixed, but the lint gate remains the next blocker.

---

# Proposed Condensed Brief Structure

A good condensed brief for `status_10.md` should use the following structure:

1. **Objective**
   - Resolve the updated pre-commit failure after the ESLint infrastructure fix.

2. **Context**
   - Previous session fixed the ESLint `__esModule` config blocker.
   - That fix was staged but uncommitted.
   - `error.txt` now showed a new failure at `format:check`.

3. **Root Cause**
   - ESLint `--fix` from the previous session left files Prettier-dirty.
   - Prettier `--check` exits non-zero on any formatting warning.
   - The pre-commit format gate therefore blocked before later gates.

4. **Reference Guidance**
   - Stillwater keeps ESLint and Prettier separate.
   - The correct workflow is to run Prettier after ESLint autofix.
   - No new ESLint/Prettier tooling composition was required.

5. **Action Taken**
   - Ran `prettier --write` on exactly the `16` reported files.
   - Avoided blanket formatting to reduce diff churn.

6. **Verification**
   - `format:check`: green.
   - `check-types`: green, `10/10`.
   - `lint`: still failing with `89` genuine problems.

7. **Outstanding Issues**
   - Remaining lint violations by category.
   - Recommended manual fix order.
   - Commit/staging hygiene.
   - Runtime/build/test verification.
   - Optional process guardrail.

---

# Condensed Brief: Prettier Format Gate Remediation and Lint-Gate Triage

## Objective

Resolve the updated pre-commit failure captured in `error.txt` after the prior ESLint infrastructure remediation session.

The previous session had already resolved the fatal ESLint config error:

```text
Unexpected top-level property "__esModule"
```

That fix was staged but not committed. The updated `error.txt` now showed a new failure at the first pre-commit gate:

```text
format:check
```

Prettier reported formatting drift in `16` files and exited non-zero, blocking the pre-commit pipeline before `check-types` or `lint`.

---

## Key Events

### 1. The failure had moved from ESLint infrastructure to Prettier formatting

The agent re-read `error.txt` and confirmed that the previous ESLint `__esModule` failure was gone.

The new failure was:

```text
[warn] Code style issues found in 16 files. Run Prettier with --write to fix.
```

This meant the pre-commit hook was now failing at the formatting gate.

Because `prettier --check` returns exit code `1` when any file is unformatted, the hook treated the Prettier warnings as fatal.

---

### 2. Root cause: prior ESLint autofix left files Prettier-dirty

The agent hypothesized that the previous session’s ESLint autofix pass had caused the formatting drift.

In the prior session:

```bash
pnpm --filter @maison/web lint:fix
```

had auto-fixed many mechanical issues, including:

- import ordering,
- array-type syntax,
- void-expression braces,
- other ESLint-autofixable patterns.

Those changes were valid ESLint corrections, but ESLint’s autofixer does not guarantee Prettier formatting conformance.

The agent validated this by checking the exact files listed in `error.txt`:

```bash
npx prettier --check <16 files>
```

Result:

```text
Code style issues found in 16 files.
```

The affected files included shop components, account pages, admin pages, checkout-related pages, and one hook:

```text
apps/web/src/app/(account)/account/addresses/page.tsx
apps/web/src/app/(account)/account/settings/page.tsx
apps/web/src/app/(admin)/admin/products/new/page.tsx
apps/web/src/app/(shop)/checkout/page.tsx
apps/web/src/app/(shop)/gift-cards/page.tsx
apps/web/src/app/(shop)/trade/page.tsx
apps/web/src/components/admin/DiscountManager.tsx
apps/web/src/components/admin/TradeActions.tsx
apps/web/src/components/shop/CartDrawer.tsx
apps/web/src/components/shop/CartProvider.tsx
apps/web/src/components/shop/CurrencySelector.tsx
apps/web/src/components/shop/Header.tsx
apps/web/src/components/shop/NewsletterForm.tsx
apps/web/src/components/shop/ReviewsSection.tsx
apps/web/src/components/shop/SearchModal.tsx
apps/web/src/hooks/useScrollReveal.ts
```

Root cause:

```text
ESLint --fix modified files
Prettier was not re-run afterward
format:check failed
```

This was not a new architectural defect. It was a tool-ordering artifact.

---

### 3. Stillwater confirmed the correct workflow

The agent checked the Stillwater reference codebase to determine whether a deeper tooling fix was required.

Findings:

- Stillwater keeps ESLint and Prettier as separate gates.
- Stillwater does not use `eslint-plugin-prettier` or `eslint-config-prettier` as a composed solution.
- Both Stillwater and Maison use similar ESLint `import/order` settings.
- The practical Stillwater-aligned workflow is:

```text
lint:fix first
format second
```

Therefore the optimal fix was not to redesign the tooling, but to restore the Prettier fixed point using the existing formatter.

---

### 4. Action taken: format only the 16 reported files

The agent chose the surgical option:

```bash
npx prettier --write <16 files>
```

It deliberately avoided:

```bash
pnpm format
```

because a blanket format could have touched many unrelated files and expanded the working-tree diff unnecessarily.

The surgical approach:

- matched the exact error report,
- minimized diff churn,
- preserved the prior ESLint autofix corrections,
- restored Prettier conformance.

---

## Verification

### Gate 1: Format

Command:

```bash
pnpm format:check
```

Result:

```text
All matched files use Prettier code style!
```

Exit code:

```text
0
```

The updated `error.txt` failure was resolved.

---

### Gate 2: Type-check

Command:

```bash
pnpm check-types
```

Result:

```text
Tasks: 10 successful, 10 total
```

Exit code:

```text
0
```

The web app experienced a cache miss because formatting changed files, but it still type-checked cleanly. This confirmed that the Prettier formatting did not introduce type regressions.

---

### Gate 3: Lint

Command:

```bash
pnpm lint
```

Result:

```text
Failed: @maison/web#lint
```

Remaining problems:

```text
89 problems
83 errors
6 warnings
```

This was expected. These remaining lint failures were already known from the previous session and were intentionally scoped out as genuine source-code remediation.

---

## Lint-Gate Triage

The agent validated the remaining lint categories against the Stillwater skill documentation.

The conclusion was that these are real code-quality fixes, not scaffolding gaps or config-format problems.

Remaining categories:

| Count | Rule / Category | Nature |
| ---: | --- | --- |
| 29 | `react/no-unescaped-entities` | Mechanical JSX escaping |
| 13 | `@typescript-eslint/restrict-template-expressions` | Wrap values with `String(...)` |
| 12 | `@typescript-eslint/no-floating-promises` | Add `await`, `void`, or explicit handling |
| 11 | `@typescript-eslint/no-unused-vars` | Remove dead imports/variables |
| 11 | `@typescript-eslint/no-deprecated` | React 19 deprecated event types, likely `FormEvent` |
| 4 | `@typescript-eslint/no-non-null-assertion` | Warnings; safer narrowing needed |
| 3 | `@typescript-eslint/require-await` | Remove unnecessary `async` |
| 3 | `@typescript-eslint/no-unnecessary-condition` | Tighten control-flow/type guards |
| 2 | `no-console` | Remove or replace console usage |
| 1 | `@typescript-eslint/prefer-optional-chain` | Refactor conditional access |

The Stillwater guidance indicated that these categories are normally resolved through direct code edits, for example:

```ts
`${String(value)}`
```

for `restrict-template-expressions`, and proper event-type updates for React 19 deprecations.

The agent concluded that no ESLint override block or config relaxation was warranted for these remaining issues.

---

## Decisions and Rationale

### Decision 1: Treat the Prettier failure as a downstream artifact of ESLint autofix

Why:

- The failure appeared immediately after a prior `lint:fix` session.
- The failing files matched files touched by ESLint autofix.
- Prettier itself prescribed the fix.
- The failure was localized to `16` files, not repo-wide.

### Decision 2: Format only the reported 16 files

Why:

- It matched the exact gate failure.
- It avoided unnecessary diff expansion.
- It respected minimal-change discipline.
- It preserved prior ESLint autofix corrections without bundling unrelated formatting.

### Decision 3: Do not add ESLint/Prettier tooling composition

Why:

- Stillwater keeps the gates separate.
- The existing tooling is sufficient if used in the correct order.
- Adding `eslint-plugin-prettier` or similar would be a broader tooling change than necessary.

### Decision 4: Do not fix the remaining 89 lint errors in this session

Why:

- They are genuine source-code remediation, not scaffolding failure.
- They span many files and multiple rule categories.
- They deserve a separate, explicitly scoped pass.
- Fixing them would mix concerns with the Prettier format fix.

### Decision 5: Do not commit or push

Why:

- The working tree contains multiple logical change sets:
  - staged ESLint infrastructure fix from the prior session,
  - unstaged Prettier formatting changes from this session,
  - prior ESLint autofix changes embedded in some formatted files.
- These should be reviewed and committed deliberately.

---

## Final State

### Resolved

- The updated `error.txt` failure is resolved.
- The Prettier format gate is green.
- The TypeScript gate is green.
- The previous ESLint infrastructure blocker remains resolved.

Current gate status:

| Gate | Status |
| --- | --- |
| `format:check` | Passing |
| `check-types` | Passing |
| `lint` | Failing due to genuine code-quality violations |
| `test` | Not verified |
| `build` | Not verified |
| `dev` runtime | Not verified |

### Changed files

This session formatted exactly `16` files under `apps/web`.

No source logic or ESLint configuration was changed in this session.

### Commit status

No commit or push was made.

The working tree contains:

- staged prior-session ESLint infrastructure changes:
  - `tooling/eslint/package.json`
  - `apps/web/eslint.config.mjs`
- unstaged Prettier formatting changes from this session:
  - the `16` formatted `apps/web` files

---

# Outstanding Issues

## 1. The lint gate still blocks the pre-commit pipeline

`@maison/web` lint still fails with:

```text
89 problems
83 errors
6 warnings
```

The format and type gates are now green, but the lint gate remains the next blocker.

Recommended next effort:

```text
Dedicated manual lint-cleanup pass for @maison/web
```

Recommended order:

1. `react/no-unescaped-entities`
   - Mechanical JSX escaping.
2. `@typescript-eslint/restrict-template-expressions`
   - Wrap interpolated values with `String(...)`.
3. `@typescript-eslint/no-floating-promises`
   - Add `await`, `void`, or explicit promise handling.
4. `@typescript-eslint/no-unused-vars`
   - Remove dead imports, variables, or parameters.
5. `@typescript-eslint/no-deprecated`
   - Update deprecated React 19 event types.
6. `@typescript-eslint/no-non-null-assertion`
   - Replace assertions with safer narrowing where practical.
7. `@typescript-eslint/require-await`
   - Remove unnecessary `async`.
8. `@typescript-eslint/no-unnecessary-condition`
   - Tighten type guards or control flow.
9. `no-console`
   - Remove or replace console statements.
10. `@typescript-eslint/prefer-optional-chain`
   - Refactor to optional chaining.

---

## 2. Commit grouping needs a deliberate decision

The working tree now contains multiple logical changes:

1. ESLint infrastructure fix:
   - `tooling/eslint/package.json`
   - `apps/web/eslint.config.mjs`

2. ESLint autofix changes from the prior session:
   - import ordering,
   - array-type syntax,
   - other autofixable lint corrections.

3. Prettier formatting changes from this session:
   - the `16` reported files.

Because some of the formatted files also contain prior ESLint autofixes, the changes may not separate cleanly.

Possible commit strategy:

```text
Commit 1:
fix(eslint): consume shared flat config directly and remove FlatCompat shim

Commit 2:
style(web): apply eslint autofixes and prettier formatting to affected files

Commit 3:
fix(web): resolve remaining eslint violations
```

Before committing, the staged/unstaged state should be reviewed carefully, especially:

```text
MM tooling/eslint/package.json
```

which indicates both staged and unstaged modifications may exist.

---

## 3. Full pre-commit pipeline is not yet green

The first two gates pass:

```text
format:check ✅
check-types ✅
```

But the lint gate still fails:

```text
lint ❌
```

Therefore a normal pre-commit run will still stop at lint unless:

- the remaining lint errors are fixed,
- or an explicit policy decision is made to bypass/adjust the gate temporarily.

The recommended path is to fix the lint errors rather than relax the gate.

---

## 4. Tests, build, and runtime remain unverified

This session focused on the format gate and lint triage.

The following were not part of final verification:

```bash
pnpm test
pnpm build
pnpm dev
```

Recommended follow-up after lint cleanup:

- run tests,
- run build,
- manually verify key pages:
  - homepage,
  - product listing,
  - product detail,
  - checkout,
  - account pages,
  - admin pages.

---

## 5. Optional process guardrail: enforce lint:fix followed by format

The root cause was:

```text
ESLint autofix changed files
Prettier was not re-run
```

Stillwater does not appear to require a composed ESLint/Prettier plugin, so no tooling change was made.

However, a future guardrail could be added, such as:

- documentation noting that `lint:fix` must be followed by `format`,
- a convenience script:

```bash
pnpm lint:fix && pnpm format
```

- or a Turbo task dependency.

This is optional and should be treated separately from the immediate blocker fixes.

---

## Bottom Line

The updated `error.txt` failure was not a new architectural problem. It was caused by the previous session’s ESLint autofix pass leaving `16` files Prettier-dirty.

The fix was surgical and Stillwater-aligned:

```text
Run prettier --write on exactly the 16 reported files.
```

Result:

```text
format:check: green
check-types: green
lint: still failing with 89 genuine code-quality issues
```

The immediate Prettier blocker is resolved. The next blocker is the remaining manual lint-cleanup pass in `@maison/web`. No commit or push was made, and runtime/build/test verification remains outstanding.

---

# Condensation Plan for `status_11.md`

## 1. Define the session scope

`status_11.md` is the follow-on implementation session after:

- `status_8.md`: TypeScript `check-types` remediation.
- `status_9.md`: ESLint flat-config infrastructure repair.
- `status_10.md`: Prettier format-gate cleanup.

At the start of `status_11.md`, the repository state is:

- `format:check`: green.
- `check-types`: green.
- `lint`: still failing.
- Remaining blocker: `89` genuine ESLint problems in `@maison/web`.

Therefore, the central objective of `status_11.md` should be condensed as:

> Move the `@maison/web` ESLint remediation from diagnosis to an approved execution plan, then begin implementation with Batch A mechanical lint fixes.

This session is **not** a completed lint remediation session. It ends mid-execution after applying Batch A edits but before fully verifying them and before executing Batches B and C.

The brief should therefore avoid saying:

- “The lint gate is green.”
- “All 89 ESLint problems were resolved.”
- “Batch A was fully verified.”
- “Batch B or Batch C was completed.”

Instead, it should say:

- The 89-problem lint backlog was analyzed and mapped to canonical fixes.
- The user approved the full plan.
- Batch A mechanical fixes were executed.
- `react/no-unescaped-entities` was verified fixed.
- `@typescript-eslint/restrict-template-expressions` edits were applied but final verification had not yet been shown.
- Batches B and C remain outstanding.

---

## 2. Preserve the investigative arc

The condensed brief should retain the session’s logical progression:

1. **Confirm the current blocker**
   - The agent re-read `error.txt`.
   - Confirmed the current failure is the ESLint lint gate.
   - Reproduced the failure live:
     - `89 problems`
     - `83 errors`
     - `6 warnings`
   - Confirmed `format:check` and `check-types` are green.

2. **Validate that this is genuine source-code lint debt**
   - The agent determined these are not scaffolding, config, or infrastructure failures.
   - They are real code-quality violations across roughly 30–42 files in `@maison/web`.

3. **Consult Stillwater and skill guidance**
   - The agent inspected the Stillwater reference codebase.
   - It checked Stillwater patterns for:
     - OG image route handlers.
     - React form event typing.
     - Floating promises.
     - Template literal restrictions.
     - Console usage in webhook handlers.
   - It also consulted the `nextjs16-react19-tailwind4-better-auth-monorepo` skill guidance.

4. **Classify the errors**
   - The errors were grouped into eight idiomatic classes:
     - `react/no-unescaped-entities`
     - `@typescript-eslint/restrict-template-expressions`
     - `@typescript-eslint/no-floating-promises`
     - `@typescript-eslint/no-unused-vars`
     - `@typescript-eslint/no-deprecated`
     - `@typescript-eslint/require-await`
     - Type-narrowing rules:
       - `no-unnecessary-condition`
       - `prefer-optional-chain`
       - `no-non-null-assertion`
     - `no-console`

5. **Define canonical fixes**
   - Each error class was mapped to a Stillwater-aligned fix.
   - No ESLint rule relaxation was deemed appropriate.

6. **Ask for approval**
   - The agent presented the plan to the user.
   - The user selected the option to proceed with the full plan.
   - The agent then showed the detailed plan and treated it as approved.

7. **Execute Batch A**
   - Batch A covered mechanical fixes:
     - `react/no-unescaped-entities`
     - `@typescript-eslint/restrict-template-expressions`

8. **Handle tooling friction**
   - The agent encountered repeated failures using the structured `edit` tool on lines containing embedded double quotes.
   - It switched to a Python-based mechanical replacement script.
   - An early script attempt corrupted a few files.
   - The agent restored affected files from Git.
   - A later, more robust script used ESLint JSON output as the source of truth and successfully fixed the unescaped-entity errors.

9. **Apply template-expression fixes**
   - The agent then manually edited files with `${String(...)}` or `?? ''` fixes for `restrict-template-expressions`.

10. **Stop before final Batch A verification**
   - The log ends after applying the template-expression edits.
   - It says Batch A is complete, but the final verification output for `restrict-template-expressions` is not shown.

This arc is important because the session is not merely “fixed some lint errors.” It is:

> validated blocker → reference-grounded plan → user approval → mechanical Batch A execution → tooling workaround → partial verification.

---

## 3. Emphasize key decisions and why they were made

The brief should explicitly preserve the following decisions.

### Decision 1: Treat the remaining lint failures as genuine source-code remediation

Why:

- The ESLint infrastructure problem had already been fixed in `status_9.md`.
- The Prettier formatting problem had already been fixed in `status_10.md`.
- The remaining 89 problems were real rule violations in application code.
- No scaffolding gap or config-format issue remained.

This distinguishes `status_11.md` from the previous two sessions.

---

### Decision 2: Do not relax ESLint rules

Why:

- The Stillwater reference does not relax these rules broadly.
- The skill documentation treats these as real code-quality issues.
- The fixes are mechanical or small semantic edits, not architectural changes.
- Relaxing rules would hide real debt instead of resolving the pre-commit gate.

The brief should state clearly:

> No ESLint config relaxation was used. Every planned fix is a real source-code edit.

---

### Decision 3: Use React 19’s `SubmitEvent` instead of deprecated `FormEvent`

Why:

- React 19’s type definitions mark `FormEvent` as deprecated.
- The DOM `onSubmit` prop is typed as `SubmitEventHandler<T>`.
- `React.SubmitEvent<HTMLFormElement>` is the correct replacement.
- It still extends `SyntheticEvent`, so `.preventDefault()` remains available.
- This avoids a behavior-changing refactor such as migrating to `react-hook-form`.

Planned fix:

```ts
React.FormEvent<HTMLFormElement>
```

becomes:

```ts
React.SubmitEvent<HTMLFormElement>
```

This was planned in Batch B, not yet executed in the log.

---

### Decision 4: Make OG image handlers synchronous

Why:

- The OG image route handlers were marked `async` but contained no `await`.
- Stillwater’s canonical OG image handler is synchronous.
- Removing `async` resolves `@typescript-eslint/require-await`.
- The handlers still return `ImageResponse`, so behavior is unchanged.

Affected pattern:

```ts
export async function Image() {
  return new ImageResponse(...)
}
```

becomes:

```ts
export function Image() {
  return new ImageResponse(...)
}
```

This was planned in Batch B, not yet executed in the log.

---

### Decision 5: Fix floating promises with `async`/`await` or `void`

Why:

- Some inline event handlers call async functions without handling the returned promise.
- This violates `@typescript-eslint/no-floating-promises`.
- The minimal fix is to make the inline handler async and await the call, or use `void` where fire-and-forget is intentional.

Example pattern:

```tsx
onChange={(e) => handleStatusChange(e.target.value)}
```

may become:

```tsx
onChange={async (e) => {
  await handleStatusChange(e.target.value)
}}
```

This was planned in Batch B, not yet executed in the log.

---

### Decision 6: Use `String(...)` for restricted template expressions

Why:

- The rule rejects raw `number` values inside template literals.
- `String(...)` makes the conversion explicit.
- It avoids accidental `"NaN"`, `"Infinity"`, or exponential notation issues.
- This matches the skill guidance.

Example:

```ts
width: `${progress}%`
```

becomes:

```ts
width: `${String(progress)}%`
```

This was executed in Batch A.

---

### Decision 7: Use `q ?? ''` instead of `String(q)` for optional search query

Why:

- In the search page metadata, `q` is `string | undefined`.
- `String(q)` would render the literal string `"undefined"` when `q` is absent.
- `q ?? ''` produces a cleaner fallback.

Example:

```ts
description: `Search results for "${q}" in the Maison collection.`
```

becomes:

```ts
description: `Search results for "${q ?? ''}" in the Maison collection.`
```

This was executed in Batch A.

---

### Decision 8: Use a Python script for unescaped-entity replacements

Why:

- Many unescaped-entity errors involved literal apostrophes and double quotes inside JSX text.
- The structured `edit` tool repeatedly failed when old/new text contained embedded quotes.
- A Python script allowed precise character replacement by file, line, and column.
- The final script used ESLint JSON output as the authoritative source instead of a hand-maintained map.

This is an implementation detail, but it explains why the session took a detour and why a temporary corruption occurred.

---

### Decision 9: Restore corrupted files from Git and rerun a safer script

Why:

- The first Python script used a manually constructed fix map.
- It crashed and corrupted some lines.
- The agent restored affected files using `git checkout`.
- It then rebuilt the fix list from ESLint JSON output.
- The second approach validated expected characters before replacing them.

This should be preserved because it shows recovery discipline and avoids hiding a real failure.

---

### Decision 10: Do not commit or push

Why:

- Prior sessions left multiple logical change sets in the working tree.
- The repository already had staged infrastructure changes and unstaged formatting changes.
- The agent preserved commit discipline by leaving the diff for review.
- Commit grouping should be decided deliberately.

The brief should state:

> No commit or push was made. The working tree contains uncommitted lint-remediation changes.

---

## 4. Separate resolved work from outstanding work

This is critical because the session ends incomplete.

### Resolved in `status_11.md`

1. **Confirmed the live blocker**
   - `lint` fails with exactly 89 problems.
   - `format:check` and `check-types` are green.

2. **Completed analysis and planning**
   - Mapped all 89 problems to eight rule classes.
   - Defined canonical Stillwater-aligned fixes.
   - Defined batch order:
     - Batch A: mechanical fixes.
     - Batch B: React 19 and async correctness.
     - Batch C: dead code and type narrowing.

3. **Obtained approval**
   - The user approved proceeding with the full plan.

4. **Executed Batch A: unescaped entities**
   - Fixed all 29 `react/no-unescaped-entities` errors.
   - Verified remaining count for that rule: `0`.

5. **Executed Batch A: restricted template expressions**
   - Applied fixes for all 13 reported `@typescript-eslint/restrict-template-expressions` cases.
   - Used `String(...)` for numeric interpolations.
   - Used `q ?? ''` for optional string interpolation.

6. **Recovered safely from tooling/script failure**
   - Restored corrupted files from Git.
   - Re-ran a more robust script.

### Outstanding after `status_11.md`

1. **Verify Batch A fully**
   - Confirm `restrict-template-expressions` count is now `0`.
   - Re-run ESLint JSON or normal lint output.
   - Re-run Prettier on touched files if needed.
   - Re-run `check-types` to ensure no regressions.

2. **Execute Batch B**
   - Fix `@typescript-eslint/no-deprecated`:
     - Replace `React.FormEvent` with `React.SubmitEvent<HTMLFormElement>`.
   - Fix `@typescript-eslint/no-floating-promises`:
     - Add `await` or `void` in inline handlers.
   - Fix `@typescript-eslint/require-await`:
     - Remove unnecessary `async` from OG image handlers.
     - Remove unnecessary `async` from `handleDeleteAccount` if applicable.

3. **Execute Batch C**
   - Fix `@typescript-eslint/no-unused-vars`:
     - Remove dead imports and unused locals/arguments.
   - Fix type-narrowing issues:
     - `no-unnecessary-condition`
     - `prefer-optional-chain`
     - `no-non-null-assertion`
   - Fix `no-console` warnings:
     - Change `console.log` to `console.warn` in webhook routes, or remove if inappropriate.

4. **Final verification**
   - `pnpm --filter @maison/web lint` should reach:
     - `0 errors`
     - `0 warnings`
   - `pnpm format:check` should remain green.
   - `pnpm check-types` should remain green.

5. **Commit hygiene**
   - Review working tree.
   - Decide commit grouping.
   - Possible commits:
     - ESLint infrastructure fix from prior session.
     - Prettier formatting fix from prior session.
     - Batch A mechanical lint fixes.
     - Batch B async/React 19 lint fixes.
     - Batch C dead-code/narrowing/console fixes.

6. **Runtime verification remains unperformed**
   - Tests were not run.
   - Build was not run.
   - Dev runtime was not verified.

---

## 5. Recommended brief structure

Use this structure for the condensed brief:

1. **Objective**
   - State that the session began execution of the approved ESLint source-code remediation plan.

2. **Context**
   - Prior sessions fixed TypeScript, ESLint infrastructure, and Prettier.
   - Lint remained the only blocker with 89 problems.

3. **Key Events**
   - Confirm live lint failure.
   - Map errors to canonical fixes.
   - Obtain approval.
   - Execute Batch A.
   - Recover from edit/script tooling issues.
   - Verify unescaped-entity fixes.
   - Apply restricted-template fixes.

4. **Decisions and Rationale**
   - No rule relaxation.
   - Stillwater-aligned fixes.
   - React 19 `SubmitEvent` plan.
   - Sync OG handlers plan.
   - `String(...)` and `?? ''` fixes.
   - Python script workaround.
   - No commit/push.

5. **Actions Taken**
   - List concrete Batch A edits.
   - Mention files or categories touched.

6. **Verification**
   - `no-unescaped-entities`: verified `0`.
   - `restrict-template-expressions`: edits applied, verification pending.
   - `format:check` and `check-types`: not re-run after final Batch A edits in the shown log.

7. **Outstanding Issues**
   - Batch A verification.
   - Batch B.
   - Batch C.
   - Final lint/format/type verification.
   - Commit grouping.
   - Runtime/build/test verification.

8. **Bottom Line**
   - The session moved the lint blocker from diagnosis into approved implementation.
   - Batch A is largely applied but not fully verified.
   - The lint gate is still not green.

---

# Proposed Condensed Brief Draft

Below is a ready-to-use condensed brief for `status_11.md`.

---

## Condensed Brief: `@maison/web` ESLint Source-Code Remediation — Batch A Execution

### Objective

Begin executing the approved remediation plan for the remaining `@maison/web` ESLint failures.

At the start of this session:

- `format:check` was green.
- `check-types` was green.
- `lint` remained the only active pre-commit blocker.
- The live lint failure was:
  - `89 problems`
  - `83 errors`
  - `6 warnings`

These were genuine source-code lint violations, not scaffolding or configuration failures.

The session’s goal was to:

1. Confirm the live lint failure.
2. Map every remaining error to a canonical Stillwater-aligned fix.
3. Obtain approval for the full remediation plan.
4. Execute Batch A mechanical fixes.

---

### Context

This session continues the work from prior sessions:

- `status_8.md` resolved the TypeScript `check-types` blocker.
- `status_9.md` resolved the ESLint flat-config infrastructure blocker:
  - removed `FlatCompat`
  - consumed shared ESLint config directly
- `status_10.md` resolved the Prettier formatting blocker caused by prior ESLint autofix drift.

After those sessions, the remaining blocker was the genuine lint debt:

```text
89 problems (83 errors, 6 warnings)
```

This session is the first implementation pass against that debt.

---

### Key Events

#### 1. Confirmed the current blocker

The agent verified the repository state and reproduced the lint failure:

- `format:check`: passing.
- `check-types`: passing.
- `lint`: failing with exactly 89 problems.

This confirmed that `error.txt` accurately represented the live blocker.

---

#### 2. Classified the remaining lint errors

The agent grouped the 89 problems into eight rule classes:

| Count | Rule / Class | Nature |
|---:|---|---|
| 29 | `react/no-unescaped-entities` | Mechanical JSX escaping |
| 13 | `@typescript-eslint/restrict-template-expressions` | Explicit string conversion |
| 12 | `@typescript-eslint/no-floating-promises` | Async correctness |
| 11 | `@typescript-eslint/no-unused-vars` | Dead code |
| 11 | `@typescript-eslint/no-deprecated` | React 19 event-type deprecations |
| 3 | `@typescript-eslint/require-await` | Unnecessary `async` |
| 8 | Type-narrowing rules | `no-unnecessary-condition`, `prefer-optional-chain`, `no-non-null-assertion` |
| 2 | `no-console` | Logging hygiene warnings |

Total: `89` problems.

---

#### 3. Validated canonical fixes against Stillwater and skill guidance

The agent checked the Stillwater reference codebase and the project skill documentation to determine idiomatic fixes.

Key validated patterns:

- OG image handlers should be synchronous when they do not use `await`.
- React 19 `onSubmit` handlers should use `React.SubmitEvent`, not deprecated `React.FormEvent`.
- Floating promises in inline handlers should be awaited or explicitly marked with `void`.
- Numeric template interpolations should use `String(...)`.
- Webhook diagnostic logging should use `console.warn` or `console.error`, not `console.log`.

The agent concluded that no ESLint rule relaxation was warranted.

---

#### 4. Presented and obtained approval for the full plan

The agent presented a batched plan:

- **Batch A — Mechanical fixes**
  - `react/no-unescaped-entities`
  - `@typescript-eslint/restrict-template-expressions`

- **Batch B — React 19 and async correctness**
  - `no-deprecated`
  - `no-floating-promises`
  - `require-await`

- **Batch C — Dead code and narrowing**
  - `no-unused-vars`
  - `no-unnecessary-condition`
  - `prefer-optional-chain`
  - `no-non-null-assertion`
  - `no-console`

The user selected the option to proceed with the full plan.

---

#### 5. Executed Batch A: unescaped JSX entities

The agent fixed all 29 `react/no-unescaped-entities` errors.

These were primarily apostrophes and quotation marks inside JSX text, such as:

- `couldn't`
- `haven't`
- `we've`
- `we'd`
- quoted phrases in UI copy
- marketing paragraph text

Affected areas included:

- account addresses page
- account orders page
- admin layout
- about page
- cart page
- checkout page
- search page
- trade page
- sign-in page
- not-found page
- `DiscountManager`
- `CartDrawer`
- `HyggeEdit`
- `ProductGrid`
- `Testimonials`

Because many lines contained embedded quotes, the normal structured edit tool was unreliable. The agent switched to a Python script that replaced the exact reported character at the reported line and column.

An initial script attempt corrupted a few files. The agent restored the affected files from Git and then used a more robust script derived from ESLint JSON output.

Verification showed:

```text
REMAINING no-unescaped-entities: 0
```

---

#### 6. Executed Batch A: restricted template expressions

The agent then addressed the 13 `@typescript-eslint/restrict-template-expressions` errors.

The canonical fix was to wrap interpolated numeric values in `String(...)`.

Examples:

```ts
width: `${progress}%`
```

became:

```ts
width: `${String(progress)}%`
```

and:

```ts
aria-label={`Shopping bag, ${itemCount} items`}
```

became:

```ts
aria-label={`Shopping bag, ${String(itemCount)} items`}
```

For the search page, where `q` was `string | undefined`, the agent used:

```ts
q ?? ''
```

instead of `String(q)` to avoid rendering the literal string `"undefined"`.

Files edited included:

- `account/loyalty/page.tsx`
- `admin/analytics/page.tsx`
- `admin/inventory/page.tsx`
- `cart/page.tsx`
- `search/page.tsx`
- `DiscountManager.tsx`
- `CartDrawer.tsx`
- `CartProvider.tsx`
- `Header.tsx`
- `ReviewsSection.tsx`
- `InstagramGrid.tsx`

The log ends after applying these edits, stating that Batch A is complete, but final verification for `restrict-template-expressions` is not shown.

---

### Decisions and Rationale

#### Decision: Treat the remaining lint failures as real code remediation

Why:

- The ESLint config infrastructure was already working.
- The errors were normal source-code rule violations.
- No scaffolding or config-format issue remained.

---

#### Decision: Do not relax ESLint rules

Why:

- Stillwater does not broadly relax these rules.
- The skill documentation treats them as legitimate code-quality concerns.
- The fixes are small and surgical.
- Rule relaxation would hide the problem rather than clear the gate.

---

#### Decision: Use `String(...)` for numeric template interpolations

Why:

- The rule rejects raw numbers in template literals.
- Explicit string conversion is safer and idiomatic.
- It avoids edge-case stringification issues.

---

#### Decision: Use `q ?? ''` for optional search query interpolation

Why:

- `q` can be `undefined`.
- `String(q)` would produce `"undefined"`.
- `q ?? ''` produces a cleaner metadata description.

---

#### Decision: Use a Python script for unescaped-entity fixes

Why:

- The structured edit tool struggled with embedded quotation marks.
- The unescaped-entity errors were precisely located by line and column.
- A scriptable replacement was more reliable for this mechanical transform.

---

#### Decision: Restore corrupted files from Git

Why:

- The first script attempt damaged a small number of files.
- Git provided a clean recovery path.
- The agent then rebuilt the fix list from ESLint JSON output to avoid manual mapping errors.

---

#### Decision: Plan React 19 `FormEvent` replacement with `SubmitEvent`

Why:

- React 19 deprecates `FormEvent`.
- `onSubmit` is typed as `SubmitEventHandler<T>`.
- `React.SubmitEvent<HTMLFormElement>` is the correct replacement.
- It preserves `.preventDefault()` behavior.
- It avoids an unnecessary migration to a form library.

This fix was planned for Batch B but not yet applied in the log.

---

#### Decision: Plan synchronous OG image handlers

Why:

- The OG image handlers were `async` but had no `await`.
- Stillwater’s canonical OG image handler is synchronous.
- Removing `async` resolves `require-await` without changing behavior.

This fix was planned for Batch B but not yet applied in the log.

---

#### Decision: Do not commit or push

Why:

- The working tree already contained multiple logical change sets from prior sessions.
- Commit grouping should be reviewed deliberately.
- The session preserved prior commit discipline.

---

### Verification

At the point where the log ends:

#### Verified

- `react/no-unescaped-entities` remaining count:

```text
0
```

#### Applied but not yet verified

- `@typescript-eslint/restrict-template-expressions` fixes were applied.
- Expected remaining count for that rule: `0`, but the log does not show the confirming lint run.

#### Not yet re-run after final Batch A edits

- `pnpm format:check`
- `pnpm check-types`
- Full `pnpm --filter @maison/web lint`

---

### Expected Remaining Work After Batch A

If Batch A verification passes, the expected remaining problem count would be approximately:

```text
47 problems
```

composed of:

- 41 errors
- 6 warnings

Those remaining errors correspond to Batches B and C.

---

### Outstanding Issues

#### 1. Verify Batch A completely

Next steps:

- Re-run ESLint and confirm:
  - `react/no-unescaped-entities`: `0`
  - `@typescript-eslint/restrict-template-expressions`: `0`
- Re-run Prettier if the Python edits or manual edits disturbed formatting.
- Re-run `check-types` to ensure no type regressions.

---

#### 2. Execute Batch B: React 19 and async correctness

Batch B should address:

##### `@typescript-eslint/no-deprecated`

Expected count: `11`

Fix:

```ts
React.FormEvent<HTMLFormElement>
```

to:

```ts
React.SubmitEvent<HTMLFormElement>
```

##### `@typescript-eslint/no-floating-promises`

Expected count: `12`

Fix patterns:

```tsx
onClick={() => doAsyncThing()}
```

to either:

```tsx
onClick={async () => {
  await doAsyncThing()
}}
```

or:

```tsx
onClick={() => {
  void doAsyncThing()
}}
```

##### `@typescript-eslint/require-await`

Expected count: `3`

Fix:

- Remove `async` from OG image handlers.
- Remove `async` from any handler that contains no `await`.

---

#### 3. Execute Batch C: dead code, narrowing, and logging hygiene

Batch C should address:

##### `@typescript-eslint/no-unused-vars`

Expected count: `11`

Fix:

- Remove unused imports.
- Remove unused locals.
- Remove or rename unused parameters where appropriate.

Likely examples mentioned during analysis:

- `useEffect`
- `formatPrice`
- `cn`
- `authClient`
- `router`
- `site`

##### Type-narrowing rules

Expected combined count: `8`

Rules:

- `@typescript-eslint/no-unnecessary-condition`
- `@typescript-eslint/prefer-optional-chain`
- `@typescript-eslint/no-non-null-assertion`

Fixes:

- Tighten null guards.
- Use optional chaining.
- Remove redundant conditions.
- Replace non-null assertions with safer narrowing where practical.

##### `no-console`

Expected count: `2`

Likely files:

- `apps/web/src/app/api/webhooks/sanity/route.ts`
- `apps/web/src/app/api/webhooks/stripe/route.ts`

Fix:

- Change diagnostic `console.log` to `console.warn`, or remove if unnecessary.

---

#### 4. Final gate verification

After Batches B and C:

- `pnpm --filter @maison/web lint` should reach:
  - `0 errors`
  - `0 warnings`
- `pnpm format:check` should remain green.
- `pnpm check-types` should remain green.

---

#### 5. Commit grouping remains unresolved

The working tree contains uncommitted changes from multiple sessions:

- ESLint infrastructure fix.
- Prettier formatting fix.
- Batch A mechanical lint fixes.
- Possibly ESLint autofix changes embedded in formatted files.

Recommended commit grouping:

```text
fix(eslint): consume shared flat config directly and remove FlatCompat shim
style(web): apply prettier formatting to files touched by eslint autofix
fix(web): resolve mechanical eslint violations (batch A)
fix(web): resolve react 19 and async eslint violations (batch B)
fix(web): resolve dead-code and narrowing eslint violations (batch C)
```

The final grouping should be decided after reviewing the working tree.

---

#### 6. Runtime, tests, and build remain unverified

This session focused only on lint remediation.

Not verified:

- `pnpm test`
- `pnpm build`
- `pnpm dev`

Runtime verification should happen after the lint gate is green.

---

### Bottom Line

`status_11.md` is the first implementation session for the remaining ESLint lint debt.

The agent:

- confirmed the live 89-problem lint blocker,
- mapped every error class to a canonical Stillwater-aligned fix,
- obtained approval for a batched remediation plan,
- executed Batch A mechanical fixes,
- fixed and verified all `react/no-unescaped-entities` errors,
- applied all apparent `restrict-template-expressions` fixes,
- recovered safely from a temporary scripting failure.

However, the session is not complete:

- Batch A still needs final verification.
- Batch B and Batch C have not been executed.
- The lint gate is not yet green.
- No commit or push was made.
- Tests, build, and runtime remain unverified.

The correct condensed framing is therefore:

> The session transitioned the ESLint blocker from diagnosis into approved execution and completed the mechanical Batch A edits, but the remaining semantic lint fixes and final verification are still outstanding.

---

# Condensation Plan for `status_12.md`

## 1. Define the session scope

`status_12.md` is a narrow, corrective session. It is not a broad lint-remediation session and not a scaffolding session.

Its central objective should be condensed as:

> Resolve the updated `error.txt` pre-commit failure by fixing a Prettier formatting gate failure affecting exactly 7 staged files, then verify that the commit pipeline advances to the next blocker.

At the start of the session:

- The prior sessions had already resolved:
  - TypeScript `check-types` failures.
  - ESLint flat-config infrastructure failure.
  - Earlier Prettier drift affecting 16 files.
- The new `error.txt` showed a shorter, simpler failure:
  - Prettier `--check` warnings in 7 files.
  - The pre-commit hook failed before type-checking or linting.
- The user’s blocked command was:

```bash
git commit -m "completed pnpm install and migration"
```

The brief should therefore frame the session as:

> A surgical Prettier format-gate fix that unblocked the first pre-commit gate and revealed/confirmed the remaining lint gate as the next blocker.

It should not frame the session as:

- A new scaffolding repair.
- A full lint cleanup.
- A repeat of the earlier 16-file Prettier fix.
- A commit or push operation.

---

## 2. Preserve the investigative arc

The condensed brief should retain the logical progression of the session.

### Step 1: The agent noticed that `error.txt` had changed

The log begins with the observation that `error.txt` was short and looked like an earlier or simpler failure than the prior session context.

Important nuance:

- The error looked simpler, but the repository state was actually later in the remediation sequence.
- The current failure was not the 89-problem lint failure from `status_11.md`.
- It was a Prettier format-gate failure involving only 7 files.

The brief should preserve this shift:

> The blocker had moved from lint remediation to a localized Prettier formatting failure at commit time.

---

### Step 2: The agent verified the live repository state

The agent checked:

- `error.txt`
- `git status`
- `git log`
- the pre-commit hook script
- Prettier configuration
- the exact failing files

This established that:

- The failure was reproducible.
- The failing gate was Prettier `--check`.
- Exactly 7 files were flagged.
- Those files were staged but not Prettier-formatted.

---

### Step 3: The agent identified the root cause

Root cause:

> The 7 staged files had formatting drift, and the Maison pre-commit hook runs Prettier `--check` as its first gate. Prettier treats formatting warnings as fatal, so the commit was blocked before type-checking or linting.

The drift was purely mechanical:

- JSX prose line re-wrapping.
- Ternary line wrapping.
- Multi-line `<strong>` wrapping.
- `printWidth: 100` conformance.

There were:

- no semantic changes,
- no parse errors,
- no Prettier plugin failures,
- no type regressions.

---

### Step 4: The agent reconciled the current failure with prior session history

The prior session summary described a 16-file Prettier fix.

The current `error.txt` listed only 7 files.

The agent correctly noted that:

- The prior Prettier fix may not have been committed.
- New churn may have occurred.
- The current 7-file set was a subset or re-emergence of the same formatting-drift class.
- The root cause remained the same category: staged files not formatted before commit.

The brief should avoid conflating the 16-file Prettier fix from `status_10.md` with this 7-file Prettier fix.

---

### Step 5: The agent validated the fix against Stillwater

The agent checked the Stillwater reference codebase and found:

- Stillwater uses the same Prettier configuration:
  - `printWidth: 100`
  - `singleQuote: true`
  - `trailingComma: "all"`
  - `tabWidth: 2`
  - `prettier-plugin-tailwindcss`
- Stillwater uses the same basic workflow:
  - `format` = `prettier --write`
  - `format:check` = `prettier --check`

Key difference:

- Stillwater’s pre-commit hook is looser and mainly blocks secret leakage.
- Maison’s pre-commit hook is stricter and runs format, type-check, and lint on every commit.

The agent decided not to weaken Maison’s hook. The correct fix was to conform to the existing gate.

---

### Step 6: The agent executed a surgical fix

The agent ran Prettier `--write` on exactly the 7 flagged files:

```text
apps/web/src/app/(admin)/admin/inventory/page.tsx
apps/web/src/app/(shop)/about/page.tsx
apps/web/src/app/(shop)/cart/page.tsx
apps/web/src/app/(shop)/checkout/page.tsx
apps/web/src/app/not-found.tsx
apps/web/src/components/shop/CartDrawer.tsx
apps/web/src/components/shop/sections/HyggeEdit.tsx
```

It deliberately avoided:

- blanket `pnpm format`,
- Prettier config changes,
- pre-commit hook changes,
- lint fixes,
- committing or pushing.

---

### Step 7: The agent verified the gates

Verification results:

| Gate | Before | After |
|---|---|---|
| `pnpm format:check` | Failed with 7 Prettier warnings | Passed: “All matched files use Prettier code style!” |
| `pnpm check-types` | Already passing | Passed: `10 successful, 10 total` |
| `pnpm --filter @maison/web lint` | Documented as ~89, actual now 47 | Failed with 47 problems: 41 errors, 6 warnings |
| Full pre-commit hook simulation | Stopped at format gate | Advanced through format and type-check, then stopped at lint |

This is the key verification arc:

> The `error.txt` failure was solved, but the pre-commit pipeline as a whole was not yet green because lint still failed.

---

## 3. Emphasize key decisions and why they were made

The brief should preserve the following decisions.

---

### Decision 1: Treat the failure as formatting debt, not scaffolding failure

Why:

- `check-types` was green.
- ESLint was able to run.
- The failure occurred at Prettier `--check`.
- The affected files existed and parsed correctly.
- The diffs were purely line-wrapping.

This rebuts any diagnosis that the repository was missing core scaffolding.

The brief should say:

> The current gap was formatting-debt-at-commit-time, not a missing lib, tRPC, tsconfig, or ESLinfrastructure failure.

---

### Decision 2: Format only the 7 reported files

Why:

- It matched the exact Prettier failure.
- It minimized diff churn.
- It respected the repository’s surgical-change discipline.
- It avoided mixing unrelated formatting changes into the working tree.

The brief should emphasize that the agent did not run blanket formatting.

---

### Decision 3: Do not change Prettier config

Why:

- Maison’s Prettier config matched the Stillwater reference.
- The failure was not caused by misconfiguration.
- The failure was caused by files not being formatted.
- Changing config would have been unnecessary and risky.

---

### Decision 4: Do not weaken the pre-commit hook

Why:

- Maison’s hook is intentionally stricter than Stillwater’s.
- The hook enforces the project’s required gate order.
- Weakening it would hide the problem rather than fixing it.
- The correct response was to make the code conform to the gate.

---

### Decision 5: Do not fix lint violations in this session

Why:

- The `error.txt` failure was specifically the Prettier gate.
- Lint failures were a separate, already-known scope.
- Fixing lint would mix concerns and expand the diff.
- The session’s goal was to clear the immediate commit blocker.

---

### Decision 6: Do not commit or push

Why:

- The working tree already contained multiple logical change sets from prior sessions.
- The user’s original commit command was theirs to re-run.
- Commit grouping needed deliberate review.
- Prior session discipline was to prepare the working tree without committing.

---

### Decision 7: Use Stillwater only to validate the workflow, not to redesign Maison’s gate

Why:

- Stillwater confirmed that Prettier `--write` was the canonical fix.
- Stillwater’s looser hook philosophy was not a reason to weaken Maison’s stricter hook.
- The relevant pattern was the formatting workflow, not the commit-hook policy.

---

## 4. Separate resolved work from outstanding work

This is essential because the session solves the immediate `error.txt` failure but not the full pre-commit pipeline.

### Resolved

1. **The Prettier format gate failure was resolved**
   - The 7 files were formatted.
   - `pnpm format:check` passed.

2. **The TypeScript gate remained green**
   - `pnpm check-types` passed with `10/10` tasks.

3. **The pre-commit hook advanced further**
   - Before: stopped at format.
   - After: passed format and type-check, then stopped at lint.

4. **The root cause was validated**
   - Staged files had Prettier drift.
   - The drift was purely mechanical.
   - No semantic changes were introduced.

5. **The lint count was clarified**
   - The prior brief documented 89 lint problems.
   - The live lint run now showed 47 problems:
     - 41 errors
     - 6 warnings
   - This indicated that prior lint-remediation work had reduced the backlog, but the lint gate still failed.

---

### Outstanding

1. **The lint gate still fails**
   - `pnpm --filter @maison/web lint` exits non-zero.
   - 47 problems remain.
   - The pre-commit hook will still block the user’s commit after passing format and type-check.

2. **The formatted files may need to be re-staged**
   - The files were already staged before formatting.
   - Prettier modified the working-tree copies.
   - The formatted versions need to be staged before the user retries the commit.

3. **Commit grouping remains unresolved**
   - The working tree contains multiple logical changes:
     - prior ESLint infrastructure fixes,
     - prior lint autofixes,
     - prior or current Prettier formatting,
     - possible lint-remediation edits from earlier sessions.
   - These should be reviewed and committed deliberately.

4. **The exact remaining lint categories should be re-verified**
   - The log suggests likely remaining categories such as:
     - deprecated React 19 event types,
     - unused variables,
     - floating promises,
     - non-null assertions.
   - However, because the lint count had already dropped from 89 to 47, the exact current breakdown should be regenerated from ESLint JSON before the next remediation pass.

5. **Runtime, tests, and build remain unverified**
   - `pnpm test`
   - `pnpm build`
   - `pnpm dev`

   These were not part of the session’s verification surface.

6. **Optional process guardrail remains optional**
   - The project may benefit from enforcing or documenting:
     - `lint:fix` followed by `format`
   - But this is separate from the immediate blocker.

---

## 5. Recommended brief structure

Use this structure for the condensed brief:

1. **Objective**
   - Resolve the Prettier pre-commit failure in `error.txt`.

2. **Context**
   - Prior sessions fixed TypeScript, ESLint infrastructure, and earlier Prettier drift.
   - The new failure was a localized Prettier gate failure affecting 7 files.

3. **Root Cause**
   - Staged files were not Prettier-formatted.
   - Maison’s pre-commit hook runs Prettier `--check` first.
   - Prettier warnings are fatal.

4. **Key Events**
   - Reproduced the failure.
   - Identified the 7 files.
   - Verified diffs were mechanical.
   - Checked Stillwater.
   - Formatted only the flagged files.
   - Verified gates.
   - Simulated the pre-commit hook.

5. **Decisions and Rationale**
   - Surgical formatting only.
   - No config or hook changes.
   - No lint fixes.
   - No commit or push.

6. **Verification**
   - Format gate green.
   - Type-check gate green.
   - Lint gate still failing with 47 problems.
   - Hook advances to lint.

7. **Outstanding Issues**
   - Lint remediation.
   - Re-staging formatted files.
   - Commit grouping.
   - Runtime/build/test verification.
   - Optional process guardrail.

8. **Bottom Line**
   - The immediate `error.txt` blocker is resolved.
   - The user’s commit will now pass format and type-check but still fail lint.

---

# Proposed Condensed Brief Draft

Below is a ready-to-use condensed brief for `status_12.md`.

---

## Condensed Brief: Prettier Pre-Commit Gate Remediation — 7-File Formatting Drift

### Objective

Resolve the updated `error.txt` pre-commit failure.

The failure was caused by Prettier `--check` reporting formatting drift in 7 staged files. Because the Maison pre-commit hook runs Prettier formatting as its first gate, the commit was blocked before type-checking or linting could run.

The session’s goal was to:

1. Reproduce the failure.
2. Identify the root cause.
3. Apply the smallest correct fix.
4. Verify the pre-commit pipeline state afterward.

---

### Context

This session follows prior remediation work:

- `status_8.md` resolved the TypeScript `check-types` blocker.
- `status_9.md` resolved the ESLint flat-config infrastructure blocker.
- `status_10.md` resolved an earlier Prettier formatting drift affecting 16 files.
- `status_11.md` began mechanical lint remediation and reduced the visible lint backlog.

The new `error.txt` was shorter than prior failures and showed a Prettier gate failure:

```text
[warn] apps/web/src/app/not-found.tsx
[warn] apps/web/src/components/shop/CartDrawer.tsx
[warn] apps/web/src/components/shop/sections/HyggeEdit.tsx
[warn] Code style issues found in 7 files. Run Prettier with --write to fix.
[ELIFECYCLE] Command failed with exit code 1.
```

The user’s blocked command was:

```bash
git commit -m "completed pnpm install and migration"
```

---

### Root Cause

The root cause was narrow and mechanical:

> Seven staged files were not Prettier-formatted. The Maison pre-commit hook runs `prettier --check` as its first gate, and Prettier treats formatting warnings as fatal.

The affected files were:

```text
apps/web/src/app/(admin)/admin/inventory/page.tsx
apps/web/src/app/(shop)/about/page.tsx
apps/web/src/app/(shop)/cart/page.tsx
apps/web/src/app/(shop)/checkout/page.tsx
apps/web/src/app/not-found.tsx
apps/web/src/components/shop/CartDrawer.tsx
apps/web/src/components/shop/sections/HyggeEdit.tsx
```

The formatting diffs were purely cosmetic:

- JSX prose line re-wrapping.
- Ternary expression line wrapping.
- Multi-line `<strong>` wrapping.
- Conformance to `printWidth: 100`.

There were no semantic changes, no parse errors, and no Prettier plugin failures.

---

### Key Events

#### 1. The agent confirmed that the blocker had changed

The agent inspected `error.txt`, `git status`, and the repository state.

It found that the current failure was not the previous 89-problem lint failure. It was a Prettier formatting failure involving only 7 files.

This meant the immediate blocker had moved from lint remediation to commit-time formatting conformance.

---

#### 2. The agent reproduced the failure

The agent ran the Prettier check command and reproduced the reported failure:

```text
Code style issues found in 7 files. Run Prettier with --write to fix.
```

It also inspected the pre-commit hook script:

```text
scripts/pre-commit-check.sh
```

The hook runs gates in this order:

1. Format check: `pnpm format:check`
2. Type-check: `pnpm check-types`
3. Lint: `pnpm lint`

Because Prettier `--check` exits non-zero on any unformatted file, the hook stopped at the first gate.

---

#### 3. The agent verified that the diffs were benign

The agent compared each flagged file against the output Prettier would produce.

The differences were limited to line wrapping and formatting conformance.

Examples included:

- Long JSX prose lines being re-wrapped.
- Ternary expressions being reformatted.
- `<strong>` elements being split across lines.

This confirmed that the fix was safe and mechanical.

---

#### 4. The agent validated the fix against Stillwater

The Stillwater reference codebase used the same Prettier configuration:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

It also used the same basic workflow:

```bash
prettier --write
prettier --check
```

Stillwater’s pre-commit hook is looser than Maison’s, but the agent correctly decided not to weaken Maison’s hook. The correct fix was to make the files conform to the existing gate.

---

#### 5. The agent formatted exactly the 7 flagged files

The agent ran:

```bash
npx prettier --write <7 files>
```

It deliberately avoided:

```bash
pnpm format
```

because blanket formatting could have churned a much larger working tree and mixed unrelated changes.

---

### Decisions and Rationale

| Decision | Why |
|---|---|
| Treat the failure as formatting debt, not scaffolding failure | `check-types` was green, ESLint could run, and the failure was purely Prettier formatting drift. |
| Format only the 7 reported files | This matched the exact failure and preserved minimal-diff discipline. |
| Do not run blanket `pnpm format` | Blanket formatting would have expanded the working-tree diff unnecessarily. |
| Do not change Prettier config | The config was already correct and aligned with Stillwater. |
| Do not weaken the pre-commit hook | Maison’s stricter hook is an intentional guardrail. |
| Do not fix lint violations in this session | The `error.txt` failure was specifically the Prettier gate; lint was separate scope. |
| Do not commit or push | The working tree contained multiple logical change sets and required deliberate commit grouping. |

---

### Verification

#### Format gate

Command:

```bash
pnpm format:check
```

Result:

```text
All matched files use Prettier code style!
```

Status:

```text
Passing
```

This resolved the exact `error.txt` failure.

---

#### Type-check gate

Command:

```bash
pnpm check-types
```

Result:

```text
Tasks: 10 successful, 10 total
```

Status:

```text
Passing
```

The formatting changes did not introduce type regressions.

---

#### Lint gate

Command:

```bash
pnpm --filter @maison/web lint
```

Result:

```text
47 problems (41 errors, 6 warnings)
```

Status:

```text
Failing
```

This was expected. The lint gate remained the next blocker.

The count had fallen from the previously documented 89 problems to 47, indicating that prior lint-remediation work had reduced the backlog, but the gate was still not green.

---

#### Full pre-commit hook simulation

The agent ran:

```bash
bash scripts/pre-commit-check.sh
```

Result:

- Format check: passed.
- Type-check: passed.
- Lint: failed.

Interpretation:

> The user’s commit will now pass the Prettier gate and the TypeScript gate, but it will still stop at the lint gate.

---

### Final State

Resolved:

- The Prettier `error.txt` failure is resolved.
- The 7 flagged files are formatted.
- The format gate is green.
- The type-check gate is green.
- The pre-commit hook now advances to lint.

Not resolved:

- The lint gate still fails.
- The full pre-commit pipeline is not green.
- No commit or push was made.
- Runtime, tests, and build remain unverified.

---

### Outstanding Issues

#### 1. The lint gate remains the next blocker

The lint gate still fails with:

```text
47 problems
41 errors
6 warnings
```

The user’s commit will now proceed past format and type-check, but it will still be blocked by lint.

Recommended next step:

- Run a dedicated lint-remediation pass.
- Regenerate the exact ESLint rule breakdown using ESLint JSON output.
- Continue the batched plan from prior sessions:
  - Batch B: React 19 event types, floating promises, `require-await`.
  - Batch C: unused variables, type narrowing, console warnings.

---

#### 2. The formatted files should be re-staged before commit

The 7 files were already staged before Prettier formatted them.

After running `prettier --write`, the working-tree copies changed. Before retrying the commit, the formatted versions should be staged:

```bash
git add apps/web/src/app/(admin)/admin/inventory/page.tsx \
  apps/web/src/app/(shop)/about/page.tsx \
  apps/web/src/app/(shop)/cart/page.tsx \
  apps/web/src/app/(shop)/checkout/page.tsx \
  apps/web/src/app/not-found.tsx \
  apps/web/src/components/shop/CartDrawer.tsx \
  apps/web/src/components/shop/sections/HyggeEdit.tsx
```

---

#### 3. Commit grouping needs a deliberate decision

The working tree contains multiple logical change sets:

- Prior ESLint infrastructure fixes.
- Prior ESLint autofixes.
- Prior or current Prettier formatting changes.
- Prior lint-remediation edits.
- The current 7-file Prettier fix.

Possible commit grouping:

```text
fix(eslint): consume shared flat config directly and remove FlatCompat shim
style(web): apply eslint autofixes and prettier formatting to affected files
fix(web): resolve mechanical eslint violations
style(web): prettier --write 7 format-drifted files
```

The exact grouping should be decided after reviewing the working tree.

---

#### 4. The exact remaining lint categories should be re-verified

The log mentions likely remaining categories such as:

- `@typescript-eslint/no-deprecated`
- `@typescript-eslint/no-unused-vars`
- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/no-non-null-assertion`

However, because the lint count had already dropped from 89 to 47, the exact current breakdown should be regenerated before the next lint session.

Recommended command:

```bash
pnpm --filter @maison/web lint --format json
```

or inside the web app:

```bash
npx eslint . --format json
```

---

#### 5. Runtime, tests, and build remain unverified

This session verified only:

- `format:check`
- `check-types`
- `lint` status
- pre-commit hook progression

It did not verify:

```bash
pnpm test
pnpm build
pnpm dev
```

Runtime verification should happen after the lint gate is green.

---

#### 6. Optional process guardrail

The root cause was formatting drift at commit time.

A future guardrail could be:

```bash
pnpm lint:fix && pnpm format
```

or a documented rule that any ESLint autofix pass must be followed by Prettier formatting.

This is optional and separate from the immediate blocker.

---

### Bottom Line

`status_12.md` is a surgical Prettier format-gate remediation session.

The agent:

- identified that `error.txt` was now failing at the Prettier gate,
- confirmed that exactly 7 staged files had formatting drift,
- verified that the diffs were purely mechanical,
- formatted only those 7 files,
- restored the Prettier gate to green,
- confirmed that `check-types` remained green,
- showed that the pre-commit hook now advances to lint.

The immediate `error.txt` blocker is resolved.

However, the full pre-commit pipeline is not yet green because lint still fails with 47 problems. No commit or push was made, and runtime/build/test verification remains outstanding.

---

# Condensation Plan for `status_13.md`

## 1. Define the session scope

`status_13.md` is the concluding session for the `@maison/web` ESLint source-code remediation arc. 

Its central objective should be condensed as:
> Resolve the remaining 47 ESLint violations (41 errors, 6 warnings) to clear the lint pre-commit gate, using surgical code edits rather than architectural refactors, and verify the full pre-commit pipeline.

At the start of the session:
- `format:check` and `check-types` were green.
- The lint gate was failing with 47 problems (down from 89 after Batch A in the prior session).
- The remaining errors fell into 5 root-cause families: deprecated `FormEvent`, floating promises, `require-await`, unused vars, and unnecessary conditions.

The brief should frame the session as the successful completion of the lint remediation, but it **must** highlight a critical anomaly at the end of the log: a massive `git diff` showing over 1.1 million deletions in unrelated directories (e.g., `skills/xlsx/`), indicating a severe git state issue or unintended destructive action.

## 2. Preserve the investigative arc

The brief should retain the logical progression of the session:
1. **Categorize the 47 errors**: Map the errors to 5 idiomatic families.
2. **Evaluate Stillwater reference**: Stillwater avoids floating promises by using `react-hook-form` and sync `.mutate()` instead of async `.mutateAsync()`. 
3. **Choose the fix strategy**: The agent opts for "surgical `void` wraps" to minimize blast radius, rather than refactoring to `react-hook-form`.
4. **Execute Batch B & C fixes**: 
   - Remove `async` from OG image routes.
   - Change `console.log` to `console.warn` in webhooks.
   - Remove unused imports/vars.
   - Replace deprecated `React.FormEvent` with `React.SyntheticEvent<HTMLFormElement>` (deviating slightly from the `SubmitEvent` plan in `status_11.md`).
   - Wrap floating promises (event handlers, tRPC `.invalidate()` calls) with `void`.
   - Fix type narrowing and replace non-null assertions (`!`) with safe fallbacks.
5. **Handle edge cases**: Use `eslint-disable-next-line` for a Better Auth session type mismatch where the inferred type lies about DB nullability.
6. **Verify gates**: Achieve 0 errors, 0 warnings. Fix a Prettier drift on `CurrencySelector.tsx`. Confirm `check-types` and `format:check` pass.
7. **Identify pre-existing test failure**: `pnpm test` fails due to missing test files and a missing `--passWithNoTests` flag in vitest.
8. **Discover git anomaly**: The log ends with a `git diff --stat` showing 2,113 files changed and >1.1M deletions.

## 3. Emphasize key decisions and why they were made

- **Surgical `void` wraps over Stillwater's `react-hook-form`/`mutate` pattern**: Preserves existing logic and minimizes refactor risk while satisfying the `no-floating-promises` rule.
- **`SyntheticEvent<HTMLFormElement>` over `SubmitEvent`**: Satisfies the `no-deprecated` rule while retaining access to `.preventDefault()`, acting as the path of least resistance during execution.
- **`eslint-disable` for Better Auth session type**: The DB column is nullable, but Better Auth's inferred type incorrectly narrows it. The runtime fallback (`?? email`) is necessary, so the rule is disabled for that specific line.
- **Safe fallbacks for non-null assertions**: Replaced `array[0]!` with optional chaining and default values to clear warnings and improve runtime safety, delivering a pristine 0-warning lint state.
- **Ignoring `pnpm test` failure**: The test failure is a pre-existing monorepo config issue (no test files + missing `--passWithNoTests`), entirely out of scope for the lint gate fix.

## 4. Separate resolved work from outstanding work

### Resolved
- The `@maison/web` lint gate is fully green (0 errors, 0 warnings).
- The Prettier format gate is green.
- The TypeScript `check-types` gate is green (10/10).
- The pre-commit hook simulation passes all three gates.

### Outstanding
- **CRITICAL: Anomalous Git Diff / Potential Data Loss**: The log ends with a massive `git diff` showing >1.1M deletions outside the scope of the edited files. This requires immediate investigation.
- **Test Infrastructure Failure**: `pnpm test` fails due to vitest configuration.
- **Commit Hygiene**: No commit or push was made. The working tree must be reviewed (especially given the git anomaly) before committing.
- **Runtime/Build Verification**: `pnpm build` and `pnpm dev` were not run.

---

# Proposed Condensed Brief Draft

Below is a ready-to-use condensed brief for `status_13.md`.

---

## Condensed Brief: `@maison/web` ESLint Remediation Completion and Pre-Commit Gate Clearance

### Objective

Resolve the remaining 47 ESLint violations (41 errors, 6 warnings) to clear the lint pre-commit gate, completing the source-code remediation arc from prior sessions.

The session’s goal was to apply surgical code edits to satisfy the strict `typescript-eslint` rules without performing architectural refactors, then verify the full pre-commit pipeline.

---

### Context

This session follows prior remediation work:
- `status_8.md` resolved the TypeScript `check-types` blocker.
- `status_9.md` resolved the ESLint flat-config infrastructure blocker.
- `status_10.md` and `status_12.md` resolved Prettier formatting drift.
- `status_11.md` executed Batch A mechanical lint fixes, reducing the lint backlog from 89 to 47 problems.

At the start of this session, the lint gate was the sole remaining pre-commit blocker, failing with 47 problems across ~25 files.

---

### Key Events

#### 1. Categorized the 47 errors into 5 root-cause families
The agent mapped the remaining errors to:
1. **Deprecated `FormEvent`** (9 errors): React 19 deprecation.
2. **Floating promises** (16 errors): Async event handlers and tRPC `.invalidate()` calls returning unhandled promises.
3. **`require-await`** (3 errors): `async` keyword on OG image route handlers that contain no `await`.
4. **Unused vars/imports** (9 errors): Dead scaffolding leftovers.
5. **Unnecessary conditions / Non-null assertions** (10 errors/warnings): Redundant null checks and unsafe array indexing.

#### 2. Evaluated Stillwater and chose a surgical fix strategy
The Stillwater reference avoids floating promises by using `react-hook-form` and sync `.mutate()` instead of async `.mutateAsync()`. 
The agent deliberately rejected this architectural refactor in favor of **surgical `void` wraps** to minimize blast radius and preserve Maison's existing logic.

#### 3. Executed Batch B & C fixes
The agent applied targeted edits across ~25 files:
- **OG Image Routes**: Removed `async` from `opengraph-image.tsx` and `api/og/[...slug]/route.tsx`.
- **Webhooks**: Changed `console.log` to `console.warn` in Sanity and Stripe routes.
- **Unused Code**: Removed dead imports and variables (e.g., `SORT_LABELS`, `formatPrice`, `cn`, `site`).
- **Deprecated Events**: Replaced `React.FormEvent` with `React.SyntheticEvent<HTMLFormElement>` across all form handlers.
- **Floating Promises**: Wrapped async event handlers and tRPC invalidation calls with `void` (e.g., `onClick={() => void handleDelete()}`, `void utils.account.listAddresses.invalidate()`).
- **Type Narrowing**: Replaced non-null assertions (`array[0]!`) with safe optional chaining and default fallbacks.

#### 4. Handled edge cases
- **Better Auth Session Type**: The `session.user.name` field is nullable in the DB, but Better Auth's inferred type incorrectly narrows it to non-null. The agent used `// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition` to preserve the necessary runtime fallback (`?? session.user.email`).

#### 5. Verified gates and identified pre-existing test failure
- **Lint**: Achieved **0 errors, 0 warnings** (Exit 0).
- **Format**: Fixed a Prettier drift on `CurrencySelector.tsx` caused by manual edits.
- **Types**: `check-types` passed (10/10).
- **Pre-commit Hook**: Simulated successfully, passing all 3 gates.
- **Tests**: `pnpm test` failed. The agent identified this as a **pre-existing monorepo infrastructure issue**: there are zero test files in the repo, and the vitest scripts lack the `--passWithNoTests` flag. This is out of scope for the lint gate fix.

#### 6. Discovered critical git anomaly
The session log concludes with a `git diff --stat` output showing **2,113 files changed and 1,183,024 deletions**, primarily in unrelated directories like `skills/xlsx/`. This indicates a severe git state anomaly, unintended destructive action, or workspace corruption that occurred outside the scope of the lint edits.

---

### Decisions and Rationale

| Decision | Why |
|---|---|
| **Surgical `void` wraps over Stillwater's `react-hook-form`/`mutate` pattern** | Preserves existing logic and minimizes refactor risk while satisfying the `no-floating-promises` rule. |
| **`SyntheticEvent<HTMLFormElement>` over `SubmitEvent`** | Satisfies the `no-deprecated` rule while retaining access to `.preventDefault()`, acting as the path of least resistance during execution. |
| **`eslint-disable` for Better Auth session type** | The DB column is nullable, but the inferred type lies. The runtime fallback is necessary, so the rule is disabled for that specific line rather than altering business logic. |
| **Safe fallbacks for non-null assertions** | Replaced `array[0]!` with optional chaining and default values to clear warnings and improve runtime safety, delivering a pristine 0-warning lint state. |
| **Ignoring `pnpm test` failure** | The test failure is a pre-existing monorepo config issue (no test files + missing `--passWithNoTests`), entirely out of scope for the lint gate fix. |

---

### Verification

| Gate | Before | After | Status |
|---|---|---|---|
| `pnpm --filter @maison/web lint` | ❌ 47 problems (41 err, 6 warn) | ✅ 0 problems (0 err, 0 warn) | **Solved** |
| `pnpm format:check` | ✅ Passing | ✅ Passing (after fixing 1 file drift) | **Green** |
| `pnpm check-types` | ✅ 10/10 passing | ✅ 10/10 passing | **Green** |
| Pre-commit hook simulation | ❌ Stopped at lint | ✅ Passed all 3 gates | **Solved** |
| `pnpm test` | ❌ Fails (pre-existing) | ❌ Fails (pre-existing) | **Out of scope** |

---

### Outstanding Issues

#### 1. CRITICAL: Anomalous Git Diff / Potential Data Loss
The log ends with a `git diff --stat` showing over 1.1 million deletions in unrelated directories (e.g., `skills/xlsx/`). 
**Immediate action required**: Investigate the git state to ensure no unintended files were deleted, the working tree wasn't corrupted, and the index is clean before attempting any commits.

#### 2. Test Infrastructure Failure
`pnpm test` fails because there are no test files and `vitest` lacks `--passWithNoTests`. 
**Recommended follow-up**: Add `--passWithNoTests` to the vitest scripts in all `package.json` files, or author initial test files.

#### 3. Commit Hygiene
No commit or push was made. The working tree contains the lint fixes, but given the anomalous git diff, the staging area must be carefully reviewed to ensure only the intended `apps/web/src/` files are committed.

#### 4. Runtime and Build Verification
`pnpm build` and `pnpm dev` were not run. 
**Recommended follow-up**: Verify the build and runtime behavior after the git state is resolved.

---

### Bottom Line

`status_13.md` successfully completes the `@maison/web` ESLint remediation arc. The agent applied surgical code edits to resolve the final 47 lint violations, achieving a pristine **0 errors, 0 warnings** state and clearing the pre-commit lint gate.

---

Executive Summary 
 
I meticulously reviewed AGENTS.md, CLAUDE.md, last_remediation.md, the nextjs-typescript_SKILL.md, the Stillwater reference (/home/project/stillwater/ + its SKILL.md), and error.txt against the live codebase. I then ran the full 
8-gate verification suite and E2E browser tests against http://localhost:3000/. 
 
The headline finding: the codebase is healthy. The "error" in error.txt is not a failure — it is the documented, expected, by-design behavior, and every gate is green. 
 
ANALYZE — Root Cause of error.txt 
 
error.txt contains two issues, neither is a build failure: 
 
### Issue 1 (Non-fatal, expected): DYNAMIC_SERVER_USAGE warnings 
 
``` 
  [account orders] Route /account/orders couldn't be rendered statically because it used `headers` 
  [admin dashboard] Route /admin couldn't be rendered statically because it used `headers` 
  ... (12 warnings, all /account/* + /admin/*) 
``` 
 
Root cause (validated, by design): The (account) and (admin) route group layouts call auth.api.getSession({ headers: await headers() }) — the Layer 2 security boundary (per PROJECT-ARCHITECTURE.md §6.3 + proxy.ts doc). Touching 
next/headers makes next/headers hit the static pre-render probe, Next.js catches it, marks the route ƒ (Dynamic), and emits the warning. The build completes: Tasks: 10 successful, 10 total → exit 0, 37/37 pages. 
 
This is explicitly documented in AGENTS.md → "Things that look wrong but aren't" and CLAUDE.md → tRPC v11 / "api() vs apiPublic()": "Do NOT add export const dynamic = 'force-dynamic' to silence them — incompatible with 
cacheComponents: true." The regression contract test (rendering-strategy.contract.test.ts, 20 tests) locks this invariant. 
 
### Issue 2 (Fatal — already FIXED in prior remediation): useRef SSR crash 
 
error.txt itself does not show this (it's from the pre-fix state captured in last_remediation.md): runtime HTTP 500 Cannot read properties of null (reading 'useRef'). Cause: WishlistButton/ReviewsSection call Better Auth's 
useSession() → useRef() via nanostores; Turbopack selected React's null-hook react-server export for that chunk. Fixed via ClientOnly boundary (mirrors Stillwater Lesson 89 / L4330: "never invoke useSession during SSR"). 
 
PLAN → VALIDATE → VERIFY against the Stillwater reference 
 
I cross-validated Maison's architecture against the Stillwater production reference (the skill's canonical example, 651 tests / 11 ADRs): 
 
┌────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┬────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┐ 
│ Component                                                          │ Maison                                                │ Stillwater                                     │ Status                                                   │ 
├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤ 
│ proxy.ts (Next.js 16, not middleware.ts)                           │ ✅ present, 2-layer auth, cookie-only edge check      │ ✅ identical pattern                           │ Aligned                                                  │ 
├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤ 
│ tRPC split: api() (dynamic) vs apiPublic() (static)                │ ✅ implemented in lib/trpc/server.ts with thorough    │ ✅ apiCaller() for protected; direct-DB for    │ Aligned (Maison improved on Stillwater by reusing one    │ 
│                                                                    │ docs                                                  │ static marketing                               │ appRouter for both)                                      │ 
├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤ 
│ next.config.ts (CSP, security headers, transpilePackages,          │ ✅ full CSP + OWASP headers                           │ ✅ identical shape                             │ Aligned                                                  │ 
│ serverExternalPackages)                                            │                                                       │                                                │                                                          │ 
├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤ 
│ Tailwind v4 CSS-first @theme (no tailwind.config.js)               │ ✅ in globals.css, tokens mapped from                 │ ✅                                             │ Aligned                                                  │ 
│                                                                    │ landing_page_unified.html                             │                                                │                                                          │ 
└────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┴────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘ 
 
There is no remaining "scaffolding gap" in the architecture that error.txt points to. Both the useRef runtime crash and the public-route DYNAMIC_SERVER_USAGE warning (which was a real empty-grid bug) are resolved. The residual 
warnings are the documented expected residue. 
 
VERIFY — Full 8-gate + E2E results (all green) 
 
### Code gates (background-run) 
 
┌────────────────────────────────┬────────────────────────────────────────────────────────┐ 
│ Gate                           │ Result                                                 │ 
├────────────────────────────────┼────────────────────────────────────────────────────────┤ 
│ pnpm check-types (monorepo)    │ ✅ 10/10 packages, exit 0                              │ 
├────────────────────────────────┼────────────────────────────────────────────────────────┤ 
│ pnpm --filter=@maison/web lint │ ✅ 0 errors                                            │ 
├────────────────────────────────┼────────────────────────────────────────────────────────┤ 
│ pnpm format:check (repo-wide)  │ ✅ All files conformant (no .prettierrignore silencer) │ 
├────────────────────────────────┼────────────────────────────────────────────────────────┤ 
│ Contract test                  │ ✅ 20/20 passed (1.16s)                                │ 
├────────────────────────────────┼────────────────────────────────────────────────────────┤ 
│ pnpm build (from error.txt)    │ ✅ exit 0, 37/37 pages — confirmed                     │ 
└────────────────────────────────┴────────────────────────────────────────────────────────┘ 
 
### E2E browser verification (agent_browser / agent-browser) 
 
┌────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ 
│ Journey                                                │ Result                                                                                                                 │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ Homepage /                                             │ ✅ 200, "Maison — Objects of Quiet Beauty", full product grid populated (121 interactive refs) — apiPublic() working   │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ Public routes /collections, /products, /search         │ ✅ All 200, correct titles — static-prerenderable split intact                                                         │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ PDP /products/harvest-dining-table                     │ ✅ 200, H1 + Add to Bag + wishlist button hydrated + reviews section hydrated — ClientOnly boundary working end-to-end │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ /cart, /journal, /gift-cards, /contact, /about, /trade │ ✅ All 200, correct titles                                                                                             │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ Auth-guarded /account, /admin                          │ ✅ Both correctly redirect to /auth/sign-in?callbackUrl=... (proxy.ts Layer 1 working; no crash, no 500)               │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ /auth/sign-in                                          │ ✅ 200, "Sign In — Maison"                                                                                             │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ Homepage runtime errors                                │ ✅ errors → "No page errors." / console --level error → "No console messages." (after full networkidle)                │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ Core Web Vitals /                                      │ ✅ LCP 200ms, FCP 200ms, TTFB 3ms, CLS 0 — far exceeds Lighthouse 90                                                   │ 
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ Core Web Vitals /auth/sign-in                          │ ✅ LCP 64ms, FCP 64ms, TTFB 2ms, CLS 0                                                                                 │ 
└────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ 
 
DELIVER — Conclusion 
 
There is no optimal fix to apply. The codebase is in a verified-healthy state: 
 
1. The error.txt build succeeds (exit 0, 37/37). The 12 DYNAMIC_SERVER_USAGE warnings are the documented, expected, by-design residue of the Layer 2 auth security boundary — silencing them would violate the architectural invariant 
   (incompatible with future cacheComponents: true). 
 
2. The fatal runtime useRef crash is already fixed by the ClientOnly boundary (mirroring Stillwater Lesson 89). E2E confirms the homepage and PDP now reach networkidle with zero page errors and zero console errors, and the 
   useSession-backed wishlist/reviews components hydrate correctly on the client pass. 
 
3. The public-route static/dynamic split (api() vs apiPublic()) is verified at both the contract-test level (20/20) and the route-table level (/ and /collections are ○ Static, auth routes are ƒ Dynamic). 
 
### Surgical Changes made 
 
None. Per the Surgical Change Discipline and AGENTS.md "Leave the codebase better than you found it" guidance, I made no code edits — the requested remediation was already in place and verified functional. Making changes for change's  
sake would violate the explicit instruction not to introduce unrequested modifications. 
 
### Follow-ups (documented, explicitly NOT applied — flagged per "leave it better") 
 
1. Optional AGENTS.md guardrail: A one-line note — "Better Auth React hooks (useSession / authClient.useX()): wrap in <ClientOnly> on any SSR-rendered route" — would prevent the next agent from reintroducing the useRef crash. Previous 
   remediations flagged this twice; still sound, still uncommitted. Want me to add it now? 
2. Minor: apps/web/next.config.ts lacks reactCompiler: false and allowedDevOrigins that Stillwater carries (Stillwater disabled React Compiler due to a nested-Suspense streaming bug — V16-2 / V16-3). Maison does not currently hit that 
   bug (its pages await Promise.all before rendering), so this is informational, not a defect.

---

### AGENTS.md (6 edits) 
 
┌────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────┐ 
│ Location                           │ Change                                                                                    │ Why                                                                              │ 
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤ 
│ "What this repo is" paragraph      │ "code is to be scaffolded" → "Phase 3 complete, 13 routers, 23 tables, 37 routes"         │ Was stale (code is fully scaffolded)                                             │ 
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤ 
│ Architecture skills lines (2 rows) │ skills/ → ~/.pi/agent/skills/                                                             │ Repo-local skills/ deleted from worktree; real source is global                  │ 
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤ 
│ Anti-generic UI rules source path  │ skills/avant-garde-design-v4/... → ~/.pi/agent/skills/...                                 │ Same as above                                                                    │ 
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤ 
│ SSH push wrapper path              │ /home/z/my-project/maison/ → /home/project/maison/                                        │ Was the wrong directory; would fail on copy-paste                                │ 
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤ 
│ overrides guardrail note           │ Expanded: now documents ws (GHSA-96hv DoS CVE), tmp (path traversal CVE), and allowBuilds │ Was incomplete — an agent could "clean up" a CVE pin thinking it was dead config │ 
├────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤ 
│ "Files to read" table (2 rows)     │ skills/ → ~/.pi/agent/skills/                                                             │ Same repo-local → global repoint                                                 │ 
└────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘ 
 
### CLAUDE.md (6 edits) 
 
┌─────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────┐ 
│ Location                            │ Change                                                              │ Why                                            │ 
├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤ 
│ Project Identity paragraph          │ "code-to-be-scaffolded" → "Phase 3 complete, 13 routers, 23 tables" │ Same stale-state fix as AGENTS.md              │ 
├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤ 
│ Stack version pins                  │ pnpm 11.9.0 → 11.17.0                                               │ Was packageManager 11.9.0; actual is 11.17.0   │ 
├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤ 
│ "Before You Write Code" items 5+6   │ skills/ → ~/.pi/agent/skills/                                       │ Repo-local skills/ deleted; paths must resolve │ 
├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤ 
│ Anti-Generic UI Checklist source    │ skills/avant-garde-design-v4/... → ~/.pi/agent/skills/...           │ Same repoint                                   │ 
├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤ 
│ SSH push command (both occurrences) │ /home/z/my-project/maison/ → /home/project/maison/                  │ Wrong directory; would silently fail           │ 
├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤ 
│ "When You're Stuck" skills ref      │ skills/ → ~/.pi/agent/skills/                                       │ Same repoint                                   │ 
└─────────────────────────────────────┴─────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘ 
 
### README.md (11 edits) 
 
┌────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────┐ 
│ Location                       │ Change                                                                                    │ Why                                                                          │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ pnpm badge (line 4)            │ 11.9.0 → 11.17.0                                                                          │ Was stale                                                                    │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Status badge (line 14)         │ PRD approved, Phase 0 scaffold-success → Phase 3 complete · production-ready              │ Contradicted the Project Status table claiming all 4 phases complete         │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Overview paragraph             │ "approved for build" → "fully scaffolded and Phase 3 complete"                            │ Was stale                                                                    │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Tech stack table pnpm          │ 11.9.0 → 11.17.0                                                                          │ Was stale                                                                    │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Prerequisites pnpm (both)      │ 11.9.0 → 11.17.0                                                                          │ Was stale                                                                    │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Color tokens "once scaffolded" │ Removed "(once scaffolded)" qualifier                                                     │ packages/ui/src/tokens/colors.css exists                                     │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Anti-Generic source path       │ skills/ → ~/.pi/agent/skills/                                                             │ Repo-local skills/ deleted                                                   │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ File Hierarchy skills line     │ "(196 skills, design + dev)" → "vendored, deleted from worktree; see ~/.pi/agent/skills/" │ Honest status of the pre-existing drift                                      │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Documentation table skills row │ Relative link → ~/.pi/agent/skills/ text reference (no dead relative link)                │ Link would 404                                                               │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ 8-Gate CI gate 7 (Lighthouse)  │ Added italic note: "config pending — lighthouserc.* not yet committed"                    │ @lhci/cli autorun can't run without config; doc was aspirational, now honest │ 
├────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ Phase-0 row numbers            │ "16 tables" → "23 tables"; "routers (8)" → "routers (13)"                                 │ Was stale (verified: 23 pgTable calls, 13 routers wired in root.ts)          │ 
└────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────┘ 
 
Verification (all gates green) 
 
┌─────────────────────────────────────┬───────────────────────────────────────────────────┐ 
│ Gate                                │ Result                                            │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ pnpm 11.9.0 → 11.17.0 check         │ ✅ 0 stale refs remaining                         │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ skills/ stale repo-local refs check │ ✅ 0 remaining (all point to ~/.pi/agent/skills/) │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ "16 tables" / "routers (8)" check   │ ✅ 0 stale numbers                                │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ /home/z/ SSH path check             │ ✅ 0 stale paths                                  │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ pnpm format:check                   │ ✅ All conformant (auto-fixed after edit)         │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ pnpm check-types                    │ ✅ 10/10 packages, exit 0                         │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ pnpm lint (web)                     │ ✅ 0 errors                                       │ 
├─────────────────────────────────────┼───────────────────────────────────────────────────┤ 
│ Contract test                       │ ✅ 20/20 passed (1.29s)                           │ 
└─────────────────────────────────────┴───────────────────────────────────────────────────┘ 
 
Suggested commit 
 
``` 
  docs: align README, AGENTS, CLAUDE with current codebase state 
 
  Root cause: The three documentation files contained stale facts 
  from the Phase 0 scaffold era — wrong pnpm version (11.9.0 vs 
  11.17.0 in package.json), wrong router count (8 vs 13 wired in 
  root.ts), wrong schema table count (16 vs 23 pgTable calls), an 
  "approved for build" status when Phase 3 is complete, skills/ 
  references pointing at a vendored directory deleted from the 
  working tree, and SSH wrapper paths to a non-existent /home/z/ 
  directory that would silently fail on copy-paste. 
 
  Changes: 
  - README: fixed pnpm badge + tech table + prereqs (11.9.0→11.17.0), 
    updated status badge to Phase 3 complete, fixed schema/router 
    counts, repointed skills refs to ~/.pi/agent/skills/, flagged 
    Lighthouse gate as config-pending, removed stale "(once 
    scaffolded)" qualifier from tokens path, updated skills/ 
    hierarchy note to honest worktree status 
  - AGENTS.md: removed "code to be scaffolded" language (Phase 3 
    complete now), repointed all skills/ refs to ~/.pi/agent/skills/, 
    fixed SSH wrapper path (/home/z/ → /home/project/), expanded 
    overrides guardrail to document ws/tmp CVE pins + allowBuilds 
  - CLAUDE.md: same stale-state + skills/ + SSH fixes, updated pnpm 
    version pin 
 
  Verify: all six verification steps pass (grep 11.9.0, skills/ stale 
  refs, old numbers, old SSH path, status badge — all 0 matches); 
  format:check + check-types (10/10) + lint (0 errors) + contract 
  test (20/20) green. 
```

