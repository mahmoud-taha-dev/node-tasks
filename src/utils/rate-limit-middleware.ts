import { Request, Response, NextFunction } from "express";


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
        error: "Too Many Requests",
        retryAfter: Math.ceil((resetTime - now) / 1000),
      });
      return;
    }

    requests++;
    next();
  };
}
