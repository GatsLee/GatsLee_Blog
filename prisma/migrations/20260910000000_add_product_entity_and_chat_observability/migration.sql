-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GuestbookEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProgressItem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'planning',
    "stamp" TEXT NOT NULL DEFAULT '',
    "periodStart" TEXT NOT NULL DEFAULT '',
    "periodEnd" TEXT NOT NULL DEFAULT '',
    "ongoing" BOOLEAN NOT NULL DEFAULT false,
    "roles" TEXT NOT NULL DEFAULT '[]',
    "headcount" INTEGER NOT NULL DEFAULT 1,
    "useCase" TEXT NOT NULL DEFAULT '',
    "audience" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '[]',
    "stack" TEXT NOT NULL DEFAULT '[]',
    "links" TEXT NOT NULL DEFAULT '[]',
    "problemBody" TEXT NOT NULL DEFAULT '',
    "evidence" TEXT NOT NULL DEFAULT '{}',
    "features" TEXT NOT NULL DEFAULT '[]',
    "flowEmbedUrl" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ip" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chunkIds" TEXT NOT NULL DEFAULT '[]',
    "tier" TEXT NOT NULL DEFAULT '',
    "mlGate" BOOLEAN,
    "fallback" BOOLEAN NOT NULL DEFAULT false,
    "ttftMs" INTEGER,
    "totalMs" INTEGER,
    "feedback" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_ChatMessage" ("content", "createdAt", "id", "ip", "role", "sessionId") SELECT "content", "createdAt", "id", "ip", "role", "sessionId" FROM "ChatMessage";
DROP TABLE "ChatMessage";
ALTER TABLE "new_ChatMessage" RENAME TO "ChatMessage";
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "locale" TEXT NOT NULL DEFAULT 'ko',
    "translationKey" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "githubRepo" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "buildProgress" INTEGER NOT NULL DEFAULT 0,
    "relatedPosts" TEXT NOT NULL DEFAULT '[]',
    "demoVideo" TEXT,
    "demoImages" TEXT,
    "externalLinks" TEXT,
    "targetAudience" TEXT,
    "purpose" TEXT,
    "expectedEffect" TEXT,
    "caseBeats" TEXT,
    "aiSummary" TEXT NOT NULL DEFAULT '',
    "productId" INTEGER,
    "takeaway" TEXT NOT NULL DEFAULT '',
    "seriesKey" TEXT NOT NULL DEFAULT '',
    "seriesOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("aiSummary", "buildProgress", "caseBeats", "category", "content", "coverImage", "createdAt", "demoImages", "demoVideo", "description", "expectedEffect", "externalLinks", "githubRepo", "id", "locale", "pinned", "published", "purpose", "relatedPosts", "slug", "tags", "targetAudience", "title", "translationKey", "updatedAt") SELECT "aiSummary", "buildProgress", "caseBeats", "category", "content", "coverImage", "createdAt", "demoImages", "demoVideo", "description", "expectedEffect", "externalLinks", "githubRepo", "id", "locale", "pinned", "published", "purpose", "relatedPosts", "slug", "tags", "targetAudience", "title", "translationKey", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_productId_idx" ON "Post"("productId");
CREATE TABLE "new_PostChunk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "postTitle" TEXT NOT NULL,
    "postSlug" TEXT NOT NULL,
    "postCategory" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL DEFAULT '[]',
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PostChunk" ("chunkIndex", "content", "createdAt", "embedding", "id", "postCategory", "postId", "postSlug", "postTitle", "updatedAt") SELECT "chunkIndex", "content", "createdAt", "embedding", "id", "postCategory", "postId", "postSlug", "postTitle", "updatedAt" FROM "PostChunk";
DROP TABLE "PostChunk";
ALTER TABLE "new_PostChunk" RENAME TO "PostChunk";
CREATE INDEX "PostChunk_postId_idx" ON "PostChunk"("postId");
CREATE TABLE "new_SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteConfig" ("id", "key", "updatedAt", "value") SELECT "id", "key", "updatedAt", "value" FROM "SiteConfig";
DROP TABLE "SiteConfig";
ALTER TABLE "new_SiteConfig" RENAME TO "SiteConfig";
CREATE UNIQUE INDEX "SiteConfig_key_key" ON "SiteConfig"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_published_sortOrder_idx" ON "Product"("published", "sortOrder");

