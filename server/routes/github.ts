// GitHub API routes — fetches real data from GitHub public API
import { Router, Request, Response } from "express";

const router = Router();

const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? "Themis128";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-backend",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

// GET /api/github/stats — public profile stats
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      { headers: githubHeaders() },
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `GitHub API error: ${response.statusText}` });
    }

    const user = (await response.json()) as {
      public_repos: number;
      followers: number;
      following: number;
      public_gists: number;
      name: string | null;
      bio: string | null;
      avatar_url: string;
      html_url: string;
    };

    // Fetch starred count (separate endpoint)
    let stars = 0;
    try {
      const reposRes = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
        { headers: githubHeaders() },
      );
      if (reposRes.ok) {
        const repos = (await reposRes.json()) as Array<{
          stargazers_count: number;
        }>;
        stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      }
    } catch {
      // stars stays 0
    }

    return res.json({
      stars,
      repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      gists: user.public_gists,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar_url,
      profile: user.html_url,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch GitHub stats: ${msg}` });
  }
});

// GET /api/github/repos — public repositories
router.get("/repos", async (req: Request, res: Response) => {
  try {
    const page = req.query.page ?? "1";
    const limit = req.query.limit ?? "10";

    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=${limit}&page=${page}&sort=updated`,
      { headers: githubHeaders() },
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `GitHub API error: ${response.statusText}` });
    }

    const repos = (await response.json()) as Array<{
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      html_url: string;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      updated_at: string;
      topics: string[];
    }>;

    return res.json(
      repos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        updatedAt: r.updated_at,
        topics: r.topics,
      })),
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch repos: ${msg}` });
  }
});

export default router;
