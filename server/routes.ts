import { Express } from "express";
import apiRoutes from "./api";

export async function registerRoutes(app: Express) {
  try {
    console.log("🔧 Registering API routes...");
    // API routes
    app.use("/api", apiRoutes);
    console.log("✅ API routes registered successfully");
  } catch (error) {
    console.error("❌ Failed to register API routes:", error);
    throw error;
  }
}