import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, checkout as apiCheckout, fetchOrders, subscribeCart, subscribeOrders } from '../api/client.js';

export function useCart(userId) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);
  const cartUnsubRef = useRef(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await fetchCart(userId);
      setItems(data.items);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    if (userId) {
      unsubRef.current = subscribeOrders(userId, (msg) => {
        if (msg?.type === 'orders-update') {
          load();
        }
      });
      cartUnsubRef.current = subscribeCart(userId, (msg) => {
        if (msg?.type === 'cart-update') {
          load();
        }
      });
    }
    return () => {
      if (unsubRef.current) unsubRef.current();
      if (cartUnsubRef.current) cartUnsubRef.current();
    };
  }, [load, userId]);

  const addItem = useCallback(async (bookId, quantity = 1) => {
    try {
      await apiAddToCart(userId, bookId, quantity);
      await load();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [userId, load]);

  const removeItem = useCallback(async (itemId) => {
    try {
      await apiRemoveFromCart(userId, itemId);
      await load();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [userId, load]);

  const checkoutFn = useCallback(async () => {
    try {
      const result = await apiCheckout(userId);
      await load();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [userId]);

  const fetchUserOrders = useCallback(async () => {
    try {
      return await fetchOrders(userId);
    } catch (err) {
      return [];
    }
  }, [userId]);

  return { items, total, loading, error, addItem, removeItem, checkout: checkoutFn, reload: load, fetchOrders: fetchUserOrders };
}
