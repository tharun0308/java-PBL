/**
 * fetchWithAuth: Client-side fetch wrapper with seamless token refresh.
 * If any fetch request encounters a 401 Unauthorized response, it deduplicates
 * and fires a silent refresh to /api/auth/refresh, then retries the original request.
 */

let refreshPromise: Promise<boolean> | null = null;

export async function silentRefreshToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          return !!data.success;
        }
        return false;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as any).url || '';
  const isAuthEndpoint =
    urlStr.includes('/api/auth/login') ||
    urlStr.includes('/api/auth/register') ||
    urlStr.includes('/api/auth/refresh') ||
    urlStr.includes('/api/auth/logout');

  if (res.status === 401 && !isAuthEndpoint) {
    const refreshed = await silentRefreshToken();
    if (refreshed) {
      // Retry the original request
      return fetch(input, init);
    }
  }

  return res;
}
