import webpush from 'web-push'

console.log('\n🔑 Generating VAPID Keys for Push Notifications...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('Public Key (add to .env as VITE_AWS_SNS_PUBLIC_KEY):')
console.log(vapidKeys.publicKey)
console.log('\nPrivate Key (keep secret, add to server env):')
console.log(vapidKeys.privateKey)
console.log('\n✅ Keys generated successfully!\n')
