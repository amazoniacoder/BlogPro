import { Router } from "express";
import { storage } from "../../services/storage";
import { asyncHandler } from "../../middleware/errorHandler";
import { BadRequestError, NotFoundError } from "../../../shared/utils/errors";
import { getFileCategory, getUploadPath, isSupportedFileType } from "../../../shared/utils/media";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

import cleanupRouter from "./cleanup-endpoint";
import cleanupOriginalsRouter from "./cleanup-originals";
import cleanupAllOriginalsRouter from "./cleanup-all-originals";
import updateDatabaseRouter from "./update-database";
import bulkOperationsRouter from "./bulk-operations";
import { apiCache, clearApiCache } from "../../middleware/apiCache";
import { broadcastMediaUpdate, broadcastCacheInvalidation } from "../../websocket";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const source = req.body.source || 'general';
      const uploadPath = getUploadPath(file.mimetype, source);
      const uploadDir = path.join(process.cwd(), "public", uploadPath);
      
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Use the cleanup routers (before /:id route)
router.use(cleanupRouter);
router.use(cleanupOriginalsRouter);
router.use(cleanupAllOriginalsRouter);
router.use(updateDatabaseRouter);
router.use(bulkOperationsRouter);

// Get all media files (pagination removed)
router.get("/", apiCache({ ttl: 300 }), asyncHandler(async (_req, res) => {
  const mediaFiles = await storage.getMediaFiles();
  
  // Verify file existence and update URLs if needed
  const verifiedData = await Promise.all(mediaFiles.map(async (file) => {
    // Check if the file exists on disk
    const filePath = path.join(process.cwd(), "public", file.url.replace(/^\//, ''));
    const thumbnailPath = file.thumbnailUrl ? 
      path.join(process.cwd(), "public", file.thumbnailUrl.replace(/^\//, '')) : null;
    
    const fileExists = fs.existsSync(filePath);
    const thumbnailExists = thumbnailPath ? fs.existsSync(thumbnailPath) : false;
    
    console.log(`File ${file.filename} exists: ${fileExists}, thumbnail exists: ${thumbnailExists}`);
    
    return {
      ...file,
      url: fileExists ? file.url : '/images/placeholder-image.png',
      thumbnailUrl: thumbnailExists ? file.thumbnailUrl : (fileExists ? file.url : '/images/placeholder-image.png')
    };
  }));
  
  res.json(verifiedData);
}));

// Get media file by ID
router.get("/:id", apiCache({ ttl: 300 }), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    throw new BadRequestError("Invalid media file ID");
  }
  
  const mediaFile = await storage.getMediaFile(id);
  
  if (!mediaFile) {
    throw new NotFoundError("Media file not found");
  }
  
  res.json(mediaFile);
}));

// Upload avatar (specific endpoint for user avatars)
router.post("/upload", upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No file uploaded");
  }
  
  const file = req.file;
  
  // Process avatar image
  try {
    // Create avatars directory if it doesn't exist
    const avatarsDir = path.join(process.cwd(), "public/uploads/avatars");
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }
    
    // Generate WebP filename
    const filenameWithoutExt = path.parse(file.filename).name;
    const filename = `${filenameWithoutExt}.webp`;
    const webpPath = path.join(avatarsDir, filename);
    
    // Convert to WebP and resize to standard avatar size
    await sharp(file.path)
      .resize(200, 200, { fit: "cover" })
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    // Delete original file after conversion
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Return the URL
    const url = `/uploads/avatars/${filename}`;
    
    res.status(201).json({ 
      url,
      success: true
    });
  } catch (error) {
    console.error("Failed to process avatar:", error);
    throw new BadRequestError("Failed to process avatar image");
  }
}));

// Upload new media file
router.post("/", upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No file uploaded");
  }
  
  const file = req.file;
  const originalName = file.originalname;
  let mimeType = file.mimetype;
  let size = file.size;
  const source = req.body.source || 'general';
  
  // Validate file type
  if (!isSupportedFileType(mimeType)) {
    throw new BadRequestError(`Unsupported file type: ${mimeType}`);
  }
  
  const category = getFileCategory(mimeType);
  const folderPath = getUploadPath(mimeType, source);
  
  // Process images - convert to WebP
  let url, thumbnailUrl, filename;
  
  if (mimeType.startsWith("image/")) {
    // Generate WebP filename
    const filenameWithoutExt = path.parse(file.filename).name;
    filename = `${filenameWithoutExt}.webp`;
    
    // Use the SAME directory where multer saved the file (categorized directory)
    const uploadDir = path.join(process.cwd(), "public", folderPath);
    const webpPath = path.join(uploadDir, filename);
    
    // Create thumbnails directory
    const thumbnailsDir = path.join(process.cwd(), "public/uploads/thumbnails");
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    try {
      console.log(`Converting ${file.path} to WebP: ${webpPath}`);
      
      // Convert to WebP and get metadata
      const webpInfo = await sharp(file.path)
        .webp({ quality: 80 })
        .toFile(webpPath);
      
      console.log(`WebP conversion successful, size: ${webpInfo.size}`);
      
      // Create WebP thumbnail
      const thumbnailFilename = `thumbnails/${filenameWithoutExt}_thumb.webp`;
      const thumbnailPath = path.join(process.cwd(), "public/uploads", thumbnailFilename);
      
      await sharp(file.path)
        .resize(200, 200, { fit: "cover" })
        .webp({ quality: 70 })
        .toFile(thumbnailPath);
      
      console.log(`Thumbnail created: ${thumbnailPath}`);
      
      // Update metadata with WebP info
      mimeType = 'image/webp';
      size = webpInfo.size;
      url = `/${folderPath}/${filename}`;
      thumbnailUrl = `/uploads/${thumbnailFilename}`;
      
      // Delete original files asynchronously using Windows-compatible method
      process.nextTick(async () => {
        const { cleanupSpecificFileInDirectory } = await import("../../utils/mediaCleanup");
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Delete the temporary multer file
          if (fs.existsSync(file.path)) {
            await fs.promises.unlink(file.path);
            console.log(`Original temp file deleted: ${file.path}`);
          }
          
          // Delete the original uploaded file using Windows-compatible method in correct directory
          const success = await cleanupSpecificFileInDirectory(file.filename, folderPath);
          if (success) {
            console.log(`Original uploaded file deleted: ${file.filename} from ${folderPath}`);
          } else {
            console.log(`Could not delete original file: ${file.filename} from ${folderPath}`);
          }
        } catch (deleteError) {
          console.log(`Could not delete original files: ${deleteError}`);
        }
      });
      
    } catch (error) {
      console.error("WebP conversion failed:", error instanceof Error ? error.message : String(error));
      console.error("Sharp error details:", error);
      
      // Try basic conversion without options
      try {
        const basicWebpInfo = await sharp(file.path)
          .webp()
          .toFile(webpPath);
        
        // Simple thumbnail
        const thumbnailFilename = `thumbnails/${filenameWithoutExt}_thumb.webp`;
        const thumbnailPath = path.join(process.cwd(), "public/uploads", thumbnailFilename);
        
        await sharp(file.path)
          .resize(200, 200)
          .webp()
          .toFile(thumbnailPath);
        
        mimeType = 'image/webp';
        size = basicWebpInfo.size;
        url = `/${folderPath}/${filename}`;
        thumbnailUrl = `/uploads/${thumbnailFilename}`;
        
        setTimeout(async () => {
          const { cleanupSpecificFileInDirectory } = await import("../../utils/mediaCleanup");
          
          try {
            // Delete the temporary multer file
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            
            // Delete the original uploaded file using Windows-compatible method in correct directory
            const success = await cleanupSpecificFileInDirectory(file.filename, folderPath);
            if (success) {
              console.log(`Original uploaded file deleted: ${file.filename} from ${folderPath}`);
            } else {
              console.log(`Could not delete original file: ${file.filename} from ${folderPath}`);
            }
          } catch (deleteError) {
            console.log(`Could not delete original files: ${deleteError}`);
          }
        }, 100);
        
        console.log("Basic WebP conversion successful");
      } catch (basicError) {
        console.error("Basic WebP conversion also failed:", basicError);
        // Final fallback
        filename = file.filename;
        url = `/${folderPath}/${filename}`;
        thumbnailUrl = url;
      }
    }
  } else {
    // For non-image files, keep as is
    filename = file.filename;
    url = `/${folderPath}/${filename}`;
    thumbnailUrl = url;
  }
  

  
  // Save to database with correct filename and categorization
  const mediaFile = await storage.createMediaFile({
    filename, // This is the WebP filename
    originalName, // This is the original uploaded filename
    mimeType,
    size,
    url,
    thumbnailUrl,
    category,
    source,
    folderPath
  });
  
  console.log(`Database saved: filename=${filename}, originalName=${originalName}, url=${url}`);
  
  // Immediate cleanup for image files after successful database save
  if (mimeType.startsWith("image/") && filename.endsWith('.webp') && file.filename !== filename) {
    process.nextTick(async () => {
      const { cleanupSpecificFileInDirectory } = await import("../../utils/mediaCleanup");
      const success = await cleanupSpecificFileInDirectory(file.filename, folderPath);
      if (success) {
        console.log(`Immediate cleanup: Original uploaded file deleted: ${file.filename} from ${folderPath}`);
      } else {
        console.log(`Immediate cleanup failed, will retry later: ${file.filename} from ${folderPath}`);
      }
    });
  }
  
  // Clear cache after upload
  await clearApiCache("GET:/api/media");
  
  // Broadcast media upload event via WebSocket
  broadcastMediaUpdate('uploaded', mediaFile);
  broadcastCacheInvalidation(['GET:/api/media']);
  
  res.status(201).json(mediaFile);
}));

// Delete media file
router.delete("/:id", asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    throw new BadRequestError("Invalid media file ID");
  }
  
  // Get file info before deletion
  const mediaFile = await storage.getMediaFile(id);
  
  if (!mediaFile) {
    throw new NotFoundError("Media file not found");
  }
  
  // Delete from database
  const deleted = await storage.deleteMediaFile(id);
  
  if (!deleted) {
    throw new NotFoundError("Media file not found");
  }
  
  // Delete physical files from correct categorized directories
  try {
    // Delete main file from its categorized directory
    const filePath = path.join(process.cwd(), "public", mediaFile.folderPath || 'uploads', mediaFile.filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`Deleted main file: ${mediaFile.filename} from ${mediaFile.folderPath}`);
    }
    
    // Delete thumbnail from thumbnails directory
    if (mediaFile.thumbnailUrl && mediaFile.thumbnailUrl !== mediaFile.url) {
      const thumbnailPath = path.join(process.cwd(), "public", mediaFile.thumbnailUrl.replace(/^\//, ''));
      if (fs.existsSync(thumbnailPath)) {
        await fs.promises.unlink(thumbnailPath);
        console.log(`Deleted thumbnail: ${mediaFile.thumbnailUrl}`);
      }
    }
    
    // Delete any corresponding original files in the same categorized directory
    const filenameWithoutExt = path.parse(mediaFile.filename).name;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.jfif'];
    
    for (const ext of imageExtensions) {
      const originalFilename = `${filenameWithoutExt}${ext}`;
      const originalPath = path.join(process.cwd(), "public", mediaFile.folderPath || 'uploads', originalFilename);
      
      if (fs.existsSync(originalPath)) {
        try {
          await fs.promises.unlink(originalPath);
          console.log(`Deleted corresponding original file: ${originalFilename} from ${mediaFile.folderPath}`);
        } catch (deleteError) {
          console.log(`Could not delete original file: ${originalPath}`);
        }
      }
    }
  } catch (error) {
    console.error("Failed to delete file from disk:", error);
  }
  
  // Clear cache after deletion
  await clearApiCache("GET:*/media*");
  
  // Broadcast media deletion event via WebSocket
  broadcastMediaUpdate('deleted', { id: mediaFile.id, url: mediaFile.url, category: mediaFile.category, source: mediaFile.source });
  broadcastCacheInvalidation(['GET:/api/media']);
  
  // Add cache invalidation headers to force browser refresh
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.json({ 
    message: "Media file deleted successfully",
    deletedUrl: mediaFile.url,
    timestamp: Date.now() // For cache busting
  });
}));

export default router;