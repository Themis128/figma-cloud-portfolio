import type { RequestHandler } from 'express'
import fetch from 'node-fetch'
import { logger } from '../logger'

// Simple in-memory LRU cache and rate limiter for proxy endpoints
const CACHE_TTL_SECONDS = parseInt(process.env['GITHUB_CACHE_TTL_SECONDS'] || '15', 10)
const MAX_CACHE_ENTRIES = parseInt(process.env['GITHUB_CACHE_MAX_ENTRIES'] || '200', 10)
const cache = new Map<string, { ts: number; status: number; body: unknown }>()

// Metrics
const metrics = {
  requests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cacheSets: 0,
  cacheEvictions: 0,
  rateLimited: 0,
}

const HTTP_STATUS_TOO_MANY = 429
const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_INTERNAL = 500

// Rate limiting constants
const DEFAULT_RATE_LIMIT_WINDOW_MINUTES = 60
const MILLISECONDS_PER_SECOND = 1000
const MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND

const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env['GITHUB_RATE_LIMIT_WINDOW_MS'] ||
    String(DEFAULT_RATE_LIMIT_WINDOW_MINUTES * MILLISECONDS_PER_MINUTE),
  10,
)
const RATE_LIMIT_MAX = parseInt(process.env['GITHUB_RATE_LIMIT_MAX'] || '120', 10) // requests per window per IP
const rateMap = new Map<string, { windowStart: number; count: number }>()

function isRateLimited(ip?: string) {
  const key = ip || 'unknown'
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(key, { windowStart: now, count: 1 })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count += 1
  return false
}

function getCached(key: string) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_SECONDS * MILLISECONDS_PER_SECOND) {
    cache.delete(key)
    logger.info('github-proxy', `cache-expired: ${key}`)
    metrics.cacheMisses += 1
    return null
  }
  // Promote entry to most-recent (LRU)
  cache.delete(key)
  cache.set(key, entry)
  logger.info('github-proxy', `cache-hit: ${key}`)
  metrics.cacheHits += 1
  return entry
}

function setCached(key: string, status: number, body: unknown) {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, { ts: Date.now(), status, body })
  // Evict oldest if above max entries
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string
    cache.delete(oldestKey)
    logger.info('github-proxy', `cache-evict: ${oldestKey}`)
    metrics.cacheEvictions += 1
  }
  logger.info('github-proxy', `cache-set: ${key}`)
  metrics.cacheSets += 1
}

// Helper to call GitHub API with server-side token if available
async function callGitHubApi(path: string, token?: string) {
  const url = `https://api.github.com${path}`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Deployment-Monitor-Proxy',
  }

  const serverToken = process.env['VITE_GITHUB_TOKEN']
  if (serverToken) {
    headers.Authorization = `token ${serverToken}`
  } else if (token) {
    headers.Authorization = `token ${token}`
  }

  const resp = await fetch(url, { headers })
  const text = await resp.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch (_e) {
    // return raw text if not JSON
    json = { raw: text }
  }
  return { status: resp.status, body: json }
}

export const handleGetWorkflows: RequestHandler = async (req, res) => {
  try {
    metrics.requests += 1
    // Rate limit per IP
    const ipRaw = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const ip = String(ipRaw)
    if (isRateLimited(ip)) {
      metrics.rateLimited += 1
      return res.status(HTTP_STATUS_TOO_MANY).json({ error: 'Too many requests' })
    }

    // Cache key (only safe to cache when server token is present)
    const cacheKey = `/workflows?owner=${req.query.owner || 'Themis128'}&repo=${req.query.repo || 'figma-cloud-portfolio'}`
    const serverTokenPresent = Boolean(process.env['VITE_GITHUB_TOKEN'])
    if (serverTokenPresent) {
      const cached = getCached(cacheKey)
      if (cached) return res.status(cached.status).json(cached.body)
    }
    const owner = req.query.owner || 'Themis128'
    const repo = req.query.repo || 'figma-cloud-portfolio'
    const token =
      typeof req.headers.authorization === 'string'
        ? req.headers.authorization.replace(/^token\s+/i, '')
        : undefined

    const path = `/repos/${owner}/${repo}/actions/workflows`
    const result = await callGitHubApi(path, token)
    if (serverTokenPresent) setCached(cacheKey, result.status, result.body)
    res.setHeader('X-GitHub-Proxy-Cache-Hits', String(metrics.cacheHits))
    res.setHeader('X-GitHub-Proxy-Cache-Misses', String(metrics.cacheMisses))
    return res.status(result.status).json(result.body)
  } catch (error: unknown) {
    return res.status(HTTP_STATUS_INTERNAL).json({ error: (error as Error).message })
  }
}

export const handleGetWorkflowRuns: RequestHandler = async (req, res) => {
  try {
    metrics.requests += 1
    const ipRaw = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const ip = String(ipRaw)
    if (isRateLimited(ip)) {
      metrics.rateLimited += 1
      return res.status(HTTP_STATUS_TOO_MANY).json({ error: 'Too many requests' })
    }
    const owner = req.query.owner || 'Themis128'
    const repo = req.query.repo || 'figma-cloud-portfolio'
    const workflowId = req.params.workflowIdentifier || req.query.workflow_id
    if (!workflowId) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'Missing workflow identifier' })
    }

    const token =
      typeof req.headers.authorization === 'string'
        ? req.headers.authorization.replace(/^token\s+/i, '')
        : undefined

    const perPage = req.query.per_page || '1'
    const cacheKey = `/workflows/${workflowId}/runs?owner=${owner}&repo=${repo}&per_page=${perPage}`
    const serverTokenPresent = Boolean(process.env['VITE_GITHUB_TOKEN'])
    if (serverTokenPresent) {
      const cached = getCached(cacheKey)
      if (cached) return res.status(cached.status).json(cached.body)
    }

    const path = `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=${perPage}`
    const result = await callGitHubApi(path, token)
    if (serverTokenPresent) setCached(cacheKey, result.status, result.body)
    return res.status(result.status).json(result.body)
  } catch (error: unknown) {
    return res.status(HTTP_STATUS_INTERNAL).json({ error: (error as Error).message })
  }
}

export const handleGetRunJobs: RequestHandler = async (req, res) => {
  try {
    metrics.requests += 1
    const ipRaw = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    const ip = String(ipRaw)
    if (isRateLimited(ip)) {
      metrics.rateLimited += 1
      return res.status(HTTP_STATUS_TOO_MANY).json({ error: 'Too many requests' })
    }
    const owner = req.query.owner || 'Themis128'
    const repo = req.query.repo || 'figma-cloud-portfolio'
    const runId = req.params.runId || req.query.run_id
    if (!runId) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'Missing run id' })
    }

    const token =
      typeof req.headers.authorization === 'string'
        ? req.headers.authorization.replace(/^token\s+/i, '')
        : undefined

    const cacheKey = `/runs/${runId}/jobs?owner=${owner}&repo=${repo}`
    const serverTokenPresent = Boolean(process.env['VITE_GITHUB_TOKEN'])
    if (serverTokenPresent) {
      const cached = getCached(cacheKey)
      if (cached) return res.status(cached.status).json(cached.body)
    }

    const path = `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`
    const result = await callGitHubApi(path, token)
    if (serverTokenPresent) setCached(cacheKey, result.status, result.body)
    // Return result and metrics in header (lightweight)
    res.setHeader('X-GitHub-Proxy-Cache-Hits', String(metrics.cacheHits))
    res.setHeader('X-GitHub-Proxy-Cache-Misses', String(metrics.cacheMisses))
    return res.status(result.status).json(result.body)
  } catch (error: unknown) {
    return res.status(HTTP_STATUS_INTERNAL).json({ error: (error as Error).message })
  }
}

export const handleValidateToken: RequestHandler = async (req, res) => {
  try {
    metrics.requests += 1
    const token = (req.body && (req.body as Record<string, unknown>).token) || req.query.token
    if (!token || typeof token !== 'string') {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'Missing token' })
    }

    // Do NOT cache validation results and do not rate-limit validation here
    const result = await callGitHubApi('/user', token as string)
    return res.status(result.status).json(result.body)
  } catch (error: unknown) {
    return res.status(HTTP_STATUS_INTERNAL).json({ error: (error as Error).message })
  }
}

// Metrics endpoint for lightweight observability
export const handleGetMetrics: RequestHandler = async (_req, res) => {
  try {
    // Return a shallow copy to avoid accidental mutation
    return res.json({ ...metrics })
  } catch (err: unknown) {
    logger.error('github-proxy', `metrics-error: ${(err as Error).message}`)
    return res.status(HTTP_STATUS_INTERNAL).json({ error: 'Failed to read metrics' })
  }
}
