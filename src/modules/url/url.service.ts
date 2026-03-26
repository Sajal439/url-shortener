import redis from "@/infrastructure/cache/redis.service.js";
import {
  createUrl,
  getUrlByShortCode,
  updateShortCode,
} from "./url.repository.js";
import { encodeBase62 } from "@/common/utils/Base62.js";

export const getLongUrl = async (shortCode: string) => {
  if (!shortCode) {
    throw new Error("Short code is required");
  }
  // 1. check redis
  const cacheKey = `url:${shortCode}`;
  const cachedUrl = await redis.get(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  // 2. fetch from db if not in redis
  const url = await getUrlByShortCode(shortCode);
  if (!url) {
    throw new Error("URL not found");
  }

  // 3. store in cache

  await redis.set(shortCode, url.longUrl, "EX", 60 * 60 * 24);

  return url.longUrl;
};

export const createShortUrl = async (longUrl: string) => {
  if (!longUrl) {
    throw new Error("Long URL is required");
  }
  try {
    new URL(longUrl);
  } catch {
    throw new Error("Invalid URL");
  }
  // 1. insert into db
  const newUrl = await createUrl(longUrl);

  // 2. generate short code
  const shortCode = encodeBase62(newUrl.id);

  // 3. update db with short code
  await updateShortCode(newUrl.id, shortCode);

  return shortCode;
};
