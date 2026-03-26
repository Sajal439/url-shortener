import { FastifyInstance } from "fastify";
import { redirectUrl } from "./url.controller.js";

export async function urlRoutes(fastify: FastifyInstance) {
  fastify.get("/:shortCode", redirectUrl);
}
