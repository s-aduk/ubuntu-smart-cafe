'use client';

import { menuData } from '@/data/menuData';
import { formatCurrency } from '@/utils/format';
import AddToCartControl from '@/components/AddToCartControl';

/**
 * Full, un-tabbed menu browser for the /order page — every category is
 * visible at once so ordering doesn't require hunting through tabs.
 * Reads from the same src/data/menuData.js file as the home page <Menu />.
 */
export default function MenuPicker() {
  return (
    <div className="space-y-14">
      {menuData.map((category) => (
        <div key={category.id}>
          <h2 className="font-display text-2xl text-charcoal dark:text-ivory">
            {category.label}
          </h2>
          <p className="mt-1 font-body text-sm text-charcoal/50 dark:text-ivory/50">
            {category.description}
          </p>

          <div className="mt-6 space-y-5">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal/10 dark:border-ivory/10 pb-5"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden shadow-md border border-emerald/10 dark:border-gold/10">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-lg text-charcoal dark:text-ivory">
                        {item.name}
                      </h3>
                      <span className="font-body text-sm text-terracotta whitespace-nowrap">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-sm text-charcoal/55 dark:text-ivory/55 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="sm:pl-4 shrink-0">
                  <AddToCartControl item={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
