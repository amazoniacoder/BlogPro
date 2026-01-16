import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();

// Serve uploaded files directly
router.get("/*", (req, res) => {
  const filePath = path.join(process.cwd(), "public/uploads", req.path);
  
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send("File not found");
  }
});

export default router;