/**
 * Maison — Sort select (Client Component)
 *
 * URL-driven sort selector for the PLP. On change, navigates to the
 * new URL with the updated sort param.
 */

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      style={{
        padding: "0.5rem 1.5rem 0.5rem 0.75rem",
        border: "1px solid var(--line)",
        background: "var(--bg)",
        fontSize: 13,
        color: "var(--ink)",
        cursor: "pointer",
      }}
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
