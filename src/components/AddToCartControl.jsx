'use client';

import { useCart } from '@/context/CartContext';

/**
 * Small stepper + "Add to Cart" control for a single menu item. Reused on
 * the home page menu and the /order page so both write to the same
 * CartContext.
 */
export default function AddToCartControl({ item }) {
  const { getQuantity, addItem, setQuantity } = useCart();
  const quantity = getQuantity(item.id);

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => addItem(item, 1)}
        className="font-body text-xs font-semibold tracking-wide uppercase text-emerald dark:text-gold border border-emerald/40 dark:border-gold/40 hover:bg-emerald dark:hover:bg-gold hover:text-ivory dark:hover:text-charcoal px-4 py-2 rounded-full transition-colors duration-300"
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-emerald/40 dark:border-gold/40 px-1 py-1">
      <button
        type="button"
        onClick={() => setQuantity(item.id, quantity - 1)}
        aria-label={`Remove one ${item.name}`}
        className="h-7 w-7 flex items-center justify-center rounded-full text-charcoal/80 dark:text-ivory/80 hover:text-emerald dark:hover:text-gold hover:bg-charcoal/5 dark:hover:bg-ivory/5 transition-colors duration-300"
      >
        &minus;
      </button>
      <span className="font-body text-sm text-charcoal dark:text-ivory w-4 text-center tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => addItem(item, 1)}
        aria-label={`Add one more ${item.name}`}
        className="h-7 w-7 flex items-center justify-center rounded-full text-charcoal/80 dark:text-ivory/80 hover:text-emerald dark:hover:text-gold hover:bg-charcoal/5 dark:hover:bg-ivory/5 transition-colors duration-300"
      >
        +
      </button>
    </div>
  );
}
