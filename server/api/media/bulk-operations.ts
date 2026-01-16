import { Router } from "express";
import { storage } from "../../services/storage";
import { asyncHandler } from "../../middleware/errorHandler";
import { BadRequestError } from "../../../shared/utils/errors";
import path from "path";
import fs from "fs";

const router = Router();

// Bulk delete media files
router.delete("/bulk", asyncHandler(async (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestError("No file IDs provided");
  }
  
  const results = {
    deleted: [] as number[],
    failed: [] as { id: number; error: string }[]
  };
  
  for (const id of ids) {
    try {
      // Get file info before deletion
      const mediaFile = await storage.getMediaFile(parseInt(id));
      
      if (mediaFile) {
        // Delete from database
        const deleted = await storage.deleteMediaFile(parseInt(id));
        
        if (deleted) {
          // Delete physical files
          try {
            const urlWithoutPrefix = mediaFile.url.replace(/^\/uploads/, '');
            const filePath = path.join(process.cwd(), "public/uploads", urlWithoutPrefix);
            
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            
            // Delete thumbnail
            if (mediaFile.thumbnailUrl && mediaFile.thumbnailUrl !== mediaFile.url) {
              const thumbnailUrlWithoutPrefix = mediaFile.thumbnailUrl.replace(/^\/uploads/, '');
              const thumbnailPath = path.join(process.cwd(), "public/uploads", thumbnailUrlWithoutPrefix);
              
              if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
              }
            }
          } catch (fileError) {
            console.error(`Failed to delete files for ${id}:`, fileError);
          }
          
          results.deleted.push(parseInt(id));
        } else {
          results.failed.push({ id: parseInt(id), error: "Not found in database" });
        }
      } else {
        results.failed.push({ id: parseInt(id), error: "File not found" });
      }
    } catch (error) {
      results.failed.push({ 
        id: parseInt(id), 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
  
  res.json({
    message: `Bulk operation completed. ${results.deleted.length} deleted, ${results.failed.length} failed.`,
    results
  });
}));

export default router;