import { FastifyRequest, FastifyReply } from "fastify";
import { getLongUrl } from "./url.service.js";

export const redirectUrl = async (
  request: FastifyRequest<{ Params: { shortCode: string } }>,
  reply: FastifyReply,
) => {
  const { shortCode } = request.params;
  try {
    const longurl = await getLongUrl(shortCode);
    return reply.redirect(longurl);
  } catch (error) {
    return reply.status(404).send({
      message: "Url not found",
    });
  }
};
