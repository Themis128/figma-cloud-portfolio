import { createServer, initializeSocketIO } from './index'

const app = createServer()
const port = process.env.PORT || 0

console.log('Starting server...')
console.log(`Attempting to listen on port ${port}...`)

const server = app.listen(port, () => {
  console.log(`🚀 Baltzakis Themistoklis API server running on port ${port}`)
  console.log(`🔧 API: http://localhost:${port}/api`)
  const addr = server.address()
  console.log(`Server address details:`, JSON.stringify(addr, null, 2))
})

// Initialize Socket.IO
const io = initializeSocketIO(server)
console.log('🔌 WebSocket server initialized')

server.on('error', (err) => {
  console.error('Server error:', err)
})

server.on('listening', () => {
  console.log('Server is now listening!')
})

console.log('Server setup complete, waiting for connections...')

// Keep the process alive
setInterval(() => {
  console.log('Server still running...')
}, 10000)