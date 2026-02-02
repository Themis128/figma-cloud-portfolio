import http from 'node:http'

// Constants for magic numbers
const SERVER_PORT = 3000
const DEFAULT_TIMEOUT = 5000
const HEALTH_CHECK_TIMEOUT = 2000
const RESUME_TIMEOUT = 30000
const HTTP_OK = 200

function testEndpoint(path, method = 'GET', data = null, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: SERVER_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: timeout,
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          resolve({ status: res.statusCode, data: json })
        } catch (_parseError) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(
          new Error(
            `Server not running on port ${SERVER_PORT}. Please start the backend server first.`,
          ),
        )
      } else if (error.code === 'ETIMEDOUT') {
        reject(new Error(`Request timeout after ${timeout}ms for ${method} ${path}`))
      } else {
        reject(error)
      }
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timeout after ${timeout}ms for ${method} ${path}`))
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function checkServerHealth() {
  try {
    console.log('Checking if backend server is running...')
    const health = await testEndpoint('/api/health', 'GET', null, HEALTH_CHECK_TIMEOUT)
    if (health.status === HTTP_OK) {
      console.log('✅ Backend server is running and healthy\n')
      return true
    }
  } catch (_error) {
    console.log('❌ Backend server is not running or not responding')
    console.log('Please start the backend server with: npx tsx server/node-build.ts\n')
    return false
  }
  return false
}

async function testAllEndpoints() {
  // Check if server is running first
  const serverHealthy = await checkServerHealth()
  if (!serverHealthy) {
    process.exit(1)
  }

  console.log('Testing API endpoints...\n')

  // Test health endpoints
  try {
    console.log('1. Testing /api/health')
    const health = await testEndpoint('/api/health')
    console.log('   Status:', health.status)
    console.log('   Response:', JSON.stringify(health.data, null, 2))
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  try {
    console.log('\n2. Testing /api/health/detailed')
    const healthDetailed = await testEndpoint('/api/health/detailed')
    console.log('   Status:', healthDetailed.status)
    console.log('   Response keys:', Object.keys(healthDetailed.data))
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  try {
    console.log('\n3. Testing /api/ping')
    const ping = await testEndpoint('/api/ping')
    console.log('   Status:', ping.status)
    console.log('   Response:', ping.data)
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  try {
    console.log('\n4. Testing /api/demo')
    const demo = await testEndpoint('/api/demo')
    console.log('   Status:', demo.status)
    console.log('   Response:', demo.data)
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  // Test contact form (POST)
  try {
    console.log('\n5. Testing /api/contact (POST)')
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message',
      recaptchaToken: 'test-token',
    }
    const contact = await testEndpoint('/api/contact', 'POST', contactData)
    console.log('   Status:', contact.status)
    console.log('   Response:', contact.data)
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  // Test analytics (POST)
  try {
    console.log('\n6. Testing /api/analytics (POST)')
    const analyticsData = {
      event: 'test_event',
      timestamp: Date.now(),
      url: 'https://example.com/test',
      userAgent: 'TestAgent/1.0',
    }
    const analytics = await testEndpoint('/api/analytics', 'POST', analyticsData)
    console.log('   Status:', analytics.status)
    console.log('   Response:', analytics.data)
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  // Test resume download (GET)
  try {
    console.log('\n7. Testing /api/resume/download (GET)')
    const resume = await testEndpoint('/api/resume/download', 'GET', null, RESUME_TIMEOUT)
    console.log('   Status:', resume.status)
    console.log('   Response type:', typeof resume.data)
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  // Test push notifications endpoints
  try {
    console.log('\n8. Testing /api/push-notifications (GET)')
    const pushGet = await testEndpoint('/api/push-notifications')
    console.log('   Status:', pushGet.status)
    console.log('   Response:', pushGet.data)
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  // Test GitHub endpoints (these may require auth)
  try {
    console.log('\n9. Testing /api/github/workflows (GET)')
    const workflows = await testEndpoint('/api/github/workflows')
    console.log('   Status:', workflows.status)
    console.log('   Response:', workflows.data)
  } catch (_e) {
    console.log('   Error:', _e.message)
  }

  console.log('\nAPI endpoint testing completed.')
}

testAllEndpoints().catch(console.error)
