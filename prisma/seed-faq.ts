/**
 * One-shot seed script — migrates src/data/faq.ts into the FaqEntry table.
 * Idempotent: skips entries whose slug already exists.
 *
 * Usage: docker exec blog node /app/seed-faq.js
 * (compiled via tsc or ts-node — see Dockerfile/entrypoint for invocation)
 */
import { PrismaClient } from "@prisma/client";
import { FAQ_DATA } from "../src/data/faq";

const prisma = new PrismaClient();

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const entry of FAQ_DATA) {
    const exists = await prisma.faqEntry.findUnique({ where: { slug: entry.id } });
    if (exists) {
      skipped++;
      continue;
    }

    await prisma.faqEntry.create({
      data: {
        slug: entry.id,
        qVariants: JSON.stringify(entry.q),
        a_ko: entry.a_ko,
        a_en: entry.a_en,
        tags: JSON.stringify(entry.tags),
        isActive: true,
        source: "seed",
      },
    });
    inserted++;
  }

  console.log(`[seed-faq] Inserted ${inserted}, skipped ${skipped} (already present). Total in DB: ${FAQ_DATA.length}.`);
}

main()
  .catch((e) => {
    console.error("[seed-faq] Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
