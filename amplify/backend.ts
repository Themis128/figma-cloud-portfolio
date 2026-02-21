import { defineBackend, defineFunction } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import {
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

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

const backend = defineBackend({
  ping: pingFunction,
  demo: demoFunction,
  contact: contactFunction,
  resume: resumeFunction,
  "push-notifications": pushNotificationsFunction,
});

// Create HTTP API Gateway and connect Lambda functions
backend.createStack("ApiStack");

const httpApi = new HttpApi(Stack.of(backend.ping), "HttpApi", {
  apiName: "PortfolioApi",
  corsPreflight: {
    allowOrigins: ["*"],
    allowMethods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.OPTIONS],
    allowHeaders: ["Content-Type", "Authorization"],
  },
});

// Add routes for each Lambda function
httpApi.addRoutes({
  path: "/api/ping",
  methods: [HttpMethod.GET],
  integration: new HttpLambdaIntegration("PingIntegration", backend.ping),
});

httpApi.addRoutes({
  path: "/api/demo",
  methods: [HttpMethod.GET],
  integration: new HttpLambdaIntegration("DemoIntegration", backend.demo),
});

httpApi.addRoutes({
  path: "/api/contact",
  methods: [HttpMethod.POST, HttpMethod.OPTIONS],
  integration: new HttpLambdaIntegration("ContactIntegration", backend.contact),
});

httpApi.addRoutes({
  path: "/api/resume",
  methods: [HttpMethod.GET],
  integration: new HttpLambdaIntegration("ResumeIntegration", backend.resume),
});

httpApi.addRoutes({
  path: "/api/push-notifications",
  methods: [HttpMethod.GET, HttpMethod.POST],
  integration: new HttpLambdaIntegration("PushNotificationsIntegration", backend["push-notifications"]),
});

export default backend;
