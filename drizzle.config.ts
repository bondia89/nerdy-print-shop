import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Detectar se está usando SQLite ou MySQL
const isSqlite = connectionString.startsWith("file:");

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: isSqlite ? "sqlite" : "mysql",
  dbCredentials: isSqlite 
    ? { url: connectionString }
    : { url: connectionString },
});
