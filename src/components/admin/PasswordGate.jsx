'use client';

import { useState } from 'react';
import UbuntuKnot from '@/components/UbuntuKnot';

// NOTE: This is a UI-level gate only, meant to keep the dashboard out of
// casual view — it is NOT real authentication. Before this ships, replace
// it with a proper identity provider (e.g. Amazon Cognito) sitting in
// front of the /admin route, or protect the underlying API endpoints with
// IAM/Cognito authorizers on API Gateway so the data itself is secured
// regardless of what the frontend does.
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ubuntu2026';
const SESSION_KEY = 'ubuntu-cafe-admin-session';

export function isAdminSessionActive() {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(SESSION_KEY) === 'true';
}

export default function PasswordGate({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, 'true');
      setError('');
      onAuthenticated();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-gold/15 bg-charcoal-light/60 backdrop-blur-sm p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <UbuntuKnot className="h-9 w-9" />
          <h1 className="font-display text-2xl text-ivory mt-5">
            Owner Dashboard
          </h1>
          <p className="mt-2 font-body text-sm text-ivory/50">
            Enter the admin password to view incoming orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="admin-password"
              className="font-body text-xs uppercase tracking-wide text-ivory/50"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="mt-2 w-full bg-transparent border-b border-ivory/20 focus:border-gold outline-none py-2.5 font-body text-sm text-ivory transition-colors duration-300"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-terracotta-light">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gold hover:bg-gold-light text-charcoal font-body font-semibold tracking-wide py-3.5 rounded-full transition-colors duration-300"
          >
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
