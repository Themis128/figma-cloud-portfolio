import { defineBackend, defineFunction } from "@aws-amplify/backend";
import { auth } from "./backend/auth/resource";
import { data } from "./backend/data/resource";

const pingFunction = defineFunction({
  name: "ping",
  entry: "./functions/ping/index.ts",
});

const demoFunction = defineFunction({
  name: "demo",
  entry: "./functions/demo/index.ts",
});

const contactFunction = defineFunction({
  name: "contact",
  entry: "./functions/contact/index.ts",
  environment: {
    // reCAPTCHA secret will be set via environment variables
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || "",
  },
});

const resumeFunction = defineFunction({
  name: "resume",
  entry: "./functions/resume/index.ts",
});

const pushNotificationsFunction = defineFunction({
  name: "push-notifications",
  entry: "./functions/push-notifications/index.ts",
  environment: {
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || "",
  },
});

const playwrightAutofixFunction = defineFunction({
  name: "playwright-autofix",
  entry: "./functions/playwright-autofix/index.ts",
  runtime: 20, // Node.js 20.x
  timeoutSeconds: 30,
  memoryMB: 512,
});

const backend = defineBackend({
  auth,
  data,
  ping: pingFunction,
  demo: demoFunction,
  contact: contactFunction,
  resume: resumeFunction,
  "push-notifications": pushNotificationsFunction,
  "playwright-autofix": playwrightAutofixFunction,
});

// Create API Gateway for Lambda functions
const apiStack = backend.createStack("api-stack");

// Expose Lambda functions as HTTP endpoints
backend.ping.addHttpEndpoint({
  path: "/ping",
  methods: ["GET"],
});

backend.demo.addHttpEndpoint({
  path: "/demo",
  methods: ["GET"],
});

backend.contact.addHttpEndpoint({
  path: "/contact",
  methods: ["POST", "OPTIONS"],
});

backend.resume.addHttpEndpoint({
  path: "/resume",
  methods: ["GET", "POST"],
});

backend["push-notifications"].addHttpEndpoint({
  path: "/push-notifications",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

backend["playwright-autofix"].addHttpEndpoint({
  path: "/playwright-autofix",
  methods: ["GET", "POST"],
});

export default backend;
