/**
 * Maison — Global error boundary
 *
 * Catches unhandled errors in any route. Must be a Client Component.
 */

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p className="eyebrow">Something went wrong</p>
      <h1
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 400,
          marginBottom: "1.5rem",
        }}
      >
        A <em style={{ color: "#a86b4a" }}>small interruption</em>.
      </h1>
      <p style={{ maxWidth: "48ch", color: "#4a433b", marginBottom: "2rem" }}>
        An unexpected error occurred. Try again, or return home if the issue persists.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            padding: "0.95rem 1.75rem",
            background: "#a86b4a",
            color: "#faf8f5",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            display: "inline-flex",
            padding: "0.95rem 1.75rem",
            border: "1px solid #1f1b17",
            color: "#1f1b17",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Return home
        </a>
      </div>
    </main>
  );
}
