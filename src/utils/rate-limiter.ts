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
