-- CreateTable
CREATE TABLE "Url" (
    "id" BIGSERIAL NOT NULL,
    "short_code" TEXT NOT NULL,
    "longUrl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_short_code_key" ON "Url"("short_code");

-- CreateIndex
CREATE INDEX "Url_short_code_idx" ON "Url"("short_code");
