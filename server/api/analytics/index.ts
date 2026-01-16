import { Router, Request, Response } from "express";
import { analyticsService } from "../../services/analytics-service";
import { requireAuth } from "../../middleware/authMiddleware";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { detectDevice, getClientIP } from "../../utils/deviceDetection";
import { analyticsScheduler } from "../../utils/scheduler";
import { InputSanitizer } from "../../utils/sanitization";
import { AuditLogger } from "../../utils/auditLogger";
import { csrfProtection } from "../../middleware/csrfProtection";
import { analyticsExport } from "../../services/analytics-export";
import { analyticsCleanupService } from "../../services/analytics-cleanup";
import { analyticsCacheService } from "../../services/analytics-cache";

const router = Router();

// Rate limiting for tracking endpoint
const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many tracking requests" },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for analytics queries
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: { error: "Too many analytics requests" },
  standardHeaders: true,
  legacyHeaders: false
});

console.log("🚀 Analytics System Loading (TS)...");

// Analytics overview (admin only)
router.get("/overview", requireAuth, analyticsLimiter, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      AuditLogger.logAuthFailure(
        getClientIP(req),
        'Insufficient permissions for analytics overview',
        req.get('User-Agent')
      );
      return res.status(403).json({ error: "Admin access required" });
    }

    const days = parseInt(req.query.days as string) || 7;
    
    if (days < 1 || days > 365) {
      return res.status(400).json({ error: "Days must be between 1 and 365" });
    }

    console.log(`📊 Analytics overview requested for ${days} days by admin: ${req.user?.id}`);
    
    const overview = await analyticsService.getOverview({ days });
    res.json(overview);
  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ error: "Analytics service error" });
  }
});

// Tracking endpoint (public with rate limiting)
router.post("/track", trackingLimiter, async (req: Request, res: Response) => {
  try {
    const trackingSchema = z.object({
      sessionId: z.string().min(1).max(255),
      pagePath: z.string().min(1).max(500),
      pageTitle: z.string().optional(),
      referrer: z.string().optional(),
      userAgent: z.string().optional(),
      deviceType: z.string().max(50).optional(),
      browser: z.string().max(100).optional(),
      os: z.string().max(100).optional(),
      screenResolution: z.string().max(20).optional()
    });

    // Enhanced sanitization and validation
    const sanitizedInput = InputSanitizer.sanitizeTrackingData(req.body);
    const validated = trackingSchema.parse(sanitizedInput);
    const deviceInfo = detectDevice(req);
    
    // Add IP address, device info and sanitize
    const trackingData = {
      ...validated,
      ipAddress: InputSanitizer.sanitizeIP(getClientIP(req)) || '127.0.0.1',
      userAgent: InputSanitizer.sanitizeUserAgent(req.get('User-Agent') || ''),
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os
    };

    await analyticsService.trackPageView(trackingData);
    
    console.log('📈 Analytics tracking successful:', { 
      sessionId: validated.sessionId, 
      pagePath: validated.pagePath,
      deviceType: trackingData.deviceType,
      userAgent: trackingData.userAgent?.substring(0, 50) + '...'
    });
    
    res.json({ success: true, message: "Tracking received" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation failures for security monitoring
      AuditLogger.logAnalyticsEvent({
        action: 'TRACKING_VALIDATION_FAILURE',
        resource: 'analytics',
        details: { 
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
          severity: 'LOW'
        },
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({ 
        success: false, 
        error: "Invalid tracking data"
      });
    }
    
    console.error("Analytics tracking error:", error);
    // Don't fail tracking requests - return success to avoid breaking user experience
    res.json({ success: true, error: "Tracking failed but continuing" });
  }
});

// Clear analytics cache (admin only)
router.post("/clear-cache", requireAuth, csrfProtection, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    await analyticsCacheService.clearAllCache();
    
    console.log(`🧹 Analytics cache cleared by admin: ${req.user?.id}`);
    
    res.json({ success: true, message: "Analytics cache cleared" });
  } catch (error) {
    console.error("Analytics clear cache error:", error);
    res.status(500).json({ error: "Failed to clear analytics cache" });
  }
});

// Clear analytics data (admin only)
router.delete("/clear-data", requireAuth, csrfProtection, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    await analyticsService.clearData();
    
    // Audit log the data clearing
    AuditLogger.logDataClear(
      req.user?.id || 'unknown',
      getClientIP(req),
      req.get('User-Agent')
    );
    
    console.log(`🗑️ Analytics data cleared by admin: ${req.user?.id}`);
    
    res.json({ success: true, message: "Analytics data cleared" });
  } catch (error) {
    console.error("Analytics clear data error:", error);
    res.status(500).json({ error: "Failed to clear analytics data" });
  }
});

// Manual aggregation trigger (admin only)
router.post("/aggregate", requireAuth, csrfProtection, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { date } = req.body;
    const sanitizedDate = InputSanitizer.sanitizeString(date || '', 10);
    
    await analyticsScheduler.triggerAggregation(sanitizedDate || undefined);
    
    // Audit log the manual aggregation
    AuditLogger.logManualAggregation(
      req.user?.id || 'unknown',
      sanitizedDate || 'today',
      getClientIP(req),
      req.get('User-Agent')
    );
    
    console.log(`📊 Manual aggregation triggered by admin: ${req.user?.id}`);
    
    res.json({ success: true, message: "Aggregation completed" });
  } catch (error) {
    console.error("Analytics aggregation error:", error);
    res.status(500).json({ error: "Failed to aggregate analytics data" });
  }
});

// Get real-time stats (admin only)
router.get("/realtime", requireAuth, analyticsLimiter, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const realtimeStats = await analyticsService.getRealtimeStats();
    res.json(realtimeStats);
  } catch (error) {
    console.error("Real-time stats error:", error);
    res.status(500).json({ error: "Failed to get real-time stats" });
  }
});

// Export analytics data (admin only)
router.get("/export", requireAuth, analyticsLimiter, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      AuditLogger.logAuthFailure(
        getClientIP(req),
        'Insufficient permissions for analytics export',
        req.get('User-Agent')
      );
      return res.status(403).json({ error: "Admin access required" });
    }

    const format = req.query.format as string || 'csv';
    const days = parseInt(req.query.days as string) || 30;
    
    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({ error: "Invalid format. Use 'csv' or 'json'" });
    }

    const exportResult = await analyticsExport.exportData({ format: format as 'csv' | 'json', days });
    
    // Audit log the export
    AuditLogger.logAnalyticsEvent({
      userId: req.user?.id || 'unknown',
      action: 'EXPORT_ANALYTICS_DATA',
      resource: 'analytics',
      details: { format, days },
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent')
    });
    
    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.send(exportResult.data);
  } catch (error) {
    console.error("Analytics export error:", error);
    res.status(500).json({ error: "Failed to export analytics data" });
  }
});

// Data retention stats (admin only)
router.get("/retention-stats", requireAuth, analyticsLimiter, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const stats = await analyticsCleanupService.getDataRetentionStats();
    res.json(stats);
  } catch (error) {
    console.error("Retention stats error:", error);
    res.status(500).json({ error: "Failed to get retention stats" });
  }
});

// Manual cleanup trigger (admin only)
router.post("/cleanup", requireAuth, csrfProtection, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const result = await analyticsCleanupService.cleanupOldData();
    
    AuditLogger.logAnalyticsEvent({
      userId: req.user?.id || 'unknown',
      action: 'MANUAL_CLEANUP',
      resource: 'analytics',
      details: result,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent')
    });
    
    res.json({ success: true, result });
  } catch (error) {
    console.error("Manual cleanup error:", error);
    res.status(500).json({ error: "Failed to cleanup analytics data" });
  }
});

// Health check
router.get("/health", async (_req: Request, res: Response) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "analytics-ts",
    message: "Analytics system operational"
  });
});

console.log("✅ Analytics System Loaded Successfully (TS)");

export default router;