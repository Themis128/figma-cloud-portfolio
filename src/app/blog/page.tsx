import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { posts } from "#site/content";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BlogPostGrid } from "@/components/blog/BlogPostGrid";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import type { PostSummary } from "@/types/blog";

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
        alt: "Themistoklis Baltzakis | Blog",
      },
    ],
  },
  alternates: {
    canonical: `${SITE_URL}/blog/`,
  },
};

function getPublishedPosts(): PostSummary[] {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({
      title: post.title,
      slug: post.slug,
      slugAsParams: post.slugAsParams,
      description: post.description,
      date: post.date,
      tags: post.tags,
      permalink: post.permalink,
      readingTime: post.readingTime,
      author: post.author,
      ...(post.image !== undefined && { image: post.image }),
    }));
}

function getAllTags(publishedPosts: readonly PostSummary[]): [string, number][] {
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

export default function BlogPage() {
  const publishedPosts = getPublishedPosts();
  const allTags = getAllTags(publishedPosts);

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
                development, from the trenches of enterprise infrastructure.
              </p>
            </AnimatedSection>
          </div>

          <div className="max-w-6xl mx-auto">
            <AnimatedSection delay={0.1}>
              <BlogPostGrid posts={publishedPosts} tags={allTags} />
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
}
