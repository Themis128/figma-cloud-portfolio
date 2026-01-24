import { defineBackend, defineFunction } from '@aws-amplify/backend'

const backend = defineBackend({
  api: defineApi({
    ping: pingFunction,
    demo: demoFunction,
    contact: contactFunction,
    resume: resumeFunction,
    'push-notifications': pushNotificationsFunction,
  }),
})

// API Functions for handling backend requests
const pingFunction = defineFunction({
  name: 'ping',
  entry: './functions/ping.ts',
})

const demoFunction = defineFunction({
  name: 'demo',
  entry: './functions/demo.ts',
})

const contactFunction = defineFunction({
  name: 'contact',
  entry: './functions/contact.ts',
})

const resumeFunction = defineFunction({
  name: 'resume',
  entry: './functions/resume.ts',
})

const pushNotificationsFunction = defineFunction({
  name: 'push-notifications',
  entry: './functions/push-notifications.ts',
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
