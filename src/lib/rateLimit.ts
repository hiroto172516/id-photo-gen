type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitState>();

export function consumeFixedWindowRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}) {
  const now = options.now ?? Date.now();
  const current = rateLimitStore.get(options.key);

  if (!current || current.resetAt <= now) {
    const nextState = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitStore.set(options.key, nextState);

    return {
      allowed: true as const,
      remaining: Math.max(0, options.limit - nextState.count),
      resetAt: nextState.resetAt,
    };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false as const,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  rateLimitStore.set(options.key, current);

  return {
    allowed: true as const,
    remaining: Math.max(0, options.limit - current.count),
    resetAt: current.resetAt,
  };
}

export function pruneExpiredRateLimitEntries(now = Date.now()) {
  for (const [key, state] of rateLimitStore.entries()) {
    if (state.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}
