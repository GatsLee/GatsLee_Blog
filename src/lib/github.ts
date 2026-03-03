export interface GitCommit {
  sha: string;     // short (7 chars)
  message: string; // first line only
  date: string;    // ISO string
  url: string;     // link to commit on GitHub
  author: string;
}

export async function fetchRecentCommits(repo: string, limit = 10): Promise<GitCommit[]> {
  if (!repo) return [];
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=${limit}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data as Record<string, unknown>[]).map((c) => {
      const commit = c.commit as Record<string, unknown>;
      const commitAuthor = commit.author as Record<string, unknown>;
      const topAuthor = c.author as Record<string, unknown> | null;
      return {
        sha: (c.sha as string).slice(0, 7),
        message: (commit.message as string).split("\n")[0],
        date: commitAuthor.date as string,
        url: `https://github.com/${repo}/commit/${c.sha}`,
        author: topAuthor?.login as string ?? (commitAuthor.name as string),
      };
    });
  } catch {
    return [];
  }
}
