// src/utils/format.js
//
// Small shared formatting helpers so price display logic lives in one
// place rather than being repeated across components.

/**
 * Formats a plain number (USD) as a display price, e.g. 14 -> "$14.00".
 */
export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `$${value.toFixed(2)}`;
}

/**
 * Formats an ISO timestamp as a short, human-readable time for the admin
 * dashboard, e.g. "2026-07-06T18:32:00Z" -> "6:32 PM".
 */
export function formatOrderTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
