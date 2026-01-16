import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import path from "path";
import fs from "fs";

const router = Router();

function deleteNonWebPImages(dirPath: string): string[] {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.jfif'];
  const deletedFiles: string[] = [];

  if (!fs.existsSync(dirPath)) {
    return deletedFiles;
  }

  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      continue;
    }
    
    const fileExt = path.extname(file).toLowerCase();
    
    if (imageExtensions.includes(fileExt)) {
      try {
        fs.unlinkSync(filePath);
        deletedFiles.push(path.relative(path.join(process.cwd(), "public/uploads"), filePath));
        console.log(`Deleted non-WebP file: ${file}`);
      } catch (error) {
        console.error(`Failed to delete ${file}:`, error);
      }
    }
  }
  
  return deletedFiles;
}

router.delete("/cleanup-all-originals", asyncHandler(async (_req, res) => {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  
  if (!fs.existsSync(uploadsDir)) {
    return res.json({ message: "Uploads directory not found", deleted: [] });
  }

  const allDeleted: string[] = [];

  try {
    // Clean main uploads directory
    const mainDeleted = deleteNonWebPImages(uploadsDir);
    allDeleted.push(...mainDeleted);
    
    // Clean avatars subdirectory
    const avatarsDir = path.join(uploadsDir, "avatars");
    const avatarDeleted = deleteNonWebPImages(avatarsDir);
    allDeleted.push(...avatarDeleted);
    
    // Clean thumbnails subdirectory
    const thumbnailsDir = path.join(uploadsDir, "thumbnails");
    const thumbnailDeleted = deleteNonWebPImages(thumbnailsDir);
    allDeleted.push(...thumbnailDeleted);

    res.json({
      message: `Cleanup completed. Deleted ${allDeleted.length} non-WebP files.`,
      deleted: allDeleted
    });

  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({ error: "Failed to cleanup files" });
  }
}));

export default router;