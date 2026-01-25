import type { Request, Response } from "express";

export const handleAnalytics = async (req: Request, res: Response) => {
  try {
    const { event, data, timestamp, url, userAgent } = req.body;

    // Basic validation
    if (!event || !timestamp || !url || !userAgent) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Log analytics data (in production, you might store in database)
    console.log("Analytics event:", {
      event,
      data,
      timestamp,
      url,
      userAgent,
    });

    // Respond with success
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to process analytics" });
  }
};