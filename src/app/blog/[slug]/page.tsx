import { ArrowLeft, Calendar, ChevronRight, Clock, Tag, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import dynamic from "next/dynamic";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { SocialShare } from "@/components/blog/SocialShare";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import { MdxContent } from "@/components/MdxContent";
import Navigation from "@/components/Navigation";

const ReadingProgress = dynamic(
  () => import("@/components/interactive/ReadingProgress"),
  { ssr: false },
);
const BlogReactions = dynamic(
  () => import("@/components/interactive/BlogReactions"),
  { ssr: false },
);
import type { PostSummary } from "@/types/blog";

const SITE_URL = "https://www.baltzakisthemis.com";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function getPostBySlug(slug: string) {
  return posts.find((post) => post.slugAsParams === slug && post.published);
}

function getAdjacentPosts(currentSlug: string) {
  const published = posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const index = published.findIndex((p) => p.slugAsParams === currentSlug);
  return {
    newer: index > 0 ? published[index - 1] : undefined,
    older: index < published.length - 1 ? published[index + 1] : undefined,
  };
}

function getAllPostSummaries(): PostSummary[] {
  return posts
    .filter((p) => p.published)
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      slugAsParams: p.slugAsParams,
      description: p.description,
      date: p.date,
      tags: p.tags,
      permalink: p.permalink,
      readingTime: p.readingTime,
      author: p.author,
      ...(p.image !== undefined && { image: p.image }),
    }));
}

export function generateStaticParams() {
  return posts
    .filter((post) => post.published)
    .map((post) => ({
      slug: post.slugAsParams,
    }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}${post.permalink}`,
      type: "article",
      publishedTime: post.date,
      ...(post.updated !== undefined && { modifiedTime: post.updated }),
      authors: [post.author],
      tags: post.tags,
    },
    alternates: {
      canonical: `${SITE_URL}${post.permalink}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { newer, older } = getAdjacentPosts(slug);
  const allSummaries = getAllPostSummaries();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.updated !== undefined && { dateModified: post.updated }),
    author: {
      "@type": "Person",
      name: post.author,
      url: SITE_URL,
    },
    url: `${SITE_URL}${post.permalink}`,
    keywords: post.tags.join(", "),
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog/` },
          { name: post.title, url: `${SITE_URL}${post.permalink}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <CircuitBackground />
      <Navigation />
      <ReadingProgress />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Two-column layout: article + TOC sidebar */}
          <div className="max-w-6xl mx-auto flex gap-10">
            {/* Article column */}
            <article className="max-w-3xl mx-auto xl:mx-0 flex-1 min-w-0">
              {/* Breadcrumb nav */}
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground font-mono mb-8">
                <Link
                  href="/blog/"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Blog
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground/60 truncate max-w-50 sm:max-w-xs">
                  {post.title}
                </span>
              </nav>

              {/* Header */}
              <header className="mb-10">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {post.tags.map((tag) => (
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
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                    {post.title}
                  </h1>

                  {/* Description */}
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                    {post.description}
                  </p>

                  {/* Author & Meta Card + Share */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono rounded-lg border border-border/20 bg-foreground/5 px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-4 w-4 text-cyan-400/60" />
                        {post.author}
                      </span>
                      <span className="hidden sm:inline text-border/40">|</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-cyan-400/60" />
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="hidden sm:inline text-border/40">|</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-cyan-400/60" />
                        {post.readingTime} min read
                      </span>
                    </div>
                    <SocialShare
                      title={post.title}
                      url={`${SITE_URL}${post.permalink}`}
                    />
                  </div>

                  {/* Divider */}
                  <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full" />
                </header>

              {/* Content */}
              <MdxContent code={post.body} />

              {/* Author Bio */}
              <AuthorBio />

              {/* Reactions */}
              <BlogReactions slug={post.slugAsParams} />

              {/* Related Posts */}
              <RelatedPosts
                currentSlug={post.slugAsParams}
                currentTags={post.tags}
                posts={allSummaries}
              />

              {/* Post Navigation */}
              <footer className="mt-16 pt-8 border-t border-border/20 space-y-6">
                  {(newer ?? older) && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {older && (
                        <Link
                          href={older.permalink as never}
                          className="group rounded-lg border border-border/20 bg-foreground/5 p-4 hover:border-cyan-400/30 transition-all"
                        >
                          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            <ArrowLeft className="inline h-3 w-3 mr-1" />
                            Older
                          </span>
                          <p className="text-sm text-foreground group-hover:text-cyan-400 transition-colors mt-1 line-clamp-1 font-medium">
                            {older.title}
                          </p>
                        </Link>
                      )}
                      {newer && (
                        <Link
                          href={newer.permalink as never}
                          className="group rounded-lg border border-border/20 bg-foreground/5 p-4 hover:border-cyan-400/30 transition-all sm:text-right sm:col-start-2"
                        >
                          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            Newer
                            <ChevronRight className="inline h-3 w-3 ml-1" />
                          </span>
                          <p className="text-sm text-foreground group-hover:text-cyan-400 transition-colors mt-1 line-clamp-1 font-medium">
                            {newer.title}
                          </p>
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="text-center">
                    <Link
                      href="/blog/"
                      className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to all posts
                    </Link>
                  </div>
                </footer>
            </article>

            {/* TOC sidebar (desktop only) */}
            <aside className="hidden xl:block w-56 shrink-0">
              <TableOfContents />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
