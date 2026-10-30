// 소개 화면 체스 레이팅. Chess.com 공개 API를 6시간마다 다시 읽는다.
export const CHESS_USERNAME = "gatslee";

export async function getRapidRating(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.chess.com/pub/player/${CHESS_USERNAME}/stats`, {
      next: { revalidate: 60 * 60 * 6 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rating = data?.chess_rapid?.last?.rating;
    return typeof rating === "number" ? rating : null;
  } catch {
    // 실패하면 화면에서 "—"와 안내 문구를 보여준다 (IA_AB_00101)
    return null;
  }
}
