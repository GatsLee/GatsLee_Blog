-- 글 상태 3단계 (DECISIONS D6). published는 status = 'published'와 같게 유지한다
ALTER TABLE "Post" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'published';
UPDATE "Post" SET "status" = CASE WHEN "published" = 1 THEN 'published' ELSE 'draft' END;
CREATE INDEX "Post_status_idx" ON "Post"("status");
