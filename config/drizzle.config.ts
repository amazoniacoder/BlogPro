import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/types/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "89.169.0.223",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "12345",
    database: process.env.DB_NAME || "Porto1",
  },
});