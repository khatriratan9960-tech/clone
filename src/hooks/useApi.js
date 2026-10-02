import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Fetch once on mount.
 * Returns { data, loading, error, reload }.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  // Read inside the retry loop without re-triggering the effect.
  const errorRef = useRef(null);

  errorRef.current = error;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (mounted.current) setData(res);
    } catch (e) {
      if (mounted.current) setError(e.message || 'Something went wrong');
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();

    // A brief API restart shouldn't leave the page permanently errored.
    // Retry with a growing delay, stopping as soon as a call succeeds.
    let attempts = 0;
    let timer;

    const tick = async () => {
      if (!mounted.current) return;
      attempts += 1;
      await new Promise((r) => setTimeout(r, 2000 * attempts));
      if (!mounted.current) return;
      await load();
      // Still failing? Keep going, up to 5 attempts total.
      if (mounted.current && errorRef.current && attempts < 5) {
        timer = setTimeout(tick, 0);
      }
    };

    timer = setTimeout(tick, 2500);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  return { data, loading, error, reload: load };
}

/**
 * Poll an endpoint on an interval. Keeps the last good payload on
 * failure so the page never flashes empty (matters if the paid API
 * has an outage at 3am).
 */
export function usePolling(fetcher, intervalMs = 15000, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetcher();
      if (!mounted.current) return;
      setData(res);
      setError(null);
      setLastUpdate(new Date());
    } catch (e) {
      if (!mounted.current) return;
      // Keep previous data; only record the error.
      setError(e.message || 'Poll failed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();
    const id = setInterval(load, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [load, intervalMs]);

  return { data, error, lastUpdate, reload: load };
}
