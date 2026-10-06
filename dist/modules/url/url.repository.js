// src/modules/url/url.repository.ts
// The repository layer is ONLY responsible for talking to the database.
// No business logic here — just queries.
import prisma from "../../infrastructure/database/prisma.service.js";
export const getUrlByShortCode = async (shortCode) => {
    return prisma.url.findFirst({
        where: {
            shortCode,
            isActive: true,
            // Also filter out expired URLs
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: {
            id: true,
            longUrl: true,
            clickCount: true,
            createdAt: true,
            expiresAt: true,
        },
    });
};
export const createUrl = (id, longUrl, shortCode, urlHash) => {
    return prisma.url.create({
        data: {
            id,
            longUrl,
            shortCode,
            urlHash,
        },
    });
};
export const findByHash = (hash) => {
    return prisma.url.findUnique({
        where: {
            urlHash: hash,
        },
    });
};
