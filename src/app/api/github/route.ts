import { type NextRequest, NextResponse } from "next/server";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_USERNAME = "Themis128";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>();

async function fetchGitHub(path: string): Promise<unknown> {
  const cached = cache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-nextjs",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${path}`, { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: unknown = await response.json();
  cache.set(path, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") ?? "user";

  try {
    let data: unknown;

    switch (resource) {
      case "user":
        data = await fetchGitHub(`/users/${GITHUB_USERNAME}`);
        break;
      case "repos":
        data = await fetchGitHub(
          `/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20&type=public`,
        );
        break;
      default:
        return NextResponse.json(
          { error: "Unknown resource." },
          { status: 400 },
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[github] Error fetching GitHub data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data." },
      { status: 502 },
    );
  }
}
