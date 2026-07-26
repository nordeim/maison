/**
 * Maison — Footer (Server Component)
 *
 * 4-column footer: brand + socials, Shop, About, Help.
 * Bottom bar: copyright + legal links.
 */

import Link from "next/link";
import { site } from "@maison/config";

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--line)",
        padding: "clamp(56px, 7vw, 88px) 0 2rem",
      }}
    >
      {/* Top section */}
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "0 var(--gutter)",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: "3rem",
          paddingBottom: "3.5rem",
          borderBottom: "1px solid var(--line)",
        }}
        className="footer-top"
      >
        {/* Brand column */}
        <div>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.85rem",
              fontWeight: 600,
              letterSpacing: "0.16em",
              color: "var(--ink)",
              marginBottom: "1rem",
              display: "block",
            }}
          >
            M<em style={{ color: "var(--clay)", fontStyle: "italic", fontWeight: 500 }}>a</em>ison
          </Link>
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              color: "var(--ink-2)",
              maxWidth: "38ch",
              marginBottom: "1.75rem",
            }}
          >
            {site.footer.tagline}
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {site.footer.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--line)",
                  borderRadius: "50%",
                  color: "var(--ink-2)",
                  transition: "all 0.25s ease",
                }}
              >
                {social.icon === "instagram" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                  </svg>
                )}
                {social.icon === "pinterest" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 20c-.5-2 .5-7 1.5-10M9 11c0-2 1.5-3.5 4-3.5 2 0 3.5 1.5 3.5 3.5 0 2.5-1.5 4-3.5 4-1.2 0-2-.8-2-2" />
                  </svg>
                )}
                {social.icon === "youtube" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="6" width="18" height="12" rx="3" />
                    <path d="m10 9 5 3-5 3z" fill="currentColor" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {site.footer.columns.map((col) => (
          <div key={col.title}>
            <h4
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: "1.25rem",
              }}
            >
              {col.title}
            </h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.href} style={{ marginBottom: "0.625rem" }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--ink-2)",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "2rem var(--gutter)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
        }}
        className="footer-bottom"
      >
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          © {new Date().getFullYear()} {site.legalName}. All rights reserved. Built with intention.
        </p>
        <div style={{ display: "flex", gap: "1.75rem" }}>
          {site.footer.legal.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontSize: 12, color: "var(--muted)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-top { grid-template-columns: 1fr !important; gap: 2rem !important; padding-bottom: 2.5rem !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}
