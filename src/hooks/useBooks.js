import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBooks, subscribeBooks } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBooks();
      setBooks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    unsubRef.current = subscribeBooks((msg) => {
      if (msg?.type === 'books-update') {
        const data = msg.data;
        if (data?._deleted) {
          setBooks((prev) => prev.filter((b) => b.id !== data.id));
        } else {
          setBooks((prev) => {
            const exists = prev.find((b) => b.id === data.id);
            if (exists) {
              return prev.map((b) => (b.id === data.id ? data : b));
            }
            addToast(`New book added: ${data?.title || 'Unknown'}`, 'success');
            return [...prev, data];
          });
        }
      }
    });
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [load, addToast]);

  return { books, loading, error, reload: load };
}
