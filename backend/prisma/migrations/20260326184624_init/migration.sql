/*
  Warnings:

  - You are about to drop the column `longUrl` on the `Url` table. All the data in the column will be lost.
  - Added the required column `long_url` to the `Url` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Url" DROP COLUMN "longUrl",
ADD COLUMN     "long_url" TEXT NOT NULL;
