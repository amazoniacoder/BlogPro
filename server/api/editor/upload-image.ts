import { Router } from "express";
import { storage } from "../../services/storage";
import { asyncHandler } from "../../middleware/errorHandler";
import { BadRequestError } from "../../../shared/utils/errors";
import { getFileCategory, getUploadPath, isSupportedFileType } from "../../../shared/utils/media";
import { clearApiCache } from "../../middleware/apiCache";
import { broadcastMediaUpdate, broadcastCacheInvalidation } from "../../websocket";
import { cleanupEditorDirectory } from "../../utils/editorCleanup";
import cleanupRouter from "./cleanup";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const router = Router();

// Use cleanup router
router.use(cleanupRouter);

// Run cleanup on module load to remove any orphaned files
cleanupEditorDirectory().catch(error => {
  console.error('Failed to run editor cleanup on startup:', error);
});

// Configure multer for editor image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = path.join(process.cwd(), "public/uploads/editor/images");
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (_, file, cb) => {
      // Generate unique filename
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for editor images
  },
  fileFilter: (_req, file, cb) => {
    // Only allow images for editor
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files are allowed for editor uploads'));
    }
  }
});

// Upload image for text editor
router.post("/", upload.single("image"), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No image uploaded");
  }
  
  const file = req.file;
  const originalName = file.originalname;
  let mimeType = file.mimetype;
  let size = file.size;
  const source = 'editor';
  
  // Validate file type
  if (!isSupportedFileType(mimeType) || !mimeType.startsWith('image/')) {
    throw new BadRequestError(`Unsupported image type: ${mimeType}`);
  }
  
  const category = getFileCategory(mimeType);
  const folderPath = getUploadPath(mimeType, source);
  
  // Process image - convert to WebP
  let url: string, thumbnailUrl: string;
  let filename: string = '';
  
  try {
    // Generate WebP filename
    const filenameWithoutExt = path.parse(file.filename).name;
    filename = `${filenameWithoutExt}.webp`;
    const webpPath = path.join(process.cwd(), "public/uploads/editor/images", filename);
    
    console.log(`Converting ${file.path} to WebP: ${webpPath}`);
    
    // Convert to WebP with proportional resize (not cropping)
    const webpInfo = await sharp(file.path)
      .resize(300, 300, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 }) // Match Media Library quality
      .toFile(webpPath);
    
    console.log(`WebP conversion successful, size: ${webpInfo.size}`);
    
    // Update metadata
    mimeType = 'image/webp';
    size = webpInfo.size;
    url = `/uploads/editor/images/${filename}`;
    thumbnailUrl = url; // Same as main URL since we only have one file
    
    // Delete original files asynchronously with enhanced retry mechanism
    process.nextTick(async () => {
      const { cleanupSpecificFileInDirectory } = await import("../../utils/mediaCleanup");
      
      try {
        // Longer delay for Windows file locking (especially JFIF/JPG files)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Delete the temporary multer file
        if (fs.existsSync(file.path)) {
          await fs.promises.unlink(file.path);
          console.log(`Editor: Original temp file deleted: ${file.path}`);
        }
        
        // Retry mechanism for stubborn files (JFIF/JPG often need multiple attempts)
        let success = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          success = await cleanupSpecificFileInDirectory(file.filename, folderPath);
          if (success) {
            console.log(`Editor: Original file deleted on attempt ${attempt}: ${file.filename}`);
            break;
          } else {
            console.log(`Editor: Cleanup attempt ${attempt} failed for: ${file.filename}`);
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
            }
          }
        }
        
        if (!success) {
          console.error(`Editor: All cleanup attempts failed for: ${file.filename}`);
        }
      } catch (deleteError) {
        console.log(`Editor: Could not delete original files: ${deleteError}`);
      }
    });
    
    // Verify cleanup success
    setTimeout(async () => {
      const originalPath = path.join(process.cwd(), "public", folderPath, file.filename);
      if (fs.existsSync(originalPath)) {
        console.error(`EDITOR CLEANUP FAILED: Original file still exists: ${originalPath}`);
      } else {
        console.log(`EDITOR CLEANUP SUCCESS: Original file deleted: ${originalPath}`);
      }
    }, 2000);
    
  } catch (error) {
    console.error("Editor image processing failed:", error instanceof Error ? error.message : String(error));
    console.error("Sharp error details:", error);
    
    // Try basic conversion without resize
    try {
      // Generate filename for fallback
      const filenameWithoutExt = path.parse(file.filename).name;
      filename = `${filenameWithoutExt}.webp`;
      
      const basicWebpPath = path.join(process.cwd(), "public/uploads/editor/images", filename);
      const basicWebpInfo = await sharp(file.path)
        .webp({ quality: 80 })
        .toFile(basicWebpPath);
      
      mimeType = 'image/webp';
      size = basicWebpInfo.size;
      url = `/uploads/editor/images/${filename}`;
      thumbnailUrl = url;
      
      // Same enhanced cleanup for fallback scenario
      process.nextTick(async () => {
        const { cleanupSpecificFileInDirectory } = await import("../../utils/mediaCleanup");
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (fs.existsSync(file.path)) {
            await fs.promises.unlink(file.path);
          }
          
          // Retry mechanism for fallback scenario
          let success = false;
          for (let attempt = 1; attempt <= 3; attempt++) {
            success = await cleanupSpecificFileInDirectory(file.filename, folderPath);
            if (success) {
              console.log(`Editor: Original file deleted on attempt ${attempt} (fallback): ${file.filename}`);
              break;
            } else {
              console.log(`Editor: Fallback cleanup attempt ${attempt} failed for: ${file.filename}`);
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (!success) {
            console.error(`Editor: All fallback cleanup attempts failed for: ${file.filename}`);
          }
        } catch (deleteError) {
          console.log(`Editor: Could not delete original files (fallback): ${deleteError}`);
        }
      });
      
      // Verify fallback cleanup success
      setTimeout(async () => {
        const originalPath = path.join(process.cwd(), "public", folderPath, file.filename);
        if (fs.existsSync(originalPath)) {
          console.error(`EDITOR FALLBACK CLEANUP FAILED: Original file still exists: ${originalPath}`);
        } else {
          console.log(`EDITOR FALLBACK CLEANUP SUCCESS: Original file deleted: ${originalPath}`);
        }
      }, 2000);
      
      console.log("Basic WebP conversion successful");
    } catch (basicError) {
      console.error("Basic WebP conversion also failed:", basicError);
      // Final fallback
      filename = file.filename;
      url = `/uploads/editor/images/${filename}`;
      thumbnailUrl = url;
    }
  }
  
  // Save to database
  const mediaFile = await storage.createMediaFile({
    filename,
    originalName,
    mimeType,
    size,
    url,
    thumbnailUrl,
    category,
    source,
    folderPath
  });
  
  // Clear cache after editor upload
  await clearApiCache("GET:/api/media");
  
  // Broadcast editor media upload event via WebSocket
  broadcastMediaUpdate('uploaded', mediaFile);
  broadcastCacheInvalidation(['GET:/api/media']);
  
  res.status(201).json({
    id: mediaFile.id,
    url: mediaFile.url,
    thumbnailUrl: mediaFile.thumbnailUrl,
    filename: mediaFile.filename,
    originalName: mediaFile.originalName,
    size: mediaFile.size,
    success: true
  });
}));

export default router;