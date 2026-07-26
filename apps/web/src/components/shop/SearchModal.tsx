/**
 * Maison — Search modal (Client Component)
 *
 * cmdk-powered search modal triggered by the search icon in the header
 * or the "/" keyboard shortcut. Shows live product search results.
 *
 * Uses tRPC products.search query (debounced 200ms).
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce 200ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = trpc.products.search.useQuery(
    { q: debouncedQuery, limit: 8 },
    { enabled: debouncedQuery.length >= 2 },
  );

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
        setQuery("");
      }
    },
    [query, router, onClose],
  );

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(31,27,23,0.5)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(90vw, 600px)",
          background: "var(--bg)",
          boxShadow: "var(--shadow-xl)",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search input */}
        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid var(--line)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginRight: "0.75rem", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search for pieces, materials, collections…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "1.0625rem",
              color: "var(--ink)",
              outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: 11,
              color: "var(--muted)",
              border: "1px solid var(--line)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </form>

        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {debouncedQuery.length < 2 ? (
            <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ fontSize: "0.875rem" }}>Type at least 2 characters to search</p>
            </div>
          ) : isLoading ? (
            <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ fontSize: "0.875rem" }}>Searching…</p>
            </div>
          ) : results && results.length > 0 ? (
            results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleResultClick(product.slug)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                  padding: "0.75rem 1.5rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {product.primaryImage && (
                  <div style={{ width: 48, height: 60, position: "relative", flexShrink: 0 }}>
                    <Image src={product.primaryImage} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 500, color: "var(--ink)" }}>{product.name}</p>
                  {product.shortDescription && (
                    <p style={{ fontSize: "0.8125rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.shortDescription}
                    </p>
                  )}
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--ink)" }}>{formatPrice(product.priceCents)}</p>
              </button>
            ))
          ) : (
            <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", color: "var(--ink)", marginBottom: "0.5rem" }}>No results found</p>
              <p style={{ fontSize: "0.875rem" }}>Try a different search term, or browse our <button onClick={() => { router.push("/products"); onClose(); }} style={{ color: "var(--clay)", borderBottom: "1px solid var(--clay)", background: "none", border: "none", cursor: "pointer" }}>full collection</button>.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
          <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
            Press <kbd style={{ padding: "0.1rem 0.3rem", border: "1px solid var(--line)", background: "var(--bg)" }}>Enter</kbd> to search all results
          </p>
        </div>
      </div>
    </div>
  );
}
