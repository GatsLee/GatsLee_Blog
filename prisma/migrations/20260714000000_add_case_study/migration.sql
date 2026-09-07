-- Case study beats (JSON, shaped by CaseBeats in src/lib/case-study.ts)
ALTER TABLE "Post" ADD COLUMN "caseBeats" TEXT;

-- Taxonomy cleanup: fold dead categories into "journal".
-- /insights already queries category = 'journal', so rows in these legacy
-- categories were orphaned — unreachable from any route. This makes them
-- visible again (bug fix, not just tidying).
UPDATE "Post" SET "category" = 'journal'
 WHERE "category" IN ('devlog', 'troubleshooting', 'blueprint', 'progress');
