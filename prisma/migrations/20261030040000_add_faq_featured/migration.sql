-- 챗봇 추천 질문 5개와 클릭 기록 (D7, IA_AD_004 · IA_AD_00401)
ALTER TABLE "FaqEntry" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FaqEntry" ADD COLUMN "featuredOrder" INTEGER NOT NULL DEFAULT 0;

-- 지금 추천 질문으로 쓰던 앞 5개(사용 중, id 순)를 그대로 대표 FAQ로 둔다
UPDATE "FaqEntry" SET "featured" = true, "featuredOrder" = (
  SELECT COUNT(*) FROM "FaqEntry" AS f2 WHERE f2."isActive" = true AND f2."id" <= "FaqEntry"."id"
)
WHERE "id" IN (SELECT "id" FROM "FaqEntry" WHERE "isActive" = true ORDER BY "id" LIMIT 5);

CREATE TABLE "FaqClick" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "faqId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FaqClick_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FaqEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "FaqClick_faqId_idx" ON "FaqClick"("faqId");
CREATE INDEX "FaqClick_createdAt_idx" ON "FaqClick"("createdAt");
