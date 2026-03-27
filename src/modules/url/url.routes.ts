// src/modules/url/url.routes.ts
// Fastify schema validation runs BEFORE your controller.
// Invalid requests are rejected automatically — no manual if-checks needed.
import { FastifyInstance } from "fastify";
import { shortenUrl, redirectUrl, getStats } from "./url.controller.js";

export async function urlRoutes(fastify: FastifyInstance) {
  // POST /shorten — create a new short URL
  fastify.post(
    "/shorten",
    {
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
  fastify.get(
    "/:shortCode",
    {
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
  fastify.get(
    "/stats/:shortCode",
    {
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
