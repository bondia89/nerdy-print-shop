import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";
import type { User } from "../../drizzle/schema";

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret || "your-secret-key-change-in-production");
const JWT_EXPIRATION = "7d";

export type SessionPayload = {
  userId: number;
  email: string;
  name: string;
  role: "user" | "admin";
};

/**
 * Create a JWT token for a user session
 */
export async function createSessionToken(user: User): Promise<string> {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionPayload;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Hash a password using bcrypt (simple implementation)
 * For production, use bcryptjs or similar
 */
export async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - use bcryptjs in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ENV.jwtSecret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // Minimum 6 characters
  return password.length >= 6;
}

/**
 * Get password validation error message
 */
export function getPasswordValidationError(password: string): string | null {
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
}
