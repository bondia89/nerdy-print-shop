import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import * as schema from "./drizzle/schema";

const dbPath = "./nerdy_print_shop.db";

async function initDatabase() {
  console.log("Initializing database...");
  
  try {
    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite, { schema });

    // Create tables
    console.log("Creating tables...");
    
    // Users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(320) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role TEXT NOT NULL DEFAULT 'user',
        isActive BOOLEAN NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        lastSignedIn DATETIME
      )
    `);

    // Categories table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        imageUrl TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        imageUrl TEXT,
        categoryId INTEGER,
        materialId INTEGER,
        stock INTEGER NOT NULL DEFAULT 0,
        isActive BOOLEAN NOT NULL DEFAULT 1,
        isPopular BOOLEAN NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Product images table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        imageUrl TEXT NOT NULL,
        altText VARCHAR(255),
        sortOrder INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reviews table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        likesCount INTEGER NOT NULL DEFAULT 0,
        isApproved BOOLEAN NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Review likes table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS review_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reviewId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wishlist items table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Coupons table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code VARCHAR(50) NOT NULL UNIQUE,
        discountPercent DECIMAL(5, 2) NOT NULL,
        maxUses INTEGER,
        currentUses INTEGER NOT NULL DEFAULT 0,
        minOrderValue DECIMAL(10, 2),
        isActive BOOLEAN NOT NULL DEFAULT 1,
        startsAt DATETIME,
        expiresAt DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Coupon usages table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS coupon_usages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couponId INTEGER NOT NULL,
        orderId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        discountAmount DECIMAL(10, 2) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart items table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        total DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2),
        discountAmount DECIMAL(10, 2),
        couponCode VARCHAR(50),
        paymentMethod TEXT NOT NULL,
        customerName VARCHAR(255),
        customerEmail VARCHAR(320),
        customerPhone VARCHAR(20),
        shippingAddress TEXT,
        shippingCost DECIMAL(10, 2),
        shippingMethod VARCHAR(100),
        notes TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        isDeleted BOOLEAN NOT NULL DEFAULT 0
      )
    `);

    // Order items table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        productName VARCHAR(255) NOT NULL,
        productPrice DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Generated models table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS generated_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL,
        inputData TEXT,
        outputUrl TEXT,
        previewUrl TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin permissions table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        email VARCHAR(320) NOT NULL UNIQUE,
        canManageProducts BOOLEAN NOT NULL DEFAULT 0,
        canManageOrders BOOLEAN NOT NULL DEFAULT 0,
        canManageCoupons BOOLEAN NOT NULL DEFAULT 0,
        canManageCategories BOOLEAN NOT NULL DEFAULT 0,
        canViewAnalytics BOOLEAN NOT NULL DEFAULT 0,
        canManageUsers BOOLEAN NOT NULL DEFAULT 0,
        grantedBy INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✓ Database tables created successfully!");
    sqlite.close();
  } catch (error) {
    console.error("✗ Error initializing database:", error);
    process.exit(1);
  }
}

initDatabase();
