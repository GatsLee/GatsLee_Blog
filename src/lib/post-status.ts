/**
 * 글 상태 (DECISIONS D6). status와 published를 늘 같은 뜻으로 맞춘다.
 * - status가 오면 published를 거기에 맞춘다
 * - published만 오면 status를 계산한다. 발행됐던 글을 내리면 숨김, 아니면 초안
 */
export const POST_STATUSES = ["draft", "published", "hidden"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const STATUS_LABEL: Record<PostStatus, string> = { draft: "초안", published: "발행됨", hidden: "숨김" };

export const isPostStatus = (v: unknown): v is PostStatus => POST_STATUSES.includes(v as PostStatus);

export function resolveStatus(
  input: { status?: unknown; published?: unknown },
  current?: PostStatus
): { status: PostStatus; published: boolean } | null {
  if (isPostStatus(input.status)) return { status: input.status, published: input.status === "published" };
  if (typeof input.published === "boolean") {
    if (input.published) return { status: "published", published: true };
    return { status: current === "published" || current === "hidden" ? "hidden" : "draft", published: false };
  }
  return null;
}
