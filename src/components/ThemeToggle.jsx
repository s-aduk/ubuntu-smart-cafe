'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * Toggles between the brand's two looks:
 * - Dark: "the core luxury look" (charcoal / terracotta / gold)
 * - Light: "the bright earthy look" (ivory / terracotta / emerald)
 *
 * Renders a neutral placeholder until mounted to avoid a hydration
 * mismatch, since the actual theme is only known client-side.
 */
export default function ThemeToggle({ className = '' }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative h-9 w-9 flex items-center justify-center rounded-full border border-emerald/20 dark:border-gold/20 text-charcoal/70 dark:text-ivory/80 hover:text-emerald dark:hover:text-gold hover:border-emerald/50 dark:hover:border-gold/50 transition-colors duration-300 ${className}`}
    >
      {mounted && !isDark ? (
        // Sun (currently light — click to go dark)
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
          />
        </svg>
      ) : (
        // Moon (currently dark — click to go light)
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 14.5A8.5 8.5 0 019.5 4a7 7 0 1010.5 10.5z"
          />
        </svg>
      )}
    </button>
  );
}
