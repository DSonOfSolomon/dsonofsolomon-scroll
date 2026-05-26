import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type RateLimitConfig = {
  limit: number;
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d`;
  prefix: string;
};

type MemoryEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, MemoryEntry>();
const upstashRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;
const upstashLimiters = new Map<string, Ratelimit>();

function windowToMs(window: RateLimitConfig["window"]) {
  const [amount, unit] = window.split(" ");
  const value = Number(amount);

  if (unit === "s") {
    return value * 1000;
  }

  if (unit === "m") {
    return value * 60 * 1000;
  }

  if (unit === "h") {
    return value * 60 * 60 * 1000;
  }

  return value * 24 * 60 * 60 * 1000;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function getUpstashLimiter(config: RateLimitConfig) {
  const key = `${config.prefix}:${config.limit}:${config.window}`;
  const existing = upstashLimiters.get(key);

  if (existing) {
    return existing;
  }

  if (!upstashRedis) {
    return null;
  }

  const limiter = new Ratelimit({
    redis: upstashRedis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: `ratelimit:${config.prefix}`,
  });

  upstashLimiters.set(key, limiter);
  return limiter;
}

function checkMemoryLimit(identifier: string, config: RateLimitConfig) {
  const now = Date.now();
  const key = `${config.prefix}:${identifier}`;
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowToMs(config.window),
    });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + windowToMs(config.window),
    };
  }

  if (existing.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: existing.resetAt,
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    success: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - existing.count),
    reset: existing.resetAt,
  };
}

function rateLimitResponse(reset: number) {
  return NextResponse.json(
    { error: "Too many requests. Try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": Math.max(1, Math.ceil((reset - Date.now()) / 1000)).toString(),
      },
    },
  );
}

export async function enforceRateLimitForIdentifier(
  identifier: string,
  config: RateLimitConfig,
) {
  const limiter = getUpstashLimiter(config);
  const result = limiter
    ? await limiter.limit(identifier)
    : checkMemoryLimit(identifier, config);

  if (result.success) {
    return null;
  }

  return rateLimitResponse(result.reset);
}

export async function enforceRateLimit(request: NextRequest, config: RateLimitConfig) {
  return enforceRateLimitForIdentifier(getClientIp(request), config);
}
