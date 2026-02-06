import type { Handler } from "aws-lambda";

export const handler: Handler = async (event) => {
  const ping = process.env['PING_MESSAGE'] ?? "ping";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
    body: JSON.stringify({ message: ping }),
  };
};
