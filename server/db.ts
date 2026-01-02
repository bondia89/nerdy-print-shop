import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { 
  InsertUser, users, User,
  products, InsertProduct, Product,
  categories, InsertCategory, Category,
  cartItems, InsertCartItem, CartItem,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem, OrderItem,
  generatedModels, InsertGeneratedModel, GeneratedModel,
  productImages, InsertProductImage, ProductImage,
  reviews, InsertReview, Review,
  reviewLikes, InsertReviewLike, ReviewLike,
  wishlistItems, InsertWishlistItem, WishlistItem,
  coupons, InsertCoupon, Coupon,
  couponUsages, InsertCouponUsage, CouponUsage,
  adminPermissions, InsertAdminPermission, AdminPermission
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Parse SQLite connection string
      const dbUrl = process.env.DATABASE_URL;
      const dbPath = dbUrl.replace("file:", "");
      const sqlite = new Database(dbPath);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

/**
 * Create a new user
 */
export async function createUser(user: Omit<InsertUser, 'id' | 'role' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return null;
  }

  try {
    const result = db.insert(users).values({
      ...user,
      role: 'user',
      isActive: true,
    } as InsertUser).run();

    if (result.changes > 0) {
      return await getUserById(result.lastInsertRowid as number);
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating user:", error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return null;
  }

  try {
    const result = db.select().from(users).where(eq(users.email, email)).get();
    return result || null;
  } catch (error) {
    console.error("[Database] Error getting user by email:", error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return null;
  }

  try {
    const result = db.select().from(users).where(eq(users.id, id)).get();
    return result || null;
  } catch (error) {
    console.error("[Database] Error getting user by id:", error);
    return null;
  }
}

/**
 * Update user last signed in
 */
export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId)).run();
  } catch (error) {
    console.error("[Database] Error updating user last signed in:", error);
  }
}

/**
 * Update user
 */
export async function updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return null;
  }

  try {
    db.update(users).set(data).where(eq(users.id, id)).run();
    return await getUserById(id);
  } catch (error) {
    console.error("[Database] Error updating user:", error);
    return null;
  }
}

// ============ PRODUCT HELPERS ============

export async function getProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(products).all();
  } catch (error) {
    console.error("[Database] Error getting products:", error);
    return [];
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    return db.select().from(products).where(eq(products.id, id)).get() || null;
  } catch (error) {
    console.error("[Database] Error getting product:", error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    return db.select().from(products).where(eq(products.slug, slug)).get() || null;
  } catch (error) {
    console.error("[Database] Error getting product by slug:", error);
    return null;
  }
}

export async function createProduct(product: InsertProduct): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(products).values(product).run();
    if (result.changes > 0) {
      return await getProductById(result.lastInsertRowid as number);
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating product:", error);
    return null;
  }
}

// ============ CATEGORY HELPERS ============

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(categories).all();
  } catch (error) {
    console.error("[Database] Error getting categories:", error);
    return [];
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    return db.select().from(categories).where(eq(categories.id, id)).get() || null;
  } catch (error) {
    console.error("[Database] Error getting category:", error);
    return null;
  }
}

// ============ CART HELPERS ============

export async function getCartItems(userId: number): Promise<CartItem[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId)).all();
  } catch (error) {
    console.error("[Database] Error getting cart items:", error);
    return [];
  }
}

export async function addCartItem(item: InsertCartItem): Promise<CartItem | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(cartItems).values(item).run();
    if (result.changes > 0) {
      return db.select().from(cartItems).where(eq(cartItems.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error adding cart item:", error);
    return null;
  }
}

export async function removeCartItem(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    db.delete(cartItems).where(eq(cartItems.id, id)).run();
  } catch (error) {
    console.error("[Database] Error removing cart item:", error);
  }
}

// ============ ORDER HELPERS ============

export async function getOrders(userId?: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId)).all();
    }
    return db.select().from(orders).all();
  } catch (error) {
    console.error("[Database] Error getting orders:", error);
    return [];
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    return db.select().from(orders).where(eq(orders.id, id)).get() || null;
  } catch (error) {
    console.error("[Database] Error getting order:", error);
    return null;
  }
}

export async function createOrder(order: InsertOrder): Promise<Order | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(orders).values(order).run();
    if (result.changes > 0) {
      return await getOrderById(result.lastInsertRowid as number);
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating order:", error);
    return null;
  }
}

// ============ REVIEW HELPERS ============

export async function getReviews(productId: number): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(reviews).where(eq(reviews.productId, productId)).all();
  } catch (error) {
    console.error("[Database] Error getting reviews:", error);
    return [];
  }
}

export async function createReview(review: InsertReview): Promise<Review | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(reviews).values(review).run();
    if (result.changes > 0) {
      return db.select().from(reviews).where(eq(reviews.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating review:", error);
    return null;
  }
}

// ============ COUPON HELPERS ============

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    return db.select().from(coupons).where(eq(coupons.code, code)).get() || null;
  } catch (error) {
    console.error("[Database] Error getting coupon:", error);
    return null;
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(coupons).all();
  } catch (error) {
    console.error("[Database] Error getting coupons:", error);
    return [];
  }
}

export async function createCoupon(coupon: InsertCoupon): Promise<Coupon | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(coupons).values(coupon).run();
    if (result.changes > 0) {
      return db.select().from(coupons).where(eq(coupons.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating coupon:", error);
    return null;
  }
}

// ============ WISHLIST HELPERS ============

export async function getWishlistItems(userId: number): Promise<WishlistItem[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).all();
  } catch (error) {
    console.error("[Database] Error getting wishlist items:", error);
    return [];
  }
}

export async function addWishlistItem(item: InsertWishlistItem): Promise<WishlistItem | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(wishlistItems).values(item).run();
    if (result.changes > 0) {
      return db.select().from(wishlistItems).where(eq(wishlistItems.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error adding wishlist item:", error);
    return null;
  }
}

export async function removeWishlistItem(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    db.delete(wishlistItems).where(eq(wishlistItems.id, id)).run();
  } catch (error) {
    console.error("[Database] Error removing wishlist item:", error);
  }
}

// ============ ADMIN PERMISSION HELPERS ============

export async function getAdminPermissions(userId: number): Promise<AdminPermission | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    return db.select().from(adminPermissions).where(eq(adminPermissions.userId, userId)).get() || null;
  } catch (error) {
    console.error("[Database] Error getting admin permissions:", error);
    return null;
  }
}

export async function updateAdminPermissions(userId: number, permissions: Partial<AdminPermission>): Promise<AdminPermission | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    db.update(adminPermissions).set(permissions).where(eq(adminPermissions.userId, userId)).run();
    return await getAdminPermissions(userId);
  } catch (error) {
    console.error("[Database] Error updating admin permissions:", error);
    return null;
  }
}


// ============ MISSING PRODUCT FUNCTIONS ============

export async function getAllProducts(onlyActive = true): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    if (onlyActive) {
      return db.select().from(products).where(eq(products.isActive, true)).all();
    }
    return db.select().from(products).all();
  } catch (error) {
    console.error("[Database] Error getting all products:", error);
    return [];
  }
}

export async function getPopularProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(products).where(eq(products.isPopular, true)).all();
  } catch (error) {
    console.error("[Database] Error getting popular products:", error);
    return [];
  }
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    db.update(products).set(data).where(eq(products.id, id)).run();
    return await getProductById(id);
  } catch (error) {
    console.error("[Database] Error updating product:", error);
    return null;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    db.delete(products).where(eq(products.id, id)).run();
  } catch (error) {
    console.error("[Database] Error deleting product:", error);
  }
}

export async function createCategory(category: InsertCategory): Promise<Category | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(categories).values(category).run();
    if (result.changes > 0) {
      return await getCategoryById(result.lastInsertRowid as number);
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating category:", error);
    return null;
  }
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    db.update(categories).set(data).where(eq(categories.id, id)).run();
    return await getCategoryById(id);
  } catch (error) {
    console.error("[Database] Error updating category:", error);
    return null;
  }
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    db.delete(categories).where(eq(categories.id, id)).run();
  } catch (error) {
    console.error("[Database] Error deleting category:", error);
  }
}

export async function getProductAverageRating(productId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = db.select().from(reviews).where(eq(reviews.productId, productId)).all();
    if (result.length === 0) return 0;
    const total = result.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / result.length) * 10) / 10;
  } catch (error) {
    console.error("[Database] Error getting product average rating:", error);
    return 0;
  }
}

export async function updateOrder(id: number, data: Partial<Order>): Promise<Order | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    db.update(orders).set(data).where(eq(orders.id, id)).run();
    return await getOrderById(id);
  } catch (error) {
    console.error("[Database] Error updating order:", error);
    return null;
  }
}

export async function createOrderItem(item: InsertOrderItem): Promise<OrderItem | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(orderItems).values(item).run();
    if (result.changes > 0) {
      return db.select().from(orderItems).where(eq(orderItems.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating order item:", error);
    return null;
  }
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();
  } catch (error) {
    console.error("[Database] Error getting order items:", error);
    return [];
  }
}

export async function createGeneratedModel(model: InsertGeneratedModel): Promise<GeneratedModel | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(generatedModels).values(model).run();
    if (result.changes > 0) {
      return db.select().from(generatedModels).where(eq(generatedModels.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating generated model:", error);
    return null;
  }
}

export async function getGeneratedModels(userId: number): Promise<GeneratedModel[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(generatedModels).where(eq(generatedModels.userId, userId)).all();
  } catch (error) {
    console.error("[Database] Error getting generated models:", error);
    return [];
  }
}

export async function createReviewLike(like: InsertReviewLike): Promise<ReviewLike | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(reviewLikes).values(like).run();
    if (result.changes > 0) {
      return db.select().from(reviewLikes).where(eq(reviewLikes.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating review like:", error);
    return null;
  }
}

export async function removeReviewLike(reviewId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    db.delete(reviewLikes).where(
      eq(reviewLikes.reviewId, reviewId)
    ).run();
  } catch (error) {
    console.error("[Database] Error removing review like:", error);
  }
}

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return db.select().from(productImages).where(eq(productImages.productId, productId)).all();
  } catch (error) {
    console.error("[Database] Error getting product images:", error);
    return [];
  }
}

export async function createProductImage(image: InsertProductImage): Promise<ProductImage | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(productImages).values(image).run();
    if (result.changes > 0) {
      return db.select().from(productImages).where(eq(productImages.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating product image:", error);
    return null;
  }
}

export async function createCouponUsage(usage: InsertCouponUsage): Promise<CouponUsage | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = db.insert(couponUsages).values(usage).run();
    if (result.changes > 0) {
      return db.select().from(couponUsages).where(eq(couponUsages.id, result.lastInsertRowid as number)).get() || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Error creating coupon usage:", error);
    return null;
  }
}
