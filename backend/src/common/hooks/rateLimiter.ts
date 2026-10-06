// src/common/hooks/rateLimiter.ts
// Reusable Fastify preHandler for IP-based rate limiting via Redis.
// Each route can specify its own limit and window independently.
import { FastifyRequest, FastifyReply } from "fastify";
import redis from "../../infrastructure/cache/redis.service.js";

interface RateLimitConfig {
  /** Maximum number of requests allowed per window */
  max: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Key prefix to isolate rate limit pools (e.g. "write", "read") */
  prefix?: string;
}

export function rateLimiter(config: RateLimitConfig) {
  const { max, windowSeconds, prefix = "global" } = config;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Bucket requests into fixed time windows.
    // All requests within the same window share the same counter key.
    const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const rateKey = `ratelimit:${prefix}:${request.ip}:${bucket}`;

    try {
      const count = await redis.incr(rateKey);

      // Set TTL only on the first increment so the key auto-expires
      // after the window closes — prevents stale keys piling up.
      if (count === 1) {
        await redis.expire(rateKey, windowSeconds);
      }

      // Standard rate-limit headers (draft-ietf-httpapi-ratelimit-headers)
      reply.header("X-RateLimit-Limit", max);
      reply.header("X-RateLimit-Remaining", Math.max(0, max - count));

      if (count > max) {
        return reply.status(429).send({ error: "Too many requests" });
      }
    } catch (err) {
      // Fail-open: if Redis is down, allow the request through.
      // Serving traffic without rate limiting beats blocking everything.
      request.log.warn({ err }, "Rate limiter Redis error, failing open");
    }
  };
}
