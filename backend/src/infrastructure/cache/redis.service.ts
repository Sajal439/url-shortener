import { env } from "../../config/env.js";
import { Redis } from "ioredis";
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  // Don't crash the whole app if Redis is temporarily down.
  // lazyConnect means we don't connect until the first command.
  lazyConnect: true,

  // Retry connecting up to 3 times, then give up.
  maxRetriesPerRequest: 3,
});

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
