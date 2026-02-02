import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SitemapGenerator } from '../client/lib/sitemap'

// Test constants for sitemap priorities
const HOME_PRIORITY = 1.0
const ABOUT_PRIORITY = 0.8
const PROJECT_PRIORITY = 0.7

// Mock window for tests
const mockWindow = {
  location: {
    origin: 'https://test.com',
  },
  document: {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
}

Object.defineProperty(window, 'location', { value: mockWindow.location })
Object.defineProperty(window, 'document', { value: mockWindow.document })

// Mock URL and Blob
global.URL = {
  createObjectURL: vi.fn(() => 'blob:test'),
  revokeObjectURL: vi.fn(),
} as unknown as typeof URL

global.Blob = vi.fn(
  class MockBlob {
    constructor(
      content: string | Blob | ArrayBufferLike | ArrayLike<number> | null,
      options?: BlobPropertyBag,
    ) {
      return {
        content,
        options,
      }
    }
  },
) as typeof Blob

describe('SitemapGenerator', () => {
  let generator: SitemapGenerator

  beforeEach(() => {
    vi.clearAllMocks()
    generator = new SitemapGenerator('https://test.com')
  })

  describe('constructor', () => {
    it('should use provided baseURL', () => {
      const customGenerator = new SitemapGenerator('https://custom.com')
      expect(customGenerator.baseUrl).toBe('https://custom.com')
    })

    it('should use window.location.origin when no baseURL provided', () => {
      const defaultGenerator = new SitemapGenerator()
      expect(defaultGenerator.baseUrl).toBe('https://test.com')
    })

    it('should fallback to default URL when window is undefined', () => {
      // Temporarily remove window
      const originalWindow = global.window
      delete (global as { window?: typeof window }).window

      const fallbackGenerator = new SitemapGenerator()
      expect(fallbackGenerator.baseUrl).toBe('https://www.baltzakisthemis.com')

      // Restore window
      global.window = originalWindow
    })
  })

  describe('generateSitemapEntries', () => {
    it('should generate entries for static pages', () => {
      const entries = generator.generateSitemapEntries()

      const homeEntry = entries.find((entry) => entry.url === 'https://test.com/')
      expect(homeEntry).toBeDefined()
      expect(homeEntry?.priority).toBe(HOME_PRIORITY)
      expect(homeEntry?.changeFrequency).toBe('weekly')

      const aboutEntry = entries.find((entry) => entry.url === 'https://test.com/about')
      expect(aboutEntry).toBeDefined()
      expect(aboutEntry?.priority).toBe(ABOUT_PRIORITY)
    })

    it('should generate entries for project pages', () => {
      const entries = generator.generateSitemapEntries()

      const projectEntries = entries.filter((entry) => entry.url.includes('/projects/'))
      expect(projectEntries.length).toBeGreaterThan(0)

      projectEntries.forEach((entry) => {
        expect(entry.changeFrequency).toBe('monthly')
        expect(entry.priority).toBe(PROJECT_PRIORITY)
        expect(entry.url).toMatch(/^https:\/\/test\.com\/projects\/[a-z0-9-]+$/)
      })
    })

    it('should include all expected pages', () => {
      const entries = generator.generateSitemapEntries()

      const expectedUrls = [
        'https://test.com/',
        'https://test.com/about',
        'https://test.com/projects',
        'https://test.com/resume',
        'https://test.com/contact',
        'https://test.com/performance',
        'https://test.com/settings',
        'https://test.com/agents',
      ]

      expectedUrls.forEach((url) => {
        expect(entries.some((entry) => entry.url === url)).toBe(true)
      })
    })
  })

  describe('generateXMLSitemap', () => {
    it('should generate valid XML sitemap', () => {
      const xml = generator.generateXMLSitemap()

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(xml).toContain('</urlset>')

      // Should contain URLs
      expect(xml).toContain('<loc>https://test.com/</loc>')
      expect(xml).toContain('<priority>1.0</priority>')
      expect(xml).toContain('<changefreq>weekly</changefreq>')
    })

    it('should include all sitemap entries', () => {
      const xml = generator.generateXMLSitemap()
      const entries = generator.generateSitemapEntries()

      entries.forEach((entry) => {
        expect(xml).toContain(`<loc>${entry.url}</loc>`)
        expect(xml).toContain(`<priority>${entry.priority.toFixed(1)}</priority>`)
        expect(xml).toContain(`<changefreq>${entry.changeFrequency}</changefreq>`)
      })
    })
  })

  describe('generateRobotsTxt', () => {
    it('should generate valid robots.txt', () => {
      const robotsTxt = generator.generateRobotsTxt()

      expect(robotsTxt).toContain('User-agent: *')
      expect(robotsTxt).toContain('Allow: /')
      expect(robotsTxt).toContain('Sitemap: https://test.com/sitemap.xml')
      expect(robotsTxt).toContain('Crawl-delay: 1')

      // Should disallow certain paths
      expect(robotsTxt).toContain('Disallow: /admin/')
      expect(robotsTxt).toContain('Disallow: /api/')

      // Should allow specific pages
      expect(robotsTxt).toContain('Allow: /$')
      expect(robotsTxt).toContain('Allow: /about')
    })

    it('should include project pages in allow list', () => {
      const robotsTxt = generator.generateRobotsTxt()

      expect(robotsTxt).toContain('Allow: /projects/ecommerce-dashboard')
      expect(robotsTxt).toContain('Allow: /projects/ai-content-generator')
    })
  })

  describe('generateRSSFeed', () => {
    it('should generate valid RSS feed', () => {
      const rss = generator.generateRSSFeed()

      expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(rss).toContain('<rss version="2.0"')
      expect(rss).toContain('<title>Themistoklis Baltzakis - Projects</title>')
      expect(rss).toContain('<description>Latest projects')
      expect(rss).toContain('</rss>')
    })

    it('should include all projects as RSS items', () => {
      const rss = generator.generateRSSFeed()

      expect(rss).toContain('<title>E-Commerce Dashboard</title>')
      expect(rss).toContain('<title>AI Content Generator</title>')
      expect(rss).toContain('<category>Projects</category>')
      expect(rss).toContain('<link>https://test.com/projects/ecommerce-dashboard</link>')
    })

    it('should escape XML special characters', () => {
      const rss = generator.generateRSSFeed()

      // Should not contain unescaped < > & characters in content
      expect(rss).not.toMatch(/<[^>]*<[^>]*>/) // No nested tags
    })
  })

  describe('generateRobotsMetaTags', () => {
    it('should return appropriate robots content for different page types', () => {
      expect(generator.generateRobotsMetaTags('home')).toBe(
        'index, follow, max-image-preview:large',
      )
      expect(generator.generateRobotsMetaTags('about')).toBe(
        'index, follow, max-snippet:-1, max-image-preview:large',
      )
      expect(generator.generateRobotsMetaTags('projects')).toBe(
        'index, follow, max-snippet:-1, max-image-preview:large',
      )
      expect(generator.generateRobotsMetaTags('resume')).toBe('index, follow, max-snippet:-1')
    })
  })

  describe('generateCanonicalURL', () => {
    it('should generate canonical URLs', () => {
      expect(generator.generateCanonicalURL('/')).toBe('https://test.com/')
      expect(generator.generateCanonicalURL('/about')).toBe('https://test.com/about')
      expect(generator.generateCanonicalURL('/projects/')).toBe('https://test.com/projects')
    })

    it('should handle trailing slashes', () => {
      expect(generator.generateCanonicalURL('/about/')).toBe('https://test.com/about')
      expect(generator.generateCanonicalURL('/projects/test/')).toBe(
        'https://test.com/projects/test',
      )
    })
  })

  describe('escapeXml', () => {
    it('should escape XML special characters', () => {
      const generator = new SitemapGenerator()
      const method = (
        generator as unknown as { escapeXml: (str: string) => string }
      ).escapeXml.bind(generator)

      expect(method('<test & "quotes">')).toBe('&lt;test &amp; &quot;quotes&quot;&gt;')
      expect(method('normal text')).toBe('normal text')
    })
  })

  describe('download methods', () => {
    it('should create download links for sitemap', () => {
      generator.downloadSitemap()

      expect(mockWindow.document.createElement).toHaveBeenCalledWith('a')
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should create download links for robots.txt', () => {
      generator.downloadRobotsTxt()

      expect(mockWindow.document.createElement).toHaveBeenCalledWith('a')
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('submitToSearchEngines', () => {
    it('should log submission URLs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      generator.submitToSearchEngines()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Submit to Google:',
        expect.stringContaining('www.google.com/webmasters'),
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        'Submit to Bing:',
        expect.stringContaining('www.bing.com/webmaster'),
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        'Submit to Yandex:',
        expect.stringContaining('webmaster.yandex.com'),
      )

      consoleSpy.mockRestore()
    })
  })
})
