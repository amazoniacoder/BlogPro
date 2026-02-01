import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import { 
  users, 
  sessions,   
  blogPosts, 
  mediaFiles, 
  contacts,
  analyticsPageViews,
  analyticsSessions,
  analyticsDailyStats,
  analyticsRealtime,
  products,
  cartItems,
  orders,
  orderItems,
  paymentTransactions,
  footerConfigs,
  footerHistory
} from "../../shared/types/schema";
import * as dotenv from "dotenv";

dotenv.config();

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL || "postgres://postgres:12345@89.169.0.223:5432/Porto1";

// Add connection pool configuration
export const pool = new Pool({
  connectionString,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection to become available
});

// Add error handling for the pool
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Initialize Drizzle with specific schema tables
export const db = drizzle(pool, { 
  schema: { 
    users, 
    sessions,    
    blogPosts, 
    mediaFiles, 
    contacts,
    analyticsPageViews,
    analyticsSessions,
    analyticsDailyStats,
    analyticsRealtime,
    products,
    cartItems,
    orders,
    orderItems,
    paymentTransactions,
    footerConfigs,
    footerHistory
  } 
});

// Function to check database connection
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log("Database connection successful");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Check connection immediately
checkDatabaseConnection().catch(err => {
  console.error("Initial database connection check failed:", err);
});