import { FastifyRequest, FastifyReply } from "fastify";
import {
  createShortUrl,
  getLongUrl,
  getUrlStats,
  trackClick,
} from "./url.service.js";
import type { ShortenUrlBody, ShortCodeParams } from "./url.types.js";
import redis from "@/infrastructure/cache/redis.service.js";

export const shortenUrl = async (
  request: FastifyRequest<{ Body: ShortenUrlBody }>,
  reply: FastifyReply,
) => {
  const currentMinute = new Date().toISOString().slice(0, 16);
  const rateKey = `limit:${request.ip}:${currentMinute}`;
  const count = await redis.incr(rateKey);

  if (count === 1) {
    await redis.expire(rateKey, 60);
  }
  if (count > 50000) {
    return reply.status(429).send({ error: "Too many requests" });
  }
  const result = await createShortUrl(request.body.url);
  return reply.code(201).send(result);
};

export const redirectUrl = async (
  request: FastifyRequest<{ Params: ShortCodeParams }>,
  reply: FastifyReply,
) => {
  const { shortCode } = request.params;
  const longUrl = await getLongUrl(shortCode);

  trackClick(shortCode);

  return reply.code(302).redirect(longUrl);
};

export const getStats = async (
  request: FastifyRequest<{ Params: ShortCodeParams }>,
  reply: FastifyReply,
) => {
  const stats = await getUrlStats(request.params.shortCode);
  return reply.code(201).send(stats);
};
