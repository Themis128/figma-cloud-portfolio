import { defineData } from '@aws-amplify/backend';

export const data = defineData({
  schema: `
    type ContactSubmission @model @auth(rules: [
      { allow: public, provider: identityPool, operations: [create] },
      { allow: groups, groups: ["admin"] }
    ]) {
      id: ID!
      name: String!
      email: String!
      subject: String
      message: String!
      recaptchaScore: Float
      source: String
    }

    type Booking @model @auth(rules: [
      { allow: public, provider: identityPool, operations: [create] },
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
    }

    enum BookingStatus {
      PENDING
      CONFIRMED
      CANCELLED
    }
  `,
});
