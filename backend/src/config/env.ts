// src/config/env.ts
// Validate all required env vars at startup.
// If anything is missing, the process exits immediately with a clear error
// instead of failing mysteriously at runtime.
import "dotenv/config";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return val;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  REDIS_URL: process.env.REDIS_URL, // Optional, ioredis will parse this
  PORT: Number(process.env.PORT ?? 3000),
  BASE_URL: process.env.BASE_URL ?? "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
