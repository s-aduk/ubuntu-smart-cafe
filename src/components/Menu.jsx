'use client';

import { useState } from 'react';
import { menuData } from '@/data/menuData';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format';
import AddToCartControl from './AddToCartControl';
import { useCart } from '@/context/CartContext';

export default function Menu() {
  const [activeId, setActiveId] = useState(menuData[0].id);
  const activeCategory = menuData.find((c) => c.id === activeId);
  const { itemCount, subtotal } = useCart();

  return (
    <section id="menu" className="relative bg-ivory-dim dark:bg-charcoal-soft py-28 lg:py-36">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">The Cultured Menu</span>
          <h2 className="font-display text-4xl sm:text-5xl text-charcoal dark:text-ivory mt-4">
            One Table, One Continent
          </h2>
          <p className="mt-5 font-body text-charcoal/65 dark:text-ivory/65 leading-relaxed">
            {activeCategory.description}
          </p>
        </div>

        {/* Tab controls */}
        <div
          role="tablist"
          aria-label="Menu categories"
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {menuData.map((category) => {
            const isActive = category.id === activeId;
            return (
              <button
                key={category.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveId(category.id)}
                className={`font-body text-sm tracking-wide px-6 py-3 rounded-full border transition-all duration-300 ${
                  isActive
                    ? 'bg-terracotta border-terracotta text-ivory'
                    : 'border-charcoal/15 dark:border-ivory/15 text-charcoal/60 dark:text-ivory/60 hover:border-emerald/50 dark:hover:border-gold/50 hover:text-emerald dark:hover:text-gold'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Tab panel */}
        <div
          role="tabpanel"
          className="mt-14 grid sm:grid-cols-2 gap-x-10 gap-y-12"
        >
          {activeCategory.items.map((item) => (
            <article key={item.id} className="group">
              <div className="rounded-2xl overflow-hidden shadow-md border border-emerald/10 dark:border-gold/10">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-4 pb-6 border-b border-charcoal/10 dark:border-ivory/10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl text-charcoal dark:text-ivory group-hover:text-emerald dark:group-hover:text-gold transition-colors duration-300">
                    {item.name}
                  </h3>
                  <span className="font-body text-sm text-terracotta whitespace-nowrap">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <p className="mt-2 font-body text-sm text-charcoal/60 dark:text-ivory/60 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                  {item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-body text-[11px] uppercase tracking-wide text-emerald-light bg-emerald/20 border border-emerald-light/20 rounded-full px-2.5 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span />
                  )}
                  <AddToCartControl item={item} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {itemCount > 0 && (
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald/20 dark:border-gold/20 bg-white/60 dark:bg-charcoal-light/60 px-6 py-5">
            <p className="font-body text-sm text-charcoal/80 dark:text-ivory/80">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              <span className="text-emerald dark:text-gold ml-2">
                {formatCurrency(subtotal)}
              </span>
            </p>
            <Link
              href="/order"
              className="font-body text-sm font-semibold tracking-wide bg-terracotta hover:bg-terracotta-light text-ivory px-6 py-3 rounded-full transition-colors duration-300"
            >
              Go to Checkout &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
