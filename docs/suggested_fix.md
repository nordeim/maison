# Root Cause Analysis & Fix

## 🔍 Root Cause

The error is straightforward:

```
[ERR_PNPM_NO_MATCHING_VERSION] No matching version found for @react-email/components@^6.6.5
The latest release of @react-email/components is "1.0.12".
```

Your `packages/email/package.json` declares a dependency on **`@react-email/components@^6.6.5`**, but **that version never existed**. The `@react-email/components` package only ever published versions in the `0.0.x` range (early on) and then the `1.0.x` range, topping out at **1.0.12** — after which it was **officially deprecated** [[6]][[18]][[24]].

The version `6.6.5` was almost certainly a mistake conflating it with the **`react-email`** package (the CLI/framework package), which *is* versioned in the `6.x` range (currently at **6.9.1**) [[5]][[33]].

### What happened in the ecosystem

On **April 16, 2026**, React Email 6.0.0 was released, which **unified all components and rendering utilities into the single `react-email` package** [[1]][[27]][[31]]. As a result:

| Old Package | Status | Replacement |
|---|---|---|
| `@react-email/components` | **Deprecated** (last: 1.0.12) [[53]][[61]] | `react-email` (v6.x) |
| `@react-email/render` | Merged into `react-email` | `react-email` |
| `@react-email/preview-server` | Moved | `@react-email/ui` [[28]] |

All component imports (`Button`, `Html`, `Head`, `Container`, `Tailwind`, `render`, etc.) now come directly from `"react-email"` [[37]][[49]].

---

## ✅ The Fix

### Step 1 — Update `packages/email/package.json`

Open `packages/email/package.json` and make these changes:

```diff
  "dependencies": {
-   "@react-email/components": "^6.6.5",
+   "react-email": "^6.9.0",
    ...
  },
  "devDependencies": {
-   "@react-email/preview-server": "...",   // ← if present
+   "@react-email/ui": "latest",            // ← if you use the dev preview server
    ...
  }
```

> If you also have individual component packages like `@react-email/button`, `@react-email/html`, etc., **remove those too** — they are all bundled into `react-email` now [[28]][[36]].

### Step 2 — Update all imports in your email templates

Every file under `packages/email/` that imports from the old package needs updating:

```diff
- import { Button, Html, Head, Body, Container, Text, render } from "@react-email/components";
+ import { Button, Html, Head, Body, Container, Text, render } from "react-email";
```

You can find all affected files quickly:

```bash
grep -r '@react-email/components' packages/email/src/ --include='*.ts' --include='*.tsx' -l
```

Then do a project-wide find-and-replace:

```bash
find packages/email/src -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -exec sed -i 's|@react-email/components|react-email|g' {} +
```

### Step 3 — Clean install

Because pnpm already moved some packages to `.ignored` and the lockfile references the phantom version, do a clean install:

```bash
# Remove stale artifacts
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Step 4 — Verify

```bash
# Confirm the resolved version
pnpm why react-email --filter=@maison/email

# Type-check the email package
pnpm --filter=@maison/email check-types

# If you use the dev preview server, make sure it still works
pnpm --filter=@maison/email dev
```

---

## ⚠️ Additional Warnings Worth Addressing

While you're in there, the install log surfaced two other items:

| Warning | Action |
|---|---|
| `@testing-library/jest-dom@6.10.0` deprecated — *"Incorrect minor release with breaking changes (Node ≥22 and required @testing-library/dom peer). Use 6.9.1 for the 6.x line, or upgrade to 7.0.0."* | Your root `package.json` already pins `^6.9.1`, but the caret allows `6.10.0`. Pin it to **`6.9.1`** exactly, or jump to **`^7.0.0`**. |
| `pnpm 11.9.0 → 11.17.0` update available | Run `pnpm add -g pnpm` and update the `"packageManager"` field in root `package.json` to `"pnpm@11.17.0"`. |

---

## Summary

The `@react-email/components@^6.6.5` version **never existed** — it was a version-number mix-up with the `react-email` framework package. The `@react-email/components` package has been **deprecated since React Email 6.0** (April 2026), with all functionality consolidated into the **`react-email`** package. Replace the dependency with `react-email@^6.9.0` and update your imports from `"@react-email/components"` → `"react-email"` across the `packages/email` workspace.
