// src/modules/url/url.types.ts
// Shared types used across controller, service, and routes.
// Keeping types in one place means you only update them once.

export interface ShortenUrlBody {
  url: string;
}

export interface ShortenUrlResponse {
  shortUrl: string;
  shortCode: string;
  createdAt: Date;
}

export interface StatsResponse {
  shortUrl: string;
  longUrl: string;
  clickCount: number;
  createdAt: Date;
  expiresAt: Date | null;
}

// Fastify uses these generic params to type request objects
export interface ShortCodeParams {
  shortCode: string;
}
