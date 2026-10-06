import { env } from "../../config/env.js";
import { Redis } from "ioredis";
// Use REDIS_URL if provided (like on Render), otherwise fallback to localhost
const redisOptions = {
  // Don't crash the whole app if Redis is temporarily down.
  lazyConnect: true,
  // Retry connecting up to 3 times, then give up.
  maxRetriesPerRequest: 3,
};

const redis = env.REDIS_URL 
  ? new Redis(env.REDIS_URL, redisOptions)
  : new Redis(redisOptions);

redis.on("connect", () => {
  console.log("Redis is connected");
});
redis.on("error", (err) => {
  console.error("Error connecting redis", err.message);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});

export default redis;
