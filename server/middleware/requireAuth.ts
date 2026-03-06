import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/firebaseAdmin";

export interface AuthenticatedRequest extends Request {
  uid?: string;
  email?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(header.slice(7));
    req.uid = decoded.uid;
    req.email = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
