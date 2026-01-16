import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { cleanupMissingMediaFiles } from "./cleanup";

const router = Router();

// Endpoint to clean up missing media files
router.post("/cleanup", asyncHandler(async (_, res) => {
  const removedCount = await cleanupMissingMediaFiles();
  res.json({ 
    success: true, 
    message: `Successfully cleaned up media files. Removed ${removedCount} entries for missing files.` 
  });
}));

export default router;