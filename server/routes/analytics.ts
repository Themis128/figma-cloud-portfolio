import type { Request, Response } from "express";

// HTTP status codes
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const handleAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event, timestamp, url, userAgent } = req.body;

    // Basic validation
    if (!event || !timestamp || !url || !userAgent) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    // Respond with success
    res.status(HTTP_STATUS.OK).json({ success: true });
  } catch (_error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to process analytics" });
  }
};
