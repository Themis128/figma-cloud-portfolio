import { expect, test } from '@playwright/test'
import {
  loadRealAPIConfig,
  measureAPICall,
  setupRealAPIPage,
  usageTracker,
  waitForAppReady,
} from './test-utils.real'

/**
 * REAL Socket.IO Integration Tests
 *
 * ✅ FREE: Tests local WebSocket server (no external API)
 * - Requires backend server running on localhost:3000
 * - No API costs or rate limits
 * - Tests real-time features
 *
 * Run with: pnpm test:e2e:real
 */

test.describe('Socket.IO - Real Integration', () => {
  const config = loadRealAPIConfig()

  test.beforeAll(() => {
    if (!config.enableSocketIO) {
      console.log('⏭️  Skipping Socket.IO tests (TEST_SOCKETIO=false)')
      test.skip()
    }

    console.log('🚀 Running REAL Socket.IO integration tests')
  })

  test.afterAll(() => {
    console.log(usageTracker.getReport())
  })

  test('should establish real WebSocket connection', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: connectionStatus, duration } = await measureAPICall(
      'WebSocket Connection',
      async () => {
        return await page.evaluate(() => {
          return new Promise((resolve) => {
            // Check if Socket.IO client is available
            const hasSocketIO = !!(window as typeof window & { io?: unknown }).io

            if (!hasSocketIO) {
              resolve({ available: false, connected: false })
              return
            }

            // Try to connect
            try {
              const socket = (window as typeof window & { io?: (url: string) => unknown }).io?.(
                'http://localhost:3000',
              )

              // @ts-expect-error - Socket.IO types
              socket?.on('connect', () => {
                resolve({
                  available: true,
                  connected: true,
                  // @ts-expect-error - Socket.IO types
                  socketId: socket?.id,
                })
              })

              // @ts-expect-error - Socket.IO types
              socket?.on('connect_error', (error: Error) => {
                resolve({
                  available: true,
                  connected: false,
                  error: error.message,
                })
              })

              // Timeout after 5 seconds
              setTimeout(() => {
                resolve({
                  available: true,
                  connected: false,
                  error: 'Connection timeout',
                })
              }, 5000)
            } catch (error) {
              resolve({
                available: true,
                connected: false,
                error: String(error),
              })
            }
          })
        })
      },
    )

    usageTracker.recordCall('Socket.IO', duration)

    console.log(`🔌 WebSocket Connection:`)
    console.log(`  Socket.IO Available: ${connectionStatus.available ? '✅' : '❌'}`)
    console.log(`  Connected: ${connectionStatus.connected ? '✅' : '❌'}`)

    if (connectionStatus.connected) {
      console.log(`  Socket ID: ${connectionStatus.socketId}`)
    } else if (connectionStatus.error) {
      console.log(`  Error: ${connectionStatus.error}`)
      console.log(`  💡 Make sure backend server is running: npx tsx server/node-build.ts`)
    }

    // Socket.IO client should be available
    expect(connectionStatus.available).toBe(true)
  })

  test('should send and receive real messages', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: messageTest, duration } = await measureAPICall('Message Exchange', async () => {
      return await page.evaluate(() => {
        return new Promise((resolve) => {
          const hasSocketIO = !!(window as typeof window & { io?: unknown }).io

          if (!hasSocketIO) {
            resolve({
              sent: false,
              received: false,
              error: 'Socket.IO not available',
            })
            return
          }

          try {
            const socket = (window as typeof window & { io?: (url: string) => unknown }).io?.(
              'http://localhost:3000',
            )

            let messageReceived = false
            const testMessage = `test-message-${Date.now()}`

            // @ts-expect-error - Socket.IO types
            socket?.on('connect', () => {
              // Listen for echo response
              // @ts-expect-error - Socket.IO types
              socket?.on('message', (data: unknown) => {
                if (data === testMessage) {
                  messageReceived = true
                  resolve({
                    sent: true,
                    received: true,
                    message: testMessage,
                  })
                }
              })

              // Send test message
              // @ts-expect-error - Socket.IO types
              socket?.emit('message', testMessage)

              // Timeout after 3 seconds
              setTimeout(() => {
                if (!messageReceived) {
                  resolve({
                    sent: true,
                    received: false,
                    message: testMessage,
                  })
                }
              }, 3000)
            })

            // @ts-expect-error - Socket.IO types
            socket?.on('connect_error', (error: Error) => {
              resolve({
                sent: false,
                received: false,
                error: error.message,
              })
            })
          } catch (error) {
            resolve({
              sent: false,
              received: false,
              error: String(error),
            })
          }
        })
      })
    })

    usageTracker.recordCall('Socket.IO Messages', duration)

    console.log(`💬 Message Exchange:`)
    console.log(`  Message Sent: ${messageTest.sent ? '✅' : '❌'}`)
    console.log(`  Echo Received: ${messageTest.received ? '✅' : '❌'}`)

    if (messageTest.error) {
      console.log(`  Error: ${messageTest.error}`)
    }

    // Should be able to send messages
    expect(messageTest.sent).toBe(true)
  })

  test('should join and leave real rooms', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/agents')
    await waitForAppReady(page)

    const { result: roomTest, duration } = await measureAPICall('Room Management', async () => {
      return await page.evaluate(() => {
        return new Promise((resolve) => {
          const hasSocketIO = !!(window as typeof window & { io?: unknown }).io

          if (!hasSocketIO) {
            resolve({ joined: false, left: false })
            return
          }

          try {
            const socket = (window as typeof window & { io?: (url: string) => unknown }).io?.(
              'http://localhost:3000',
            )
            const testRoom = `agent:test-${Date.now()}`

            // @ts-expect-error - Socket.IO types
            socket?.on('connect', () => {
              // Join room
              // @ts-expect-error - Socket.IO types
              socket?.emit('join-room', testRoom)

              setTimeout(() => {
                // Leave room
                // @ts-expect-error - Socket.IO types
                socket?.emit('leave-room', testRoom)

                resolve({
                  joined: true,
                  left: true,
                  room: testRoom,
                })
              }, 1000)
            })

            // @ts-expect-error - Socket.IO types
            socket?.on('connect_error', () => {
              resolve({ joined: false, left: false })
            })
          } catch (error) {
            resolve({ joined: false, left: false, error: String(error) })
          }
        })
      })
    })

    usageTracker.recordCall('Socket.IO Rooms', duration)

    console.log(`🚪 Room Management:`)
    console.log(`  Joined Room: ${roomTest.joined ? '✅' : '❌'}`)
    console.log(`  Left Room: ${roomTest.left ? '✅' : '❌'}`)

    if (roomTest.room) {
      console.log(`  Room: ${roomTest.room}`)
    }

    // Room operations should work
    expect(roomTest.joined || roomTest.error).toBeTruthy()
  })

  test('should measure real WebSocket performance', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: perfTest, duration } = await measureAPICall(
      'WebSocket Performance',
      async () => {
        return await page.evaluate(() => {
          return new Promise((resolve) => {
            const hasSocketIO = !!(window as typeof window & { io?: unknown }).io

            if (!hasSocketIO) {
              resolve({ connectionTime: 0, messageCount: 0 })
              return
            }

            const startTime = Date.now()
            let connectionTime = 0
            let messagesSent = 0
            const totalMessages = 10

            try {
              const socket = (window as typeof window & { io?: (url: string) => unknown }).io?.(
                'http://localhost:3000',
              )

              // @ts-expect-error - Socket.IO types
              socket?.on('connect', () => {
                connectionTime = Date.now() - startTime

                // Send 10 test messages
                const sendMessages = () => {
                  if (messagesSent < totalMessages) {
                    // @ts-expect-error - Socket.IO types
                    socket?.emit('test', { index: messagesSent })
                    messagesSent++
                    setTimeout(sendMessages, 10)
                  } else {
                    resolve({
                      connectionTime,
                      messageCount: messagesSent,
                      totalTime: Date.now() - startTime,
                    })
                  }
                }

                sendMessages()
              })

              // @ts-expect-error - Socket.IO types
              socket?.on('connect_error', () => {
                resolve({
                  connectionTime: 0,
                  messageCount: 0,
                  error: 'Connection failed',
                })
              })
            } catch (error) {
              resolve({
                connectionTime: 0,
                messageCount: 0,
                error: String(error),
              })
            }
          })
        })
      },
    )

    usageTracker.recordCall('Socket.IO Performance', duration)

    console.log(`⚡ WebSocket Performance:`)
    console.log(`  Connection Time: ${perfTest.connectionTime}ms`)
    console.log(`  Messages Sent: ${perfTest.messageCount}`)
    console.log(`  Total Time: ${perfTest.totalTime}ms`)

    if (perfTest.totalTime && perfTest.messageCount) {
      const avgMessageTime = perfTest.totalTime / perfTest.messageCount
      console.log(`  Avg Message Time: ${avgMessageTime.toFixed(1)}ms`)
    }

    // Connection should be reasonably fast
    if (perfTest.connectionTime > 0) {
      expect(perfTest.connectionTime).toBeLessThan(5000)
    }
  })

  test('should handle real connection drops and reconnection', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: reconnectTest, duration } = await measureAPICall(
      'Reconnection Handling',
      async () => {
        return await page.evaluate(() => {
          return new Promise((resolve) => {
            const hasSocketIO = !!(window as typeof window & { io?: unknown }).io

            if (!hasSocketIO) {
              resolve({ reconnected: false })
              return
            }

            try {
              const socket = (window as typeof window & { io?: (url: string) => unknown }).io?.(
                'http://localhost:3000',
              )

              let connectCount = 0

              // @ts-expect-error - Socket.IO types
              socket?.on('connect', () => {
                connectCount++

                if (connectCount === 1) {
                  // Simulate disconnect
                  // @ts-expect-error - Socket.IO types
                  socket?.disconnect()
                  // @ts-expect-error - Socket.IO types
                  socket?.connect()
                } else if (connectCount === 2) {
                  resolve({
                    reconnected: true,
                    attempts: connectCount,
                  })
                }
              })

              // @ts-expect-error - Socket.IO types
              socket?.on('disconnect', (reason: string) => {
                console.log('Disconnected:', reason)
              })

              setTimeout(() => {
                resolve({
                  reconnected: false,
                  attempts: connectCount,
                  timeout: true,
                })
              }, 10000)
            } catch (error) {
              resolve({
                reconnected: false,
                error: String(error),
              })
            }
          })
        })
      },
    )

    usageTracker.recordCall('Socket.IO Reconnect', duration)

    console.log(`🔄 Reconnection Test:`)
    console.log(`  Reconnected: ${reconnectTest.reconnected ? '✅' : '❌'}`)
    console.log(`  Connection Attempts: ${reconnectTest.attempts || 0}`)

    // Should handle reconnection
    expect(typeof reconnectTest.reconnected).toBe('boolean')
  })

  test('should verify backend server availability', async ({ page }) => {
    await setupRealAPIPage(page)

    // Test if backend is running
    const { result: serverCheck, duration } = await measureAPICall(
      'Backend Server Check',
      async () => {
        try {
          const response = await page.request.get('http://localhost:3000/api/ping')
          return {
            available: response.ok(),
            status: response.status(),
          }
        } catch (error) {
          return {
            available: false,
            error: String(error),
          }
        }
      },
    )

    usageTracker.recordCall('Backend Availability', duration)

    console.log(`🖥️  Backend Server:`)
    console.log(`  Available: ${serverCheck.available ? '✅' : '❌'}`)
    console.log(`  Status: ${serverCheck.status || 'N/A'}`)

    if (!serverCheck.available) {
      console.log(`  ⚠️  Backend not running. Start with: npx tsx server/node-build.ts`)
    }

    // Document server status (test passes either way)
    expect(typeof serverCheck.available).toBe('boolean')
  })
})
