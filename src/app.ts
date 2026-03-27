// src/app.ts
// We build and export the Fastify app separately from starting the server.
// Why? So tests can import the app without binding to a port.
import Fastify, { FastifyError } from "fastify";
import { urlRoutes } from "./modules/url/url.routes.js";

export function buildApp() {
  const fastify = Fastify({
    logger: {
      // Pretty logs in dev, structured JSON in production
      // (JSON logs are what tools like Datadog, Loki, CloudWatch expect)
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty" }
          : undefined,
    },
  });

  // Global error handler — catches anything thrown inside route handlers
  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    // Fastify wraps schema validation failures as 400
    if (error.statusCode === 400) {
      return reply.code(400).send({ error: error.message });
    }
    // "URL not found" errors from our services → 404
    if (error.message.includes("not found")) {
      return reply.code(404).send({ error: error.message });
    }
    // "Invalid URL format" → 422 Unprocessable Entity
    if (error.message.includes("Invalid URL")) {
      return reply.code(422).send({ error: error.message });
    }
    // Unexpected errors — log and return a safe generic message
    fastify.log.error(error);
    return reply.code(500).send({ error: "Internal server error" });
  });

  // Register routes
  fastify.register(urlRoutes);

  // Health check — load balancers ping this to know if this instance is alive
  // Returns 200 as long as the process is running
  fastify.get("/health", async () => ({ status: "ok" }));

  return fastify;
}
