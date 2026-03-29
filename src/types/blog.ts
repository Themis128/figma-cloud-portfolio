/** Lightweight post data for client components (excludes compiled MDX body) */
export interface PostSummary {
  readonly title: string;
  readonly slug: string;
  readonly slugAsParams: string;
  readonly description: string;
  readonly date: string;
  readonly tags: readonly string[];
  readonly permalink: string;
  readonly readingTime: number;
  readonly author: string;
  readonly image?: string;
}
