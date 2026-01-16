import express from "express";
import session from "express-session";
import { corsMiddleware, rateLimiter, sanitizeInput, securityHeadersMiddleware } from "./middleware/security";
import { setupSwagger } from "./config/swagger";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/requestLogger";
import { healthMonitor } from "./utils/healthMonitor";
import { metricsCollector } from "./utils/metricsCollector";
import { compressionMiddleware } from "./middleware/compression";
import { performanceMonitor } from "./middleware/performanceMonitor";
import { requestIdMiddleware } from "./middleware/requestId";

import pgSession from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { cacheHeadersMiddleware } from "./middleware/cacheHeaders";
import { clearPort } from "./utils";
import { pool, checkDatabaseConnection } from "./db/db";
import { checkRedisConnection } from "./db/redis";
import path from "path";
import http from "http";
import https from "https";
import fs from "fs";
// Import express-ws for WebSocket support
import expressWs from "express-ws";
import { WebSocket } from 'ws';

const app = express();

// Performance middleware
app.use(compressionMiddleware);

// Security middleware
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(sanitizeInput);

// Request ID middleware
app.use(requestIdMiddleware);

// Request logging
app.use(requestLogger);

// Performance monitoring
app.use(performanceMonitor);

// Increase body parser limits to handle larger requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));


// Apply cache control middleware
app.use(cacheHeadersMiddleware);

// Explicitly serve uploads from the public/uploads directory
// This needs to be defined BEFORE other static routes to take precedence
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public/uploads"), {
    setHeaders: (res) => {
      // Set cache control headers for better performance
      res.setHeader("Cache-Control", "public, max-age=31536000");
      // Set proper CORS headers to allow images to be loaded from any origin
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Serve static files from public directory
app.use(
  express.static(path.join(process.cwd(), "public"), {
    setHeaders: (res) => {
      // Set cache control headers for better performance
      res.setHeader("Cache-Control", "public, max-age=31536000");
      // Set proper CORS headers to allow resources to be loaded from any origin
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Session configuration
const PgSession = pgSession(session);
app.use(
  session({
    store: new PgSession({
      pool: pool as any, // Type assertion to avoid pg Pool version mismatch
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days for cart persistence
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path.startsWith("/uploads")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Check database connection first
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    logger.error("Failed to connect to database. Please check your database configuration.");
    process.exit(1);
  }

  // Check Redis connection for caching
  const redisConnected = await checkRedisConnection();
  if (redisConnected) {
    logger.info("Redis connected successfully - caching enabled");
  } else {
    logger.warn("Redis connection failed - caching disabled, using in-memory fallback");
  }

  // Ensure admin user exists
  const { ensureAdminUserExists } = await import("./utils/createAdminUser");
  await ensureAdminUserExists();

  // Sync documentation to menu system - disabled due to NULL constraint issues
  // try {
  //   const { documentationMenuService } = await import("./services/documentationMenuService");
  //   await documentationMenuService.bulkSyncAllDocumentation();
  //   console.log('📚 Documentation synced to menu system');
  // } catch (error) {
  //   console.error('Documentation menu sync failed:', error);
  // }
  console.log('📚 Documentation menu sync disabled (database contains invalid records)');

  // Start analytics scheduler
  const { analyticsScheduler } = await import("./utils/scheduler");
  analyticsScheduler.start();

  // Create HTTPS server if SSL certificates exist, otherwise HTTP
  let server;
  const sslKeyPath = path.join(process.cwd(), 'ssl', 'key.pem');
  const sslCertPath = path.join(process.cwd(), 'ssl', 'cert.pem');
  
  if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
      };
      server = https.createServer(httpsOptions, app);
      console.log('🔒 HTTPS server enabled');
    } catch (error) {
      console.log('⚠️  SSL certificate error, falling back to HTTP');
      server = http.createServer(app);
    }
  } else {
    server = http.createServer(app);
    console.log('⚠️  HTTP server (SSL certificates not found)');
  }

  // Set up WebSocket support
  const wsInstance = expressWs(app, server);
  console.log("Express WebSocket extension initialized");
  console.log("WebSocket instance:", wsInstance ? "Created successfully" : "Failed to create");

  // Import WebSocket utilities
  const { createWebSocketHandler } = await import("./websocket");

  // Create WebSocket handler
  createWebSocketHandler(app, '/ws');
  console.log("WebSocket server initialized on /ws");
  
  // Store WebSocket server in app for route access
  app.set('wss', wsInstance.getWss());

  // Store WebSocket server instance for broadcasting
  const wss = wsInstance.getWss();
  console.log("WebSocket server:", wss ? "Retrieved successfully" : "Failed to retrieve");
  console.log("WebSocket clients:", wss && wss.clients ? wss.clients.size : "No clients property");

  // Make WebSocket server available globally
  (global as any).wss = wss;
  console.log("Global WebSocket server set:", (global as any).wss ? "Yes" : "No");

  // Set up ping interval to keep connections alive
  setInterval(() => {
    if (wss && wss.clients) {
      wss.clients.forEach((client: any) => {
        if (client && client.readyState === WebSocket.OPEN) {
          try {
            client.send(
              JSON.stringify({
                type: "ping",
                timestamp: new Date().toISOString(),
              })
            );
          } catch (error) {
            console.error('Error sending ping:', error);
          }
        }
      });
    }
  }, 30000);

  // Set up automatic cleanup of original image files
  const { cleanupOriginalFiles } = await import("./utils/mediaCleanup");
  
  // Run cleanup immediately on startup
  setTimeout(async () => {
    try {
      const result = await cleanupOriginalFiles();
      if (result.deleted.length > 0) {
        console.log(`🧹 Startup cleanup: Removed ${result.deleted.length} original image files`);
      }
    } catch (error) {
      console.error('Startup cleanup failed:', error);
    }
  }, 5000);
  
  // Run cleanup every 10 minutes
  setInterval(async () => {
    try {
      const result = await cleanupOriginalFiles();
      if (result.deleted.length > 0) {
        console.log(`🧹 Scheduled cleanup: Removed ${result.deleted.length} original image files`);
      }
    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
    }
  }, 10 * 60 * 1000); // 10 minutes

  // Register API routes
  await registerRoutes(app);

  // Setup API documentation
  setupSwagger(app);

  // In production, serve static files
  if (app.get("env") === "production") {
    serveStatic(app);
  }

  // Handle 404 errors for routes that don't exist
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  // Port configuration
  const port = parseInt(process.env.PORT || '5000', 10);
  const isHttps = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);
  const protocol = isHttps ? 'https' : 'http';

  // Clear the port before starting the server
  await clearPort(port);

  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    async () => {
      log(`🚀 Server running on ${protocol}://localhost:${port}`);
      
      // Start health monitoring
      healthMonitor.start();
      
      // Start metrics collection
      metricsCollector.start();
      
      // Initialize real-time analytics broadcasting
      const { realtimeAnalytics } = await import("./services/realtime-analytics");
      realtimeAnalytics.initialize(wss);
      
      // Trigger immediate analytics broadcast
      setTimeout(async () => {
        try {
          await realtimeAnalytics.broadcastImmediate();
          console.log('📊 Initial analytics broadcast sent');
        } catch (error) {
          console.error('Initial analytics broadcast failed:', error);
        }
      }, 2000);
    }
  );
})();
