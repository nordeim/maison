/**
 * Maison — Email button component
 */

import type { ReactNode } from "react";

interface EmailButtonProps {
  href: string;
  children: ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: "#a86b4a",
        color: "#faf8f5",
        padding: "12px 24px",
        textDecoration: "none",
        fontFamily: "-apple-system, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        margin: "16px 0",
      }}
    >
      {children}
    </a>
  );
}
