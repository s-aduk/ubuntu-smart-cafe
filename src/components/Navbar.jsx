'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UbuntuKnot from './UbuntuKnot';
import ThemeToggle from './ThemeToggle';
import { useCart } from '@/context/CartContext';

// Hash links are prefixed with "/" so they resolve correctly whether the
// visitor is already on the home page or on /order or /admin.
const NAV_LINKS = [
  { href: '/#story', label: 'Our Story' },
  { href: '/#menu', label: 'Menu' },
  { href: '/order', label: 'Order Online' },
  { href: '/#reservations', label: 'Reservations' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-smooth ${
        scrolled
          ? 'bg-ivory/70 dark:bg-charcoal/70 backdrop-blur-xl border-b border-emerald/15 dark:border-gold/15 shadow-glass'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 group">
          <UbuntuKnot className="h-7 w-7 transition-transform duration-500 group-hover:rotate-12" />
          <span className="font-display text-xl tracking-wide text-charcoal dark:text-ivory">
            Ubuntu <span className="text-terracotta">Cafe</span> &amp; Lounge
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-sm tracking-wide text-charcoal/70 dark:text-ivory/80 hover:text-emerald dark:hover:text-gold transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}

          <CartLink itemCount={itemCount} />
          <ThemeToggle />

          <Link
            href="/#reservations"
            className="font-body text-sm font-semibold tracking-wide bg-gold text-charcoal px-5 py-2.5 rounded-full hover:bg-gold-light transition-colors duration-300"
          >
            Reserve a Table
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <CartLink itemCount={itemCount} compact />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="relative h-10 w-10 flex flex-col items-center justify-center gap-1.5 text-charcoal dark:text-ivory"
          >
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ${
                menuOpen ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-opacity duration-300 ${
                menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ${
                menuOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-500 ease-smooth ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-ivory/95 dark:bg-charcoal/95 backdrop-blur-xl border-t border-emerald/10 dark:border-gold/10 px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-body text-base text-charcoal/80 dark:text-ivory/85 hover:text-emerald dark:hover:text-gold transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#reservations"
            onClick={() => setMenuOpen(false)}
            className="font-body text-sm font-semibold text-center bg-gold text-charcoal px-5 py-3 rounded-full"
          >
            Reserve a Table
          </Link>
        </div>
      </div>
    </header>
  );
}

function CartLink({ itemCount, compact = false }) {
  return (
    <Link
      href="/order"
      aria-label={`View cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
      className={`relative flex items-center justify-center text-charcoal/70 dark:text-ivory/80 hover:text-emerald dark:hover:text-gold transition-colors duration-300 ${
        compact ? 'h-9 w-9' : 'h-10 w-10'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4h2l2.2 11.2a1.6 1.6 0 001.6 1.3h7.9a1.6 1.6 0 001.6-1.3L20 8H6"
        />
        <circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="16.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 rounded-full bg-terracotta text-[10px] leading-4 text-center text-ivory font-semibold">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
