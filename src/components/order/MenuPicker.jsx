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
          <h2 className="font-display text-2xl text-ivory">
            {category.label}
          </h2>
          <p className="mt-1 font-body text-sm text-ivory/50">
            {category.description}
          </p>

          <div className="mt-6 space-y-5">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory/10 pb-5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-display text-lg text-ivory">
                      {item.name}
                    </h3>
                    <span className="font-body text-sm text-terracotta whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm text-ivory/55 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="sm:pl-4">
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
