import { Router } from "express";
import usersRoutes from "./users";
import { noCache } from "../../middleware/cacheHeaders";

const router = Router();

// Apply no-cache headers to all admin routes
router.use(noCache);

router.use("/users", usersRoutes);

// Add other admin routes here

export default router;