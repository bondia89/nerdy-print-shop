import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { createSessionToken, hashPassword, comparePassword, isValidEmail, isValidPassword, getPasswordValidationError } from "./auth";
import { getSessionCookieOptions } from "./cookies";

export function registerAuthRoutes(app: Express) {
  /**
   * POST /api/auth/register - Register a new user
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, name, password, passwordConfirm } = req.body;

      // Validations
      if (!email || !name || !password) {
        res.status(400).json({ error: "Email, name, and password are required" });
        return;
      }

      if (!isValidEmail(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        res.status(400).json({ error: passwordError });
        return;
      }

      if (password !== passwordConfirm) {
        res.status(400).json({ error: "Passwords do not match" });
        return;
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const newUser = await db.createUser({
        email,
        name,
        password: hashedPassword,
      });

      if (!newUser) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // Create session token
      const sessionToken = await createSessionToken(newUser);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * POST /api/auth/login - Login user
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validations
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Find user
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({ error: "Account is inactive" });
        return;
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Update last signed in
      await db.updateUserLastSignedIn(user.id);

      // Create session token
      const sessionToken = await createSessionToken(user);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * POST /api/auth/logout - Logout user
   */
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      res.clearCookie(COOKIE_NAME);
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  /**
   * GET /api/auth/me - Get current user
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const sessionToken = req.cookies[COOKIE_NAME];

      if (!sessionToken) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      // Verify token is handled by middleware
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }

      const fullUser = await db.getUserById(user.userId);
      if (!fullUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        user: {
          id: fullUser.id,
          email: fullUser.email,
          name: fullUser.name,
          role: fullUser.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Get current user failed:", error);
      res.status(500).json({ error: "Failed to get current user" });
    }
  });
}
