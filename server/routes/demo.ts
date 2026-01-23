import type { DemoResponse } from "@shared/api";
import type { RequestHandler } from "express";

export const handleDemo: RequestHandler = (_req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};
