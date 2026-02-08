import { config } from 'dotenv'

config()

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_RECAPTCHA_SITE_KEY',
]

const missing = []
const placeholder = []

for (const key of required) {
  const value = process.env[key]
  if (!value) {
    missing.push(key)
  } else if (value.includes('your_') || value.includes('here')) {
    placeholder.push(key)
  }
}

console.log('\n🔍 Environment Variables Check\n')

if (missing.length === 0 && placeholder.length === 0) {
  console.log('✅ All required variables are set!\n')
} else {
  if (missing.length > 0) {
    console.log('❌ Missing variables:')
    missing.forEach((k) => {
      console.log(`   - ${k}`)
    })
    console.log()
  }
  if (placeholder.length > 0) {
    console.log('⚠️  Placeholder values (need real values):')
    placeholder.forEach((k) => {
      console.log(`   - ${k}`)
    })
    console.log()
  }
}
