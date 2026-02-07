import type { LinkPreviewData, OpenGraphData, TwitterCardData } from '@shared/api'

const LINK_PREVIEW_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  VALIDATION_TIMEOUT_MS: 5000,
  MIN_IMAGE_SRC_LENGTH: 10,
} as const

const TIMEOUT = 10000 // 10 seconds
const CACHE_DURATION = LINK_PREVIEW_CONSTANTS.MILLISECONDS_PER_SECOND * 60 * 60 // 1 hour
const cache = new Map<string, { data: LinkPreviewData; timestamp: number }>()

/**
 * Service for generating link previews from URLs
 * Extracts metadata like title, description, images, and social media tags
 */

/**
 * Generate a complete link preview for a given URL
 */
export async function generatePreview(url: string): Promise<LinkPreviewData> {
  try {
    // Validate URL
    const validUrl = new URL(url)

    // Fetch the page content
    const response = await fetch(getProxyUrl(url), {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const metadata = extractMetadata(html, validUrl)

    return {
      url: validUrl.href,
      title: metadata.title || validUrl.hostname,
      description: metadata.description || '',
      image: metadata.image || null,
      favicon: metadata.favicon || getDefaultFavicon(validUrl),
      siteName: metadata.siteName || validUrl.hostname,
      type: metadata.type || 'website',
      openGraph: metadata.openGraph,
      twitter: metadata.twitter,
      lastFetched: new Date().toISOString(),
      error: null,
    }
  } catch (error) {
    // Return a basic preview for failed requests
    const fallbackUrl = new URL(url)
    return {
      url: fallbackUrl.href,
      title: fallbackUrl.hostname,
      description: 'Failed to load preview',
      image: null,
      favicon: getDefaultFavicon(fallbackUrl),
      siteName: fallbackUrl.hostname,
      type: 'website',
      openGraph: null,
      twitter: null,
      lastFetched: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Extract metadata from HTML content
 */
function extractMetadata(
  html: string,
  baseUrl: URL,
): {
  title: string | null
  description: string | null
  image: string | null
  favicon: string | null
  siteName: string | null
  type: string | null
  openGraph: OpenGraphData | null
  twitter: TwitterCardData | null
} {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract basic meta tags
  const getMetaContent = (name: string, property?: string): string | null => {
    const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
    const element = doc.querySelector(selector) as HTMLMetaElement
    return element?.content || null
  }

  // Extract Open Graph data
  const openGraph: OpenGraphData = {
    title: getMetaContent('', 'og:title'),
    description: getMetaContent('', 'og:description'),
    image: getMetaContent('', 'og:image'),
    url: getMetaContent('', 'og:url'),
    type: getMetaContent('', 'og:type'),
    siteName: getMetaContent('', 'og:site_name'),
  }

  // Extract Twitter Card data
  const twitter: TwitterCardData = {
    card: getMetaContent('', 'twitter:card'),
    title: getMetaContent('', 'twitter:title'),
    description: getMetaContent('', 'twitter:description'),
    image: getMetaContent('', 'twitter:image'),
    site: getMetaContent('', 'twitter:site'),
    creator: getMetaContent('', 'twitter:creator'),
  }

  // Extract basic metadata
  const title =
    doc.querySelector('title')?.textContent?.trim() || openGraph.title || twitter.title || null

  const description =
    getMetaContent('description') || openGraph.description || twitter.description || null

  // Find the best image
  const image = openGraph.image || twitter.image || findBestImage(doc, baseUrl) || null

  // Find favicon
  const favicon = findFavicon(doc, baseUrl)

  // Determine site name
  const siteName = openGraph.siteName || twitter.site || baseUrl.hostname || null

  // Determine content type
  const type = openGraph.type || 'website'

  return {
    title,
    description,
    image,
    favicon,
    siteName,
    type,
    openGraph: Object.values(openGraph).some((v) => v) ? openGraph : null,
    twitter: Object.values(twitter).some((v) => v) ? twitter : null,
  }
}

/**
 * Find the best image from the page content
 */
function findBestImage(doc: Document, baseUrl: URL): string | null {
  // Look for structured data images first
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]')
  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent || '')
      const image = extractImageFromJsonLd(data)
      if (image) return resolveUrl(image, baseUrl)
    } catch (_e) {
      // Ignore parsing errors
    }
  }

  // Look for meta images
  const metaImage = doc.querySelector('meta[name="image"]') as HTMLMetaElement
  if (metaImage?.content) {
    return resolveUrl(metaImage.content, baseUrl)
  }

  // Look for the first large image in the content
  const images = doc.querySelectorAll('img[src]')
  for (const img of images) {
    const src = img.getAttribute('src')
    if (src && !src.includes('icon') && !src.includes('logo') && src.length > 10) {
      return resolveUrl(src, baseUrl)
    }
  }

  return null
}

/**
 * Extract image from JSON-LD structured data
 */
function extractImageFromJsonLd(data: Record<string, unknown>): string | null {
  if (!data) return null

  // Handle arrays of objects
  if (Array.isArray(data)) {
    for (const item of data) {
      const image = extractImageFromJsonLd(item)
      if (image) return image
    }
    return null
  }

  // Direct image property
  if (typeof data.image === 'string') return data.image
  if (
    data.image &&
    typeof data.image === 'object' &&
    'url' in data.image &&
    typeof (data.image as Record<string, unknown>).url === 'string'
  ) {
    return (data.image as Record<string, unknown>).url as string
  }

  // Article or BlogPosting images
  if (data['@type'] === 'Article' || data['@type'] === 'BlogPosting') {
    return (
      (typeof data.image === 'string' ? data.image : null) ||
      (typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : null) ||
      null
    )
  }

  return null
}

/**
 * Find favicon from the page
 */
function findFavicon(doc: Document, baseUrl: URL): string | null {
  // Look for explicit favicon links
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
  ]

  for (const selector of faviconSelectors) {
    const link = doc.querySelector(selector) as HTMLLinkElement
    if (link?.href) {
      return resolveUrl(link.href, baseUrl)
    }
  }

  // Default favicon location
  return getDefaultFavicon(baseUrl)
}

/**
 * Get default favicon URL for a domain
 */
function getDefaultFavicon(url: URL): string {
  return `${url.protocol}//${url.hostname}/favicon.ico`
}

/**
 * Resolve a relative URL to an absolute URL
 */
function resolveUrl(url: string, baseUrl: URL): string {
  try {
    return new URL(url, baseUrl).href
  } catch {
    return url
  }
}

/**
 * Get proxy URL for CORS-enabled fetching
 * In production, this should use a proper proxy service
 */
function getProxyUrl(url: string): string {
  // For development, we'll use a CORS proxy
  // In production, implement a backend proxy or use a service like cors-anywhere
  if (import.meta.env.DEV) {
    return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  }
  return url
}

/**
 * Validate if a URL is accessible and returns valid content
 */
export async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(LINK_PREVIEW_CONSTANTS.VALIDATION_TIMEOUT_MS),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get cached preview
 */
export function getCachedPreview(url: string): LinkPreviewData | null {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  cache.delete(url)
  return null
}

/**
 * Set cached preview
 */
export function setCachedPreview(url: string, data: LinkPreviewData): void {
  cache.set(url, { data, timestamp: Date.now() })
}

/**
 * Generate preview with caching
 */
export async function generatePreviewCached(url: string): Promise<LinkPreviewData> {
  const cached = getCachedPreview(url)
  if (cached) {
    return cached
  }

  const preview = await generatePreview(url)
  setCachedPreview(url, preview)
  return preview
}

export default {
  generatePreview,
  generatePreviewCached,
  validateUrl,
  getCachedPreview,
  setCachedPreview,
}
