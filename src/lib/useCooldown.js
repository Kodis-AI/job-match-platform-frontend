import { useCallback, useEffect, useState } from 'react';

/**
 * Countdown that keeps a button disabled after a rate limit (HTTP 429).
 * `start()` begins it; `remaining` is the whole seconds left (0 when idle).
 */
export function useCooldown(seconds) {
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!endsAt) return undefined;
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const start = useCallback(() => {
    const current = Date.now();
    setNow(current);
    setEndsAt(current + seconds * 1000);
  }, [seconds]);

  return { remaining: Math.max(0, Math.ceil((endsAt - now) / 1000)), start };
}
