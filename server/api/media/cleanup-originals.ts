import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";

const router = Router();

// Clean up non-WebP image files that have WebP equivalents
router.post("/cleanup-originals", asyncHandler(async (_req, res) => {
  const { cleanupOriginalFiles } = await import("../../utils/mediaCleanup");
  
  try {
    const result = await cleanupOriginalFiles();
    
    res.json({
      message: `Cleanup completed. Deleted ${result.deleted.length} files.`,
      deleted: result.deleted,
      errors: result.errors
    });

  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({ error: "Failed to cleanup files" });
  }
}));

export default router;