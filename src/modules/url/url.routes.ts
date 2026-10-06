// src/modules/url/url.routes.ts
// Fastify schema validation runs BEFORE your controller.
// Invalid requests are rejected automatically — no manual if-checks needed.
import { FastifyInstance } from "fastify";
import { shortenUrl, redirectUrl, getStats } from "./url.controller.js";
import { rateLimiter } from "../../common/hooks/rateLimiter.js";
import type { ShortenUrlBody, ShortCodeParams } from "./url.types.js";

// Rate limit configs — tune these per environment.
// The write path is tighter because each POST creates a DB row.
// The read path (redirects) is more generous since it's the hot path.
const writeLimiter = rateLimiter({ max: 100, windowSeconds: 60, prefix: "write" });
const readLimiter = rateLimiter({ max: 1000, windowSeconds: 60, prefix: "read" });
const statsLimiter = rateLimiter({ max: 200, windowSeconds: 60, prefix: "stats" });

export async function urlRoutes(fastify: FastifyInstance) {
  // POST /shorten — create a new short URL
  fastify.post<{ Body: ShortenUrlBody }>(
    "/shorten",
    {
      preHandler: [writeLimiter],
      schema: {
        body: {
          type: "object",
          required: ["url"],
          properties: {
            url: {
              type: "string",
              format: "uri", // Fastify validates this is a valid URL
              maxLength: 2048, // browsers cap URLs at ~2000 chars
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              shortUrl: { type: "string" },
              shortCode: { type: "string" },
              createdAt: { type: "string" },
            },
          },
        },
      },
    },
    shortenUrl,
  );

  // GET /:shortCode — redirect to the original URL (hot path)
  fastify.get<{ Params: ShortCodeParams }>(
    "/:shortCode",
    {
      preHandler: [readLimiter],
      schema: {
        params: {
          type: "object",
          properties: {
            shortCode: { type: "string", minLength: 1, maxLength: 20 },
          },
        },
      },
    },
    redirectUrl,
  );

  // GET /stats/:shortCode — view analytics for a short URL
  fastify.get<{ Params: ShortCodeParams }>(
    "/stats/:shortCode",
    {
      preHandler: [statsLimiter],
      schema: {
        params: {
          type: "object",
          properties: {
            shortCode: { type: "string", minLength: 1, maxLength: 20 },
          },
        },
      },
    },
    getStats,
  );
}


