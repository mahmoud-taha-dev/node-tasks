interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export function createCache() {
  const cache = new Map<string, CacheEntry<any>>();

  function set<T>(key: string, value: T, ttl: number = 60000): void {
    const expiry = Date.now() + ttl;
    cache.set(key, { value, expiry });
  }

  async function get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    ttl: number = 60000,
  ): Promise<T | null> {
    const entry = cache.get(key);
    const isExpired = entry && Date.now() > entry.expiry;

    if (!entry || isExpired) {
      if (fetcher) {
        const value = await fetcher();
        set(key, value, ttl);
        return value;
      }
      if (isExpired) {
        cache.delete(key);
      }
      return null;
    }

    return entry.value as T;
  }

  function clear(): void {
    cache.clear();
  }

  return { set, get, clear };
}
