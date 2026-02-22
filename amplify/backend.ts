import { defineBackend, defineFunction } from "@aws-amplify/backend";

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
});

const resumeFunction = defineFunction({
  name: "resume",
  entry: "./functions/resume/index.ts",
});

const pushNotificationsFunction = defineFunction({
  name: "push-notifications",
  entry: "./functions/push-notifications/index.ts",
});

const playwrightAutofixFunction = defineFunction({
  name: "playwright-autofix",
  entry: "./functions/playwright-autofix/index.ts",
  runtime: 20, // Node.js 20.x
  timeoutSeconds: 30,
  memoryMB: 512,
});

const backend = defineBackend({
  ping: pingFunction,
  demo: demoFunction,
  contact: contactFunction,
  resume: resumeFunction,
  "push-notifications": pushNotificationsFunction,
  "playwright-autofix": playwrightAutofixFunction,
});

export default backend;
