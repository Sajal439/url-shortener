import redis from "../../infrastructure/cache/redis.service.js";
import CryptoJS from "crypto-js";
import { createUrl, getUrlByShortCode, findByHash } from "./url.repository.js";
import { encodeBase62 } from "../../common/utils/base62.js";
import { env } from "../../config/env.js";
import type { ShortenUrlResponse, StatsResponse } from "./url.types.js";
import { generateId } from "@/common/utils/snowflake.js";

const CACHE_PREFIX = "url:";
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export const getLongUrl = async (shortCode: string) => {
  const lockKey = `lock:url:${shortCode}`;
  const cacheKey = `${CACHE_PREFIX}${shortCode}`;

  if (!shortCode) throw new Error("Short code is required");

  // 1. Check Redis first (cache-aside pattern)
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached; // Cache hit — no DB query needed
    }

    let retries = 5;
    while (retries--) {
      const lock = await redis.set(lockKey, "1", "EX", 5, "NX");

      if (lock == "OK") {
        try {
          const cachedAgain = await redis.get(cacheKey);
          if (cachedAgain) return cachedAgain;

          // 2. Cache miss — go to DB

          const url = await getUrlByShortCode(shortCode);
          if (!url) throw new Error("URL not found");
          await redis.set(cacheKey, url.longUrl, "EX", CACHE_TTL_SECONDS);
          return url.longUrl;
        } finally {
          await redis.del(lockKey);
        }
      } else {
        await new Promise((r) => {
          setTimeout(r, 50 + Math.random() * 50);
        });
      }
      const cacheRetry = await redis.get(cacheKey);
      if (cacheRetry) return cacheRetry;
    }
  } catch (error) {
    console.error("Redis is down or timedout", error);
  }
  const sourceOfTruth = await getUrlByShortCode(shortCode);
  if (!sourceOfTruth) throw new Error("URL not found");
  return sourceOfTruth.longUrl;
};

export const createShortUrl = async (longUrl: string) => {
  if (!longUrl) throw new Error("Long URL is required");

  // Validate the URL format before touching the DB
  try {
    new URL(longUrl);
  } catch {
    throw new Error("Invalid URL format");
  }
  // 1. generate hash and check for existence
  const urlHash = CryptoJS.MD5(longUrl).toString();
  const existing = await findByHash(urlHash);
  if (existing) {
    return {
      shortUrl: `${env.BASE_URL}/${existing.shortCode}`,
      shortCode: existing.shortCode,
      longUrl,
      createdAt: existing.createdAt,
      expiresAt: existing.expiresAt ?? null,
    };
  }

  // 2. generate id
  const id = generateId();

  // 3. generate short code
  const shortCode = encodeBase62(id);

  // 4. insert to db
  await createUrl(id, longUrl, shortCode, urlHash);

  return {
    shortUrl: `${env.BASE_URL}/${shortCode}`,
    shortCode: shortCode,
    longUrl,
    createdAt: new Date(),
    expiresAt: null,
  };
};

export const getUrlStats = async (
  shortCode: string,
): Promise<StatsResponse> => {
  const url = await getUrlByShortCode(shortCode);
  if (!url) throw new Error("URL not found");

  // Include any un-flushed clicks still sitting in Redis so the count
  // is accurate in real-time, not just after the next flush cycle.
  let pendingClicks = 0;
  try {
    const raw = await redis.get(`clicks:${shortCode}`);
    if (raw) pendingClicks = Number(raw);
  } catch {
    // Redis down — just report DB count
  }

  return {
    shortUrl: `${env.BASE_URL}/${shortCode}`,
    longUrl: url.longUrl,
    clickCount: url.clickCount + pendingClicks,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt ?? null,
  };
};

// Fire-and-forget click tracking — doesn't block the redirect
export const trackClick = (shortCode: string): void => {
  const cacheKey = `clicks:${shortCode}`;
  // Increment a counter in Redis (fast). A background job can flush
  // these to Postgres in batches — much better than a DB write per click.
  redis
    .incr(cacheKey)
    .catch((err) => console.error("Click tracking failed:", err));
};
