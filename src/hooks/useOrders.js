import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchOrders, subscribeOrders } from '../api/client.js';

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);

  const load = useCallback(async () => {
    if (!userId) { setOrders([]); setLoading(false); return; }
    try {
      setLoading(true);
      const data = await fetchOrders(userId);
      setOrders(data);
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
    }
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [load, userId]);

  return { orders, loading, error, reload: load };
}
