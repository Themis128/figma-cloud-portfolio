import { defineData } from '@aws-amplify/backend';

export const data = defineData({
  schema: `
    type ContactSubmission @model @auth(rules: [
      { allow: public, provider: iam, operations: [create] },
      { allow: groups, groups: ["admin"] }
    ]) {
      id: ID!
      name: String!
      email: String!
      subject: String
      message: String!
      recaptchaScore: Float
      source: String
      createdAt: AWSDateTime
    }

    type Booking @model @auth(rules: [
      { allow: public, provider: iam, operations: [create] },
      { allow: groups, groups: ["admin"] }
    ]) {
      id: ID!
      name: String!
      email: String!
      startTime: AWSDateTime!
      endTime: AWSDateTime
      timeZone: String!
      meetingUrl: String
      status: BookingStatus
      source: String
      createdAt: AWSDateTime
    }

    type ChatLog @model @auth(rules: [
      { allow: public, provider: iam, operations: [create] },
      { allow: groups, groups: ["admin"] }
    ]) {
      id: ID!
      sessionId: String!
      userMessage: String!
      assistantMessage: String!
      messageLength: Int
      createdAt: AWSDateTime
    }

    enum BookingStatus {
      PENDING
      CONFIRMED
      CANCELLED
    }
  `,
});
