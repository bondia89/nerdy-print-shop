import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for testing
const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockAdminUser = {
  ...mockUser,
  id: 2,
  openId: "admin-user",
  role: "admin" as const,
};

function createMockContext(user: typeof mockUser | null = null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Products Router", () => {
  it("should list products with publicProcedure", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    // This should not throw even without authentication
    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should get popular products", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const products = await caller.products.popular();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("Cart Router", () => {
  it("should require authentication to get cart", async () => {
    const ctx = createMockContext(); // No user
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.cart.get()).rejects.toThrow();
  });

  it("should get cart for authenticated user", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);
    
    const cart = await caller.cart.get();
    expect(Array.isArray(cart)).toBe(true);
  });
});

describe("Orders Router", () => {
  it("should require authentication to list orders", async () => {
    const ctx = createMockContext(); // No user
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.orders.list()).rejects.toThrow();
  });

  it("should list orders for authenticated user", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);
    
    const orders = await caller.orders.list();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should require admin role to list all orders", async () => {
    const ctx = createMockContext(mockUser); // Regular user
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.orders.listAll()).rejects.toThrow();
  });
});

describe("Admin Routes", () => {
  it("should deny product creation for non-admin", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.products.create({
      name: "Test Product",
      slug: "test-product",
      price: "10.00",
    })).rejects.toThrow();
  });

  it("should allow product creation for admin", async () => {
    const ctx = createMockContext(mockAdminUser);
    const caller = appRouter.createCaller(ctx);
    
    // This should not throw for admin
    const result = await caller.products.create({
      name: "Test Product " + Date.now(),
      slug: "test-product-" + Date.now(),
      price: "10.00",
    });
    expect(result.success).toBe(true);
  });
});

describe("Auth Router", () => {
  it("should return null for unauthenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("should return user for authenticated request", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    expect(user).toEqual(mockUser);
  });
});
