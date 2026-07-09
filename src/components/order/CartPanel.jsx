'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { submitOrder } from '@/utils/api';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/context/ToastContext';

const FULFILLMENT = {
  TABLE: 'table',
  PICKUP: 'pickup',
};

const inputClasses =
  'mt-2 w-full bg-transparent border-b border-charcoal/20 dark:border-ivory/20 focus:border-emerald dark:focus:border-gold outline-none py-2.5 font-body text-sm text-charcoal dark:text-ivory placeholder:text-charcoal/30 dark:placeholder:text-ivory/30 transition-colors duration-300';

const labelClasses =
  'font-body text-xs uppercase tracking-wide text-charcoal/50 dark:text-ivory/50';

export default function CartPanel() {
  const { cartItems, subtotal, setQuantity, removeItem, clearCart } = useCart();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [fulfillmentType, setFulfillmentType] = useState(FULFILLMENT.TABLE);
  const [tableNumber, setTableNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [confirmation, setConfirmation] = useState(null);

  const updateField = (field) => (e) =>
    setCustomer((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (cartItems.length === 0) {
      setFormError('Add at least one dish to your cart before ordering.');
      return;
    }
    if (!customer.name.trim() || !customer.phone.trim()) {
      setFormError('Name and phone number are required.');
      return;
    }
    if (fulfillmentType === FULFILLMENT.TABLE && !tableNumber.trim()) {
      setFormError('Please enter your table number, or switch to Pickup.');
      return;
    }

    const orderData = {
      customer,
      items: cartItems.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
      })),
      subtotal,
      fulfillment:
        fulfillmentType === FULFILLMENT.TABLE
          ? { type: FULFILLMENT.TABLE, tableNumber: tableNumber.trim() }
          : { type: FULFILLMENT.PICKUP },
    };

    setStatus('submitting');
    // submitOrder() always resolves — it falls back to a simulated response
    // whenever the AWS backend is unreachable or not yet configured (see
    // src/utils/api.js) — so this try/catch is a safety net, not the
    // primary path.
    try {
      const result = await submitOrder(orderData);
      setConfirmation({ ...result, customerName: customer.name });
      setStatus('success');
      clearCart();

      if (result.simulated) {
        showToast('Order simulated successfully! (AWS Backend Offline)', {
          variant: 'warning',
        });
      }
    } catch (err) {
      setFormError('Something went wrong placing your order. Please try again.');
      setStatus('idle');
    }
  };

  const handlePlaceAnother = () => {
    setStatus('idle');
    setConfirmation(null);
    setCustomer({ name: '', phone: '', email: '' });
    setTableNumber('');
    setFulfillmentType(FULFILLMENT.TABLE);
  };

  if (status === 'success' && confirmation) {
    return <OrderSuccess confirmation={confirmation} onPlaceAnother={handlePlaceAnother} />;
  }

  return (
    <div className="rounded-2xl border border-emerald/15 dark:border-gold/15 bg-white/70 dark:bg-charcoal-light/60 backdrop-blur-sm p-6 sm:p-8">
      <h2 className="font-display text-2xl text-charcoal dark:text-ivory">Your Order</h2>

      {cartItems.length === 0 ? (
        <p className="mt-6 font-body text-sm text-charcoal/50 dark:text-ivory/50 leading-relaxed">
          Your cart is empty. Add a dish from the menu to get started.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {cartItems.map(({ item, quantity }) => (
            <li key={item.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-sm text-charcoal dark:text-ivory truncate">{item.name}</p>
                <p className="font-body text-xs text-charcoal/45 dark:text-ivory/45 mt-0.5">
                  {formatCurrency(item.price)} &times; {quantity}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 dark:border-ivory/15 px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-charcoal/70 dark:text-ivory/70 hover:text-emerald dark:hover:text-gold transition-colors duration-300"
                  >
                    &minus;
                  </button>
                  <span className="font-body text-xs text-charcoal dark:text-ivory w-3 text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-charcoal/70 dark:text-ivory/70 hover:text-emerald dark:hover:text-gold transition-colors duration-300"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="font-body text-xs text-charcoal/40 dark:text-ivory/40 hover:text-terracotta transition-colors duration-300"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-charcoal/10 dark:border-ivory/10 pt-5">
        <span className="font-body text-sm text-charcoal/60 dark:text-ivory/60">Subtotal</span>
        <span className="font-display text-xl text-emerald dark:text-gold">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="customer-name" className={labelClasses}>
            Full Name
          </label>
          <input
            id="customer-name"
            type="text"
            value={customer.name}
            onChange={updateField('name')}
            placeholder="e.g. Ama Owusu"
            className={inputClasses}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="customer-phone" className={labelClasses}>
              Phone
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={customer.phone}
              onChange={updateField('phone')}
              placeholder="+233 24 000 0000"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="customer-email" className={labelClasses}>
              Email <span className="text-charcoal/30 dark:text-ivory/30 normal-case">(optional)</span>
            </label>
            <input
              id="customer-email"
              type="email"
              value={customer.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <span className={labelClasses}>Fulfillment</span>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setFulfillmentType(FULFILLMENT.TABLE)}
              className={`flex-1 font-body text-sm px-4 py-2.5 rounded-full border transition-colors duration-300 ${
                fulfillmentType === FULFILLMENT.TABLE
                  ? 'bg-emerald border-emerald text-ivory'
                  : 'border-charcoal/20 dark:border-ivory/20 text-charcoal/60 dark:text-ivory/60 hover:border-emerald/50 dark:hover:border-gold/50'
              }`}
            >
              Dine at Table
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType(FULFILLMENT.PICKUP)}
              className={`flex-1 font-body text-sm px-4 py-2.5 rounded-full border transition-colors duration-300 ${
                fulfillmentType === FULFILLMENT.PICKUP
                  ? 'bg-emerald border-emerald text-ivory'
                  : 'border-charcoal/20 dark:border-ivory/20 text-charcoal/60 dark:text-ivory/60 hover:border-emerald/50 dark:hover:border-gold/50'
              }`}
            >
              Pickup
            </button>
          </div>
        </div>

        {fulfillmentType === FULFILLMENT.TABLE && (
          <div>
            <label htmlFor="table-number" className={labelClasses}>
              Table Number
            </label>
            <input
              id="table-number"
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 5"
              className={inputClasses}
            />
          </div>
        )}

        {formError && (
          <p className="font-body text-sm text-terracotta">{formError}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed text-charcoal font-body font-semibold tracking-wide py-4 rounded-full transition-colors duration-300"
        >
          {status === 'submitting' ? (
            <>
              <Spinner />
              Placing Order&hellip;
            </>
          ) : (
            'Place Order'
          )}
        </button>

        <Link
          href="/#menu"
          className="block text-center font-body text-xs text-charcoal/40 dark:text-ivory/40 hover:text-emerald dark:hover:text-gold transition-colors duration-300"
        >
          &larr; Continue browsing the menu
        </Link>
      </form>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="h-4 w-4 rounded-full border-2 border-charcoal/30 border-t-charcoal animate-spin"
      aria-hidden="true"
    />
  );
}

function OrderSuccess({ confirmation, onPlaceAnother }) {
  return (
    <div className="rounded-2xl border border-emerald/20 dark:border-gold/25 bg-white/70 dark:bg-charcoal-light/60 backdrop-blur-sm p-8 sm:p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-emerald/20 border border-emerald-light/30 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-7 w-7 text-emerald-light"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="mt-6 font-display text-2xl sm:text-3xl text-charcoal dark:text-ivory">
        Thank you, {confirmation.customerName.split(' ')[0]}!
      </h2>
      <p className="mt-3 font-body text-sm text-charcoal/60 dark:text-ivory/60 leading-relaxed max-w-sm mx-auto">
        Your order has been received and is on its way to the kitchen.
        A confirmation will be sent to your email shortly.
      </p>

      <div className="mt-6 inline-block rounded-full border border-emerald/25 dark:border-gold/25 px-5 py-2">
        <span className="font-body text-xs uppercase tracking-wide text-charcoal/40 dark:text-ivory/40 mr-2">
          Order
        </span>
        <span className="font-body text-sm text-emerald dark:text-gold tracking-wide">
          {confirmation.orderId}
        </span>
      </div>

      <button
        type="button"
        onClick={onPlaceAnother}
        className="mt-8 w-full font-body text-sm font-semibold tracking-wide border border-charcoal/20 dark:border-ivory/20 hover:border-emerald dark:hover:border-gold text-charcoal dark:text-ivory px-6 py-3.5 rounded-full transition-colors duration-300"
      >
        Place Another Order
      </button>
    </div>
  );
}
