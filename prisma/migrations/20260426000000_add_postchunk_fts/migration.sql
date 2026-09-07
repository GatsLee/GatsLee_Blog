CREATE VIRTUAL TABLE IF NOT EXISTS "PostChunkFTS" USING fts5(
  chunkId UNINDEXED,
  content,
  postTitle,
  tokenize = 'trigram'
);
