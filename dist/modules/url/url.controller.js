import { createShortUrl, getLongUrl, getUrlStats, trackClick, } from "./url.service.js";
export const shortenUrl = async (request, reply) => {
    const result = await createShortUrl(request.body.url);
    return reply.code(201).send(result);
};
export const redirectUrl = async (request, reply) => {
    const { shortCode } = request.params;
    const longUrl = await getLongUrl(shortCode);
    trackClick(shortCode);
    return reply.code(302).redirect(longUrl);
};
export const getStats = async (request, reply) => {
    const stats = await getUrlStats(request.params.shortCode);
    return reply.code(200).send(stats);
};
