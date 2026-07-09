'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UbuntuKnot from '@/components/UbuntuKnot';
import ThemeToggle from '@/components/ThemeToggle';
import PasswordGate, { isAdminSessionActive } from '@/components/admin/PasswordGate';
import OrdersDashboard from '@/components/admin/OrdersDashboard';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    setAuthenticated(isAdminSessionActive());
    setCheckedSession(true);
  }, []);

  // Avoid flashing the password gate for an already-authenticated session.
  if (!checkedSession) {
    return <div className="min-h-screen bg-ivory dark:bg-charcoal" />;
  }

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-ivory dark:bg-charcoal">
      <header className="border-b border-emerald/10 dark:border-gold/10 bg-white/60 dark:bg-charcoal-light/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UbuntuKnot className="h-6 w-6" />
            <span className="font-display text-lg text-charcoal dark:text-ivory">
              Ubuntu Cafe &amp; Lounge
              <span className="text-emerald dark:text-gold ml-2 font-body text-xs uppercase tracking-wide align-middle">
                Owner Dashboard
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="font-body text-sm text-charcoal/60 dark:text-ivory/60 hover:text-emerald dark:hover:text-gold transition-colors duration-300"
            >
              &larr; Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        <OrdersDashboard />
      </main>
    </div>
  );
}
