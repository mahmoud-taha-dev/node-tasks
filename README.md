# Node Tasks Project

This is a Node.js project showing how to implement various tasks using TypeScript.

## Utility Functions

### Async Retry Mechanism

A generic retry mechanism for asynchronous functions to handle transient failures.

**Source:** `src/utils/retry.ts`

```typescript
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    console.log(`Retrying... attempts left: ${retries - 1}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay);
  }
}
```

### Fetch-Through Cache with Expiration

A simple in-memory cache for promise-based operations with time-to-live (TTL) support.

**Source:** `src/utils/cache.ts`

```typescript
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
```

### API Rate Limiter Middleware 

A rate limiter that returns a `429 Too Many Requests` response if the limit is exceeded within the interval.

**Source:** `src/utils/rate-limit-middleware.ts`

```typescript
export function createApiRateLimiter(limit: number, interval: number) {
  let requests = 0;
  let resetTime = Date.now() + interval;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();

    if (now >= resetTime) {
      requests = 0;
      resetTime = now + interval;
    }

    if (requests >= limit) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((resetTime - now) / 1000)
      });
      return;
    }

    requests++;
    next();
  };
}
````

**Usage:**

```typescript
const limiter = createApiRateLimiter(5, 10000); // 5 requests per 10s
app.get('/api/data', limiter, (req, res) => { ... });
```

### Rate Limiter

A generic rate-limiting mechanism to control the execution frequency of functions or API calls.

**Source:** `src/utils/rate-limiter.ts`

```typescript
export function createRateLimiter(limit: number, interval: number) {
  let requests = 0;
  let resetTime = Date.now() + interval;
  const queue: Array<{ fn: () => Promise<any>; resolve: any; reject: any }> =
    [];

  const processQueue = () => {
    const now = Date.now();

    if (now >= resetTime) {
      requests = 0;
      resetTime = now + interval;
    }

    while (requests < limit && queue.length > 0) {
      const item = queue.shift();
      if (item) {
        const { fn, resolve, reject } = item;
        requests++;
        fn().then(resolve).catch(reject);
      }
    }

    if (queue.length > 0 && requests >= limit) {
      const delay = Math.max(0, resetTime - Date.now());
      setTimeout(processQueue, delay);
    }
  };

  return function <T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      processQueue();
    });
  };
}
```

````




## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run development server:

   ```bash
   pnpm dev
   ```

3. Build and Start:
   ```bash
   pnpm build
   pnpm start
   ```
