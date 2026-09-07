import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { chunkPost, embedTexts, invalidateChunkCache } from "@/lib/rag";

export async function POST() {
  // Admin auth required
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all published posts
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        content: true,
      },
    });

    if (posts.length === 0) {
      return Response.json({ indexed: 0, chunks: 0 });
    }

    // Delete all existing chunks (full reindex)
    await prisma.postChunk.deleteMany();

    let totalChunks = 0;

    // Process posts in batches to avoid overwhelming Ollama
    for (const post of posts) {
      const chunks = chunkPost(post.title, post.content);
      if (chunks.length === 0) continue;

      // Batch embed all chunks for this post
      const embeddings = await embedTexts(chunks);

      // Insert chunks
      await prisma.postChunk.createMany({
        data: chunks.map((content, i) => ({
          postId: post.id,
          postTitle: post.title,
          postSlug: post.slug,
          postCategory: post.category,
          content,
          embedding: JSON.stringify(embeddings[i]),
          chunkIndex: i,
        })),
      });

      totalChunks += chunks.length;
    }

    invalidateChunkCache();
    return Response.json({
      indexed: posts.length,
      chunks: totalChunks,
    });
  } catch (err) {
    console.error("Indexing error:", err);
    return Response.json(
      { error: "Indexing failed", detail: String(err) },
      { status: 500 }
    );
  }
}
