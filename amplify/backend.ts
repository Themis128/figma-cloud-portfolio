import { defineBackend, defineFunction } from "@aws-amplify/backend";

const pingFunction = defineFunction({
  name: "ping",
  entry: "./functions/ping.ts",
});

const demoFunction = defineFunction({
  name: "demo",
  entry: "./functions/demo.ts",
});

const contactFunction = defineFunction({
  name: "contact",
  entry: "./functions/contact.ts",
});

const resumeFunction = defineFunction({
  name: "resume",
  entry: "./functions/resume.ts",
});

const pushNotificationsFunction = defineFunction({
  name: "push-notifications",
  entry: "./functions/push-notifications.ts",
});

const backend = defineBackend({
  ping: pingFunction,
  demo: demoFunction,
  contact: contactFunction,
  resume: resumeFunction,
  "push-notifications": pushNotificationsFunction,
});

export default backend;
