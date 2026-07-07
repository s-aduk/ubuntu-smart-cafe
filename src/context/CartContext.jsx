'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(undefined);

/**
 * Wraps the app once, in the root layout, so cart state survives
 * client-side navigation between "/", "/order", and back again.
 *
 * Internal shape: { [itemId]: { item, quantity } }
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  const addItem = useCallback((item, quantity = 1) => {
    if (quantity <= 0) return;
    setCart((prev) => {
      const existingQuantity = prev[item.id]?.quantity || 0;
      return {
        ...prev,
        [item.id]: { item, quantity: existingQuantity + quantity },
      };
    });
  }, []);

  const setQuantity = useCallback((itemId, quantity) => {
    setCart((prev) => {
      if (!prev[itemId]) return prev;
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...prev[itemId], quantity } };
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const itemCount = useMemo(
    () => cartItems.reduce((sum, entry) => sum + entry.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, entry) => sum + entry.quantity * entry.item.price,
        0
      ),
    [cartItems]
  );

  const getQuantity = useCallback((itemId) => cart[itemId]?.quantity || 0, [cart]);

  const value = useMemo(
    () => ({
      cartItems,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      getQuantity,
    }),
    [cartItems, itemCount, subtotal, addItem, setQuantity, removeItem, clearCart, getQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a <CartProvider>.');
  }
  return ctx;
}
