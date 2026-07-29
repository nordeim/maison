/**
 * Maison — Header (Client Component)
 *
 * Sticky header with:
 *  - Logo (Maison)
 *  - Desktop nav (Shop All, Collections, Our Story, Journal, Contact)
 *  - Action icons (Search, Account, Cart with count badge)
 *  - Mobile hamburger → slide-in drawer
 *  - Scroll-aware: adds shadow + blur on scroll
 *
 * Cart count comes from CartProvider context.
 */

'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCart } from './CartProvider';
import { SearchModal } from './SearchModal';

export function Header() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Keyboard shortcut: "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !searchOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [searchOpen]);

  const navLinks = [
    { label: 'Shop All', href: '/products' },
    { label: 'Collections', href: '/collections' },
    { label: 'Our Story', href: '/about' },
    { label: 'Journal', href: '/journal' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(250, 248, 245, 0.98)' : 'rgba(250, 248, 245, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid var(--line)' : '1px solid var(--line)',
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
          transition: 'box-shadow 0.45s var(--ease-maison), background 0.45s var(--ease-maison)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container)',
            margin: '0 auto',
            padding: '1.1rem var(--gutter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="Maison home"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.65rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              color: 'var(--ink)',
            }}
          >
            M
            <em
              style={{
                color: 'var(--clay)',
                fontStyle: 'italic',
                fontWeight: 500,
              }}
            >
              a
            </em>
            ison
          </Link>

          {/* Desktop nav */}
          <nav
            style={{ display: 'flex', gap: '2.25rem', alignItems: 'center' }}
            aria-label="Primary"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  color: pathname === link.href ? 'var(--ink)' : 'var(--ink-2)',
                  fontWeight: pathname === link.href ? 500 : 400,
                  transition: 'color 0.25s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setSearchOpen(true);
              }}
              aria-label="Search"
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'var(--ink)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              href="/account"
              aria-label="Account"
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'var(--ink)',
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-1a6 6 0 0 1 12 0v1" strokeLinecap="round" />
              </svg>
            </Link>
            <button
              onClick={openDrawer}
              aria-label={`Shopping bag, ${String(itemCount)} items`}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'var(--ink)',
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" strokeLinecap="round" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'var(--clay)',
                    color: 'var(--bg)',
                    fontSize: 10,
                    fontWeight: 600,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setMobileNavOpen(true);
              }}
              aria-label="Open menu"
              style={{
                display: 'none',
                width: 40,
                height: 40,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              className="menu-btn"
            >
              <span
                style={{
                  display: 'block',
                  width: 22,
                  height: 1.5,
                  background: 'var(--ink)',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: 22,
                  height: 1.5,
                  background: 'var(--ink)',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(31,27,23,0.4)',
          }}
          onClick={() => {
            setMobileNavOpen(false);
          }}
        >
          <aside
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 'min(85vw, 380px)',
              height: '100vh',
              background: 'var(--bg)',
              padding: '5rem 2.5rem 2rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => {
                setMobileNavOpen(false);
              }}
              aria-label="Close menu"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                fontSize: '2rem',
                color: 'var(--ink)',
                lineHeight: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.5rem',
              }}
            >
              Menu
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  color: 'var(--ink)',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </aside>
        </div>
      )}

      {/* Mobile nav button media query */}
      <style>{`
        @media (max-width: 768px) {
          .menu-btn { display: flex !important; }
          header nav[aria-label="Primary"] { display: none !important; }
        }
      `}</style>

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
        }}
      />
    </>
  );
}
