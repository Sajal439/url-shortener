// src/modules/url/click-flush.job.ts
// Background job that periodically flushes click counters from Redis to Postgres.
// Without this, the fire-and-forget Redis INCR in trackClick() would never
// persist to the database, and clickCount in Postgres would stay at 0 forever.
import redis from "../../infrastructure/cache/redis.service.js";
import prisma from "../../infrastructure/database/prisma.service.js";
const FLUSH_INTERVAL_MS = 30_000; // Every 30 seconds
const CLICKS_PREFIX = "clicks:";
/**
 * Scans Redis for all `clicks:*` keys, atomically reads and deletes each one,
 * then increments the corresponding Postgres row's clickCount.
 *
 * Uses GETDEL (Redis 6.2+) so the read + delete is atomic — no double-counting
 * even if two flush cycles overlap somehow.
 */
async function flushClicksToDB() {
    let cursor = "0";
    do {
        // SCAN is non-blocking and cursor-based — safe in production unlike KEYS *
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${CLICKS_PREFIX}*`, "COUNT", 100);
        cursor = nextCursor;
        for (const key of keys) {
            const shortCode = key.slice(CLICKS_PREFIX.length);
            // Atomically read and delete the counter
            const count = await redis.getdel(key);
            if (count && Number(count) > 0) {
                try {
                    await prisma.url.update({
                        where: { shortCode },
                        data: { clickCount: { increment: Number(count) } },
                    });
                }
                catch (err) {
                    // DB write failed — put the clicks back into Redis so they
                    // aren't lost. They'll be picked up on the next flush cycle.
                    await redis
                        .incrby(key, Number(count))
                        .catch((redisErr) => console.error("Failed to restore clicks to Redis:", redisErr));
                    console.error(`Click flush failed for ${shortCode}, re-queued ${count} clicks:`, err);
                }
            }
        }
    } while (cursor !== "0");
}
let intervalId = null;
export function startClickFlushJob() {
    console.log(`🔄 Click flush job started (every ${FLUSH_INTERVAL_MS / 1000}s)`);
    intervalId = setInterval(async () => {
        try {
            await flushClicksToDB();
        }
        catch (err) {
            console.error("Click flush cycle failed:", err);
        }
    }, FLUSH_INTERVAL_MS);
}
export function stopClickFlushJob() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("🛑 Click flush job stopped");
    }
}
