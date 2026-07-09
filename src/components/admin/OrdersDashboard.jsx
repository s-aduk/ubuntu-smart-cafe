'use client';

import { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from '@/utils/api';
import { formatCurrency, formatOrderTime } from '@/utils/format';
import { useToast } from '@/context/ToastContext';

const STATUS_OPTIONS = ['Pending', 'Preparing', 'Ready', 'Completed'];

const STATUS_STYLES = {
  Pending: 'bg-gold/15 text-gold border-gold/30',
  Preparing: 'bg-terracotta/15 text-terracotta-light border-terracotta/30',
  Ready: 'bg-emerald/20 text-emerald-light border-emerald-light/30',
  Completed: 'bg-charcoal/10 dark:bg-ivory/10 text-charcoal/50 dark:text-ivory/50 border-charcoal/20 dark:border-ivory/20',
};

export default function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  const loadOrders = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    const { orders: data, simulated } = await fetchOrders();
    // Newest first.
    setOrders([...data].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)));
    silent ? setRefreshing(false) : setLoading(false);

    if (simulated) {
      showToast('Showing simulated orders — AWS backend offline.', {
        variant: 'warning',
      });
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic update — the admin dashboard is explicitly built to work
    // against local state today and swap to live DynamoDB data once
    // PATCH /orders/{orderId} exists behind API Gateway.
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
    await updateOrderStatus(orderId, newStatus);
  };

  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Incoming Orders" value={totalOrders} />
        <StatCard label="Pending" value={pendingCount} accent="gold" />
        <StatCard
          label="Revenue Today"
          value={formatCurrency(revenue)}
          accent="terracotta"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl text-charcoal dark:text-ivory">Incoming Orders</h2>
        <button
          type="button"
          onClick={() => loadOrders({ silent: true })}
          disabled={refreshing}
          className="font-body text-xs uppercase tracking-wide text-emerald dark:text-gold hover:text-emerald-light dark:hover:text-gold-light disabled:opacity-50 transition-colors duration-300"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-charcoal/10 dark:border-ivory/10 bg-charcoal/5 dark:bg-ivory/5 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-8 font-body text-sm text-charcoal/50 dark:text-ivory/50">
          No orders yet — new orders will appear here as they come in.
        </p>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden md:block mt-6 overflow-x-auto rounded-2xl border border-charcoal/10 dark:border-ivory/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-charcoal/10 dark:border-ivory/10 bg-white/60 dark:bg-charcoal-light/40">
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Fulfillment</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Time</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-charcoal/5 dark:border-ivory/5 last:border-0 hover:bg-charcoal/[0.03] dark:hover:bg-ivory/[0.03] transition-colors duration-200"
                  >
                    <Td>
                      <p className="text-charcoal dark:text-ivory">{order.customer.name}</p>
                      <p className="text-charcoal/40 dark:text-ivory/40 text-xs mt-0.5">
                        {order.customer.phone}
                      </p>
                    </Td>
                    <Td>
                      <ItemsList items={order.items} />
                    </Td>
                    <Td>
                      {order.fulfillment.type === 'table'
                        ? `Table ${order.fulfillment.tableNumber}`
                        : 'Pickup'}
                    </Td>
                    <Td className="text-emerald dark:text-gold whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </Td>
                    <Td>
                      <StatusSelect
                        value={order.status}
                        onChange={(status) => handleStatusChange(order.orderId, status)}
                      />
                    </Td>
                    <Td className="text-charcoal/40 dark:text-ivory/40 whitespace-nowrap">
                      {formatOrderTime(order.receivedAt)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="rounded-xl border border-charcoal/10 dark:border-ivory/10 bg-white/60 dark:bg-charcoal-light/40 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-body text-sm text-charcoal dark:text-ivory">
                      {order.customer.name}
                    </p>
                    <p className="font-body text-xs text-charcoal/40 dark:text-ivory/40 mt-0.5">
                      {order.customer.phone}
                    </p>
                  </div>
                  <span className="font-display text-base text-emerald dark:text-gold whitespace-nowrap">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="mt-3">
                  <ItemsList items={order.items} />
                </div>

                <div className="mt-3 flex items-center justify-between font-body text-xs text-charcoal/40 dark:text-ivory/40">
                  <span>
                    {order.fulfillment.type === 'table'
                      ? `Table ${order.fulfillment.tableNumber}`
                      : 'Pickup'}
                  </span>
                  <span>{formatOrderTime(order.receivedAt)}</span>
                </div>

                <div className="mt-4">
                  <StatusSelect
                    value={order.status}
                    onChange={(status) => handleStatusChange(order.orderId, status)}
                    fullWidth
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = 'default', className = '' }) {
  const accentClass =
    accent === 'gold'
      ? 'text-emerald dark:text-gold'
      : accent === 'terracotta'
      ? 'text-terracotta'
      : 'text-charcoal dark:text-ivory';
  return (
    <div
      className={`rounded-2xl border border-charcoal/10 dark:border-ivory/10 bg-white/60 dark:bg-charcoal-light/40 px-5 py-5 ${className}`}
    >
      <p className="font-body text-xs uppercase tracking-wide text-charcoal/40 dark:text-ivory/40">
        {label}
      </p>
      <p className={`font-display text-3xl mt-2 ${accentClass}`}>{value}</p>
    </div>
  );
}

function ItemsList({ items }) {
  return (
    <ul className="font-body text-xs text-charcoal/60 dark:text-ivory/60 space-y-0.5">
      {items.map((it) => (
        <li key={it.id}>
          {it.quantity}&times; {it.name}
        </li>
      ))}
    </ul>
  );
}

function StatusSelect({ value, onChange, fullWidth = false }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`font-body text-xs rounded-full border px-3 py-1.5 bg-transparent outline-none cursor-pointer ${STATUS_STYLES[value]} ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option} className="bg-ivory dark:bg-charcoal text-charcoal dark:text-ivory">
          {option}
        </option>
      ))}
    </select>
  );
}

function Th({ children }) {
  return (
    <th className="font-body text-xs uppercase tracking-wide text-charcoal/40 dark:text-ivory/40 px-5 py-3 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return (
    <td className={`font-body text-sm px-5 py-4 align-top text-charcoal/80 dark:text-ivory/80 ${className}`}>
      {children}
    </td>
  );
}
