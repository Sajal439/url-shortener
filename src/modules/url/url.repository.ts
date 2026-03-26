import prisma from "@/infrastructure/database/prisma.service.js";

export const getUrlByShortCode = async (shortCode: string) => {
  return await prisma.url.findFirst({
    where: {
      shortCode,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: {
      longUrl: true,
      clickCount: true,
    },
  });
};

import { randomUUID } from "node:crypto";

export const createUrl = (longUrl: string) => {
  return prisma.url.create({
    data: {
      longUrl: longUrl,
      shortCode: `temp_${randomUUID()}`,
    },
  });
};

export const updateShortCode = (id: bigint, shortCode: string) => {
  return prisma.url.update({
    where: { id },
    data: { shortCode: shortCode },
  });
};
