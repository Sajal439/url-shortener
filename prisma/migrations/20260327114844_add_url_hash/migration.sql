/*
  Warnings:

  - A unique constraint covering the columns `[url_hash]` on the table `urls` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url_hash` to the `urls` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "urls" ADD COLUMN     "url_hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "urls_url_hash_key" ON "urls"("url_hash");
