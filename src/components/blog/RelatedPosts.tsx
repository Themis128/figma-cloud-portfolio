"use client";

import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { trackGA4 } from "@/components/GoogleAnalytics";
import type { PostSummary } from "@/types/blog";

interface RelatedPostsProps {
  currentSlug: string;
  currentTags: readonly string[];
  posts: readonly PostSummary[];
}

export function RelatedPosts({
  currentSlug,
  currentTags,
  posts,
}: RelatedPostsProps) {
  // Score posts by shared tag count, exclude current
  const scored = posts
    .filter((p) => p.slugAsParams !== currentSlug)
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => currentTags.includes(t)).length,
    }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border/20">
      <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-cyan-400 mb-6">
        Related Articles
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map(({ post }) => (
          <Link
            key={post.slug}
            href={post.permalink as never}
            className="group rounded-lg border border-border/20 bg-foreground/5 backdrop-blur-sm p-4 hover:border-cyan-400/30 transition-all"
            onClick={() => trackGA4("select_content", { content_type: "related_post", item_id: post.slug })}
          >
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-muted/20 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-cyan-400 transition-colors leading-snug mb-2 line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-cyan-400/40" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400/40" />
                {post.readingTime} min
              </span>
              <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground/30 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
