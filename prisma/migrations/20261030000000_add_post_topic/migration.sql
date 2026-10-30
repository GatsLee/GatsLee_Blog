-- 글 주제 5개 (DECISIONS D2). 기획·개발·AI·아카이빙·홈서버
ALTER TABLE "Post" ADD COLUMN "topic" TEXT NOT NULL DEFAULT '';
CREATE INDEX "Post_topic_idx" ON "Post"("topic");

-- 기존 글 주제 지정 (2026-10-30, 제목·태그 기준)
UPDATE "Post" SET "topic" = 'planning'   WHERE "id" IN (64, 51, 43);
UPDATE "Post" SET "topic" = 'dev'        WHERE "id" IN (57, 54, 37, 34, 52);
UPDATE "Post" SET "topic" = 'ai'         WHERE "id" IN (48, 47, 44, 42, 46, 41, 39, 63, 62, 61, 59, 58);
UPDATE "Post" SET "topic" = 'archiving'  WHERE "id" IN (56, 36, 38, 33);
UPDATE "Post" SET "topic" = 'homeserver' WHERE "id" IN (49, 50, 45, 27, 32);
