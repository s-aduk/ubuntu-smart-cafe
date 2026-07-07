'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { submitOrder } from '@/utils/api';
import { formatCurrency } from '@/utils/format';

const FULFILLMENT = {
  TABLE: 'table',
  PICKUP: 'pickup',
};

export default function CartPanel() {
  const { cartItems, subtotal, setQuantity, removeItem, clearCart } = useCart();

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
    // submitOrder() always resolves (it falls back to a simulated response
    // if no AWS backend is configured yet — see src/utils/api.js), so a
    // try/catch here is a safety net rather than the primary path.
    try {
      const result = await submitOrder(orderData);
      setConfirmation({ ...result, customerName: customer.name });
      setStatus('success');
      clearCart();
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
    <div className="rounded-2xl border border-gold/15 bg-charcoal-light/60 backdrop-blur-sm p-6 sm:p-8">
      <h2 className="font-display text-2xl text-ivory">Your Order</h2>

      {cartItems.length === 0 ? (
        <p className="mt-6 font-body text-sm text-ivory/50 leading-relaxed">
          Your cart is empty. Add a dish from the menu to get started.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {cartItems.map(({ item, quantity }) => (
            <li key={item.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-sm text-ivory truncate">{item.name}</p>
                <p className="font-body text-xs text-ivory/45 mt-0.5">
                  {formatCurrency(item.price)} &times; {quantity}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-ivory/15 px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-ivory/70 hover:text-gold transition-colors duration-300"
                  >
                    &minus;
                  </button>
                  <span className="font-body text-xs text-ivory w-3 text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="h-6 w-6 flex items-center justify-center rounded-full text-ivory/70 hover:text-gold transition-colors duration-300"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="font-body text-xs text-ivory/40 hover:text-terracotta transition-colors duration-300"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-ivory/10 pt-5">
        <span className="font-body text-sm text-ivory/60">Subtotal</span>
        <span className="font-display text-xl text-gold">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="customer-name" className="font-body text-xs uppercase tracking-wide text-ivory/50">
            Full Name
          </label>
          <input
            id="customer-name"
            type="text"
            value={customer.name}
            onChange={updateField('name')}
            placeholder="e.g. Ama Owusu"
            className="mt-2 w-full bg-transparent border-b border-ivory/20 focus:border-gold outline-none py-2.5 font-body text-sm text-ivory placeholder:text-ivory/30 transition-colors duration-300"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="customer-phone" className="font-body text-xs uppercase tracking-wide text-ivory/50">
              Phone
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={customer.phone}
              onChange={updateField('phone')}
              placeholder="+233 24 000 0000"
              className="mt-2 w-full bg-transparent border-b border-ivory/20 focus:border-gold outline-none py-2.5 font-body text-sm text-ivory placeholder:text-ivory/30 transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="customer-email" className="font-body text-xs uppercase tracking-wide text-ivory/50">
              Email <span className="text-ivory/30 normal-case">(optional)</span>
            </label>
            <input
              id="customer-email"
              type="email"
              value={customer.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              className="mt-2 w-full bg-transparent border-b border-ivory/20 focus:border-gold outline-none py-2.5 font-body text-sm text-ivory placeholder:text-ivory/30 transition-colors duration-300"
            />
          </div>
        </div>

        <div>
          <span className="font-body text-xs uppercase tracking-wide text-ivory/50">
            Fulfillment
          </span>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setFulfillmentType(FULFILLMENT.TABLE)}
              className={`flex-1 font-body text-sm px-4 py-2.5 rounded-full border transition-colors duration-300 ${
                fulfillmentType === FULFILLMENT.TABLE
                  ? 'bg-emerald border-emerald text-ivory'
                  : 'border-ivory/20 text-ivory/60 hover:border-gold/50'
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
                  : 'border-ivory/20 text-ivory/60 hover:border-gold/50'
              }`}
            >
              Pickup
            </button>
          </div>
        </div>

        {fulfillmentType === FULFILLMENT.TABLE && (
          <div>
            <label htmlFor="table-number" className="font-body text-xs uppercase tracking-wide text-ivory/50">
              Table Number
            </label>
            <input
              id="table-number"
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 5"
              className="mt-2 w-full bg-transparent border-b border-ivory/20 focus:border-gold outline-none py-2.5 font-body text-sm text-ivory placeholder:text-ivory/30 transition-colors duration-300"
            />
          </div>
        )}

        {formError && (
          <p className="font-body text-sm text-terracotta-light">{formError}</p>
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
          className="block text-center font-body text-xs text-ivory/40 hover:text-gold transition-colors duration-300"
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
    <div className="rounded-2xl border border-gold/25 bg-charcoal-light/60 backdrop-blur-sm p-8 sm:p-10 text-center">
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

      <h2 className="mt-6 font-display text-2xl sm:text-3xl text-ivory">
        Thank you, {confirmation.customerName.split(' ')[0]}!
      </h2>
      <p className="mt-3 font-body text-sm text-ivory/60 leading-relaxed max-w-sm mx-auto">
        Your order has been received and is on its way to the kitchen.
        A confirmation will be sent to your email shortly.
      </p>

      <div className="mt-6 inline-block rounded-full border border-gold/25 px-5 py-2">
        <span className="font-body text-xs uppercase tracking-wide text-ivory/40 mr-2">
          Order
        </span>
        <span className="font-body text-sm text-gold tracking-wide">
          {confirmation.orderId}
        </span>
      </div>

      <button
        type="button"
        onClick={onPlaceAnother}
        className="mt-8 w-full font-body text-sm font-semibold tracking-wide border border-ivory/20 hover:border-gold text-ivory px-6 py-3.5 rounded-full transition-colors duration-300"
      >
        Place Another Order
      </button>
    </div>
  );
}
