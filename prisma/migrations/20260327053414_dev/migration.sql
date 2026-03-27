/*
  Warnings:

  - You are about to drop the `Url` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Url";

-- CreateTable
CREATE TABLE "urls" (
    "id" BIGSERIAL NOT NULL,
    "short_code" TEXT NOT NULL,
    "long_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_short_code_key" ON "urls"("short_code");

-- CreateIndex
CREATE INDEX "urls_short_code_idx" ON "urls"("short_code");
