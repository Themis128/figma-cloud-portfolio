import { a, type ClientSchema } from "@aws-amplify/backend";

export const schema = a.schema({
  Agent: a
    .model({
      name: a.string().required(),
      description: a.string(),
      createdAt: a.timestamp().default(() => new Date()),
      updatedAt: a.timestamp().default(() => new Date()),
    })
    .authorization((allow) => [allow.owner()]),

  AgentVersion: a
    .model({
      agentId: a.string().required(),
      version: a.integer().required(),
      config: a.json().required(),
      createdAt: a.timestamp().default(() => new Date()),
    })
    .authorization((allow) => [allow.owner()]),

  AgentExecution: a
    .model({
      agentId: a.string().required(),
      startedAt: a.timestamp().default(() => new Date()),
      endedAt: a.timestamp(),
      status: a.string().required(),
      error: a.string(),
      metrics: a.json(),
    })
    .authorization((allow) => [allow.owner()]),

  // Contact message model for storing contact form submissions
  ContactMessage: a
    .model({
      name: a.string().required(),
      email: a.email().required(),
      subject: a.string().required(),
      message: a.string().required(),
      recaptchaScore: a.float(),
      status: a.string().default("new"),
      createdAt: a.timestamp().default(() => new Date()),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.publicApiKey().to(["create"]),
    ]),

  // Resume data model for user resumes
  Resume: a
    .model({
      userId: a.string().required(),
      title: a.string(),
      personalInfo: a.json(),
      experience: a.json(),
      education: a.json(),
      certifications: a.json(),
      skills: a.json(),
      createdAt: a.timestamp().default(() => new Date()),
      updatedAt: a.timestamp().default(() => new Date()),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;
