import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { storage } from "../../services/storage";
import { clearApiCache } from "../../middleware/apiCache";
import path from "path";
import fs from "fs";

const router = Router();

router.post("/update-database", asyncHandler(async (_req, res) => {
  try {
    const mediaFiles = await storage.getMediaFiles();
    let updatedCount = 0;

    for (const file of mediaFiles) {
      // Check if file exists as WebP
      const webpPath = path.join(process.cwd(), "public", file.url.replace(/^\//, ''));
      
      if (fs.existsSync(webpPath) && file.url.endsWith('.webp')) {
        const stats = fs.statSync(webpPath);
        
        // Update filename to .webp extension
        const filenameWithoutExt = path.parse(file.filename).name;
        const webpFilename = `${filenameWithoutExt}.webp`;
        
        // Update database with correct WebP info
        await storage.updateMediaFile(file.id, {
          filename: webpFilename,
          mimeType: 'image/webp',
          size: stats.size
        });
        
        updatedCount++;
      }
    }

    // Clear Redis cache
    await clearApiCache("GET:*/media*");
    
    res.json({
      message: `Updated ${updatedCount} media files with correct WebP information`,
      updated: updatedCount
    });

  } catch (error) {
    console.error("Error updating database:", error);
    res.status(500).json({ error: "Failed to update database" });
  }
}));

export default router;