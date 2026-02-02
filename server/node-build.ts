// @ts-check
/* eslint-env node */
/* global process, console */
/// <reference types="node" />

import path from 'node:path'
import express from 'express'
import { createServer, initializeSocketIO } from './index'

const DEFAULT_PORT = 3002 // Using 3002 to match CI configuration

const app = createServer()
const port = process.env.PORT || DEFAULT_PORT

// In production, serve the built SPA files
const __dirname = import.meta.dirname
const distPath = path.join(__dirname, '../dist/spa')

// Serve static files
app.use(express.static(distPath))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

// Handle React Router - serve index.html for all non-API routes
app.get(/^(?!\/api|\/health).*$/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

// Initialize Socket.IO
const _io = initializeSocketIO(server)
void _io // Mark as intentionally unused

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0)
})

process.on('SIGINT', () => {
  process.exit(0)
})
