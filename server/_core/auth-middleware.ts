import type { Request, Response, NextFunction } from "express";
import { COOKIE_NAME } from "@shared/const";
import { verifySessionToken, type SessionPayload } from "./auth";

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.cookies[COOKIE_NAME];

    if (!sessionToken) {
      // User is not authenticated, continue without user
      return next();
    }

    // Verify token
    const user = await verifySessionToken(sessionToken);
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    next();
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}
