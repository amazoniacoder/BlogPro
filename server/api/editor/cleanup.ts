import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { handleEditorCleanupRequest } from "../../utils/editorCleanup";

const router = Router();

// Manual cleanup endpoint for editor directory
router.post("/cleanup", asyncHandler(async (_req, res) => {
  const result = await handleEditorCleanupRequest();
  
  res.json({
    success: true,
    ...result
  });
}));

// Test cleanup for specific file
router.post("/test-cleanup/:filename", asyncHandler(async (req, res) => {
  const { cleanupSpecificFileInDirectory } = await import("../../utils/mediaCleanup");
  const filename = req.params.filename;
  
  console.log(`Testing cleanup for: ${filename}`);
  const success = await cleanupSpecificFileInDirectory(filename, "uploads/editor/images");
  
  res.json({
    success: true,
    filename,
    cleaned: success,
    message: success ? `Successfully cleaned ${filename}` : `Failed to clean ${filename}`
  });
}));

export default router;