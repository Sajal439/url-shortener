// src/server.ts
// This is the actual entry point. It imports the app and starts listening.
// Keeping this separate from app.ts means tests can use the app without
// a real server socket.
import "./config/env.js"; // validates env vars first — fail fast
import { buildApp } from "./app.js";
import prisma from "./infrastructure/database/prisma.service.js";
import redis from "./infrastructure/cache/redis.service.js";
import { env } from "./config/env.js";

const app = buildApp();

// Graceful shutdown — when the process receives SIGTERM (e.g. from Docker,
// Kubernetes, or Ctrl+C), we:
// 1. Stop accepting new requests
// 2. Close open DB connections
// 3. Close Redis connections
// Without this, connections leak and your DB pool fills up.
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  await app.close();
  await prisma.$disconnect();
  await redis.quit();
  console.log("✅ Shutdown complete");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// Start the server
try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  // host 0.0.0.0 means accept connections from any network interface
  // (required inside Docker — "localhost" only accepts from within the container)
} catch (err) {
  app.log.error(err);
  await prisma.$disconnect();
  await redis.quit();
  process.exit(1);
}