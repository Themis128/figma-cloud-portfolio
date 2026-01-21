import { defineBackend, defineFunction } from '@aws-amplify/backend'

const backend = defineBackend({})

// API Functions for handling backend requests
const pingFunction = defineFunction({
  name: 'ping',
  entry: './amplify/functions/ping.ts',
})

const demoFunction = defineFunction({
  name: 'demo',
  entry: './amplify/functions/demo.ts',
})

const contactFunction = defineFunction({
  name: 'contact',
  entry: './amplify/functions/contact.ts',
})

const resumeFunction = defineFunction({
  name: 'resume',
  entry: './amplify/functions/resume.ts',
})

const pushNotificationsFunction = defineFunction({
  name: 'push-notifications',
  entry: './amplify/functions/push-notifications.ts',
})

backend.addOutput({
  custom: {
    PING_FUNCTION_URL: pingFunction.url,
    DEMO_FUNCTION_URL: demoFunction.url,
    CONTACT_FUNCTION_URL: contactFunction.url,
    RESUME_FUNCTION_URL: resumeFunction.url,
    PUSH_NOTIFICATIONS_FUNCTION_URL: pushNotificationsFunction.url,
  },
})

export default backend
