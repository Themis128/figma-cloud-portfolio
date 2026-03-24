import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Rss,
  Tag,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "#site/content";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import { HoverCard } from "@/components/HoverAnimations";
import Navigation from "@/components/Navigation";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on cloud architecture, cybersecurity, web development, and infrastructure by Themistoklis Baltzakis.",
  openGraph: {
    title: "Blog | Themistoklis Baltzakis",
    description:
      "Articles on cloud architecture, cybersecurity, web development, and infrastructure.",
    url: `${SITE_URL}/blog/`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Themistoklis Baltzakis — Blog",
      },
    ],
  },
  alternates: {
    canonical: `${SITE_URL}/blog/`,
  },
};

function getPublishedPosts() {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getAllTags(publishedPosts: typeof posts) {
  const tagCount = new Map<string, number>();
  for (const post of publishedPosts) {
    for (const tag of post.tags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(tagCount.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogPage() {
  const publishedPosts = getPublishedPosts();
  const allTags = getAllTags(publishedPosts);
  const latestPost = publishedPosts[0];
  const remainingPosts = publishedPosts.slice(1);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog/` },
        ]}
      />
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-20">
            <div className="space-y-3 md:space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 text-sm font-mono text-cyan-400 mb-4">
                  <Rss className="h-3.5 w-3.5" />
                  {publishedPosts.length} Articles Published
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-wider">
                  Blog
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
            </div>
            <AnimatedSection delay={0.2}>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                Insights on cloud architecture, cybersecurity, and modern web
                development — from the trenches of enterprise infrastructure.
              </p>
            </AnimatedSection>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Featured / Latest Post */}
            {latestPost && (
              <AnimatedSection delay={0.1}>
                <div className="mb-4">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">
                    Latest Post
                  </span>
                </div>
                <Link
                  href={latestPost.permalink as never}
                  className="block group"
                >
                  <HoverCard>
                    <article className="relative rounded-xl border border-border bg-foreground/5 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-lg group-hover:shadow-cyan-500/10">
                      {/* Accent top border */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400/50 to-transparent" />

                      <div className="p-6 md:p-8 lg:p-10">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
                          {/* Content */}
                          <div className="flex-1 space-y-4">
                            {/* Tags */}
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

                            {/* Title */}
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground group-hover:text-cyan-400 transition-colors leading-tight">
                              {latestPost.title}
                            </h2>

                            {/* Description */}
                            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                              {latestPost.description}
                            </p>

                            {/* Meta row */}
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

                          {/* Decorative icon */}
                          <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-xl bg-cyan-400/5 border border-cyan-400/10 shrink-0 mt-2 group-hover:bg-cyan-400/10 transition-colors">
                            <FileText className="w-10 h-10 text-cyan-400/40 group-hover:text-cyan-400/70 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </HoverCard>
                </Link>
              </AnimatedSection>
            )}

            {/* Remaining Posts Grid */}
            {remainingPosts.length > 0 && (
              <AnimatedSection delay={0.2}>
                <div className="mb-6">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">
                    More Articles
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {remainingPosts.map((post, index) => (
                    <AnimatedSection key={post.slug} delay={0.15 + index * 0.05}>
                      <Link
                        href={post.permalink as never}
                        className="block group h-full"
                      >
                        <HoverCard className="h-full">
                          <article className="relative h-full rounded-xl border border-border bg-foreground/5 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-cyan-400/30 group-hover:shadow-lg group-hover:shadow-cyan-500/5 flex flex-col">
                            {/* Tags */}
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

                            {/* Title */}
                            <h2 className="text-lg md:text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors mb-2 leading-snug">
                              {post.title}
                            </h2>

                            {/* Description */}
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                              {post.description}
                            </p>

                            {/* Meta */}
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
                        </HoverCard>
                      </Link>
                    </AnimatedSection>
                  ))}
                </div>
              </AnimatedSection>
            )}

            {/* Tags Section */}
            {allTags.length > 0 && (
              <AnimatedSection delay={0.3}>
                <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-cyan-400/10 rounded-lg">
                      <Tag className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Topics
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(([tag, count]) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/5 hover:border-cyan-400/30 hover:bg-cyan-400/5 px-4 py-2 text-sm transition-all duration-200 cursor-default"
                      >
                        <span className="text-foreground/80">{tag}</span>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-mono">
                          {count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Empty state */}
            {publishedPosts.length === 0 && (
              <AnimatedSection>
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-400/10 rounded-full mb-6">
                    <FileText className="w-8 h-8 text-cyan-400/50" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    No posts published yet. Check back soon!
                  </p>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
