"use client";

import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Search,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { PostSummary } from "@/types/blog";
import { BlogFilterBar } from "./BlogFilterBar";

interface BlogPostGridProps {
  posts: readonly PostSummary[];
  tags: readonly [string, number][];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogPostGrid({ posts, tags }: BlogPostGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      // Search filter
      if (searchQuery) {
        const haystack = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(searchQuery)) return false;
      }
      // Tag filter
      if (activeTags.size > 0) {
        if (!post.tags.some((t) => activeTags.has(t))) return false;
      }
      return true;
    });
  }, [posts, searchQuery, activeTags]);

  const latestPost = filtered[0];
  const remainingPosts = filtered.slice(1);
  const isFiltering = searchQuery.length > 0 || activeTags.size > 0;

  return (
    <div className="space-y-12">
      {/* Filter bar */}
      <BlogFilterBar
        tags={tags}
        onSearch={handleSearch}
        onTagToggle={handleTagToggle}
        activeTags={activeTags}
      />

      {/* Results count when filtering */}
      {isFiltering && (
        <p className="text-sm font-mono text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "article" : "articles"} found
        </p>
      )}

      {/* Featured / Latest Post */}
      {latestPost && !isFiltering && (
        <div>
          <div className="mb-4">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">
              Latest Post
            </span>
          </div>
          <Link href={latestPost.permalink as never} className="block group">
              <article className="relative rounded-xl border border-border bg-foreground/5 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-lg group-hover:shadow-cyan-500/10 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400/50 to-transparent" />
                <div className="p-6 md:p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {latestPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-mono text-cyan-400"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground group-hover:text-cyan-400 transition-colors leading-tight">
                        {latestPost.title}
                      </h2>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                        {latestPost.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-mono">
                          <Calendar className="h-4 w-4 text-cyan-400/60" />
                          {formatDate(latestPost.date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-mono">
                          <Clock className="h-4 w-4 text-cyan-400/60" />
                          {latestPost.readingTime} min read
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Read article
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-xl bg-cyan-400/5 border border-cyan-400/10 shrink-0 mt-2 group-hover:bg-cyan-400/10 transition-colors">
                      <FileText className="w-10 h-10 text-cyan-400/40 group-hover:text-cyan-400/70 transition-colors" />
                    </div>
                  </div>
                </div>
              </article>
          </Link>
        </div>
      )}

      {/* Post Grid */}
      {(isFiltering ? filtered : remainingPosts).length > 0 && (
        <div>
          {!isFiltering && remainingPosts.length > 0 && (
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">
                More Articles
              </span>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {(isFiltering ? filtered : remainingPosts).map((post) => (
              <Link
                key={post.slug}
                href={post.permalink as never}
                className="block group h-full"
              >
                  <article className="relative h-full rounded-xl border border-border bg-foreground/5 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-cyan-400/30 group-hover:shadow-lg group-hover:shadow-cyan-500/5 hover:scale-[1.02] flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-2.5 py-0.5 text-xs font-mono text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors mb-2 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border/20">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-cyan-400/50" />
                          {formatDate(post.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-400/50" />
                          {post.readingTime} min
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </article>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-400/10 rounded-full mb-6">
            <Search className="w-8 h-8 text-cyan-400/50" />
          </div>
          <p className="text-muted-foreground text-lg">
            No articles match your search.
          </p>
        </div>
      )}
    </div>
  );
}
