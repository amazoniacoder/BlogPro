// server/api/admin/users.ts
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAdmin } from "../../middleware/authMiddleware";
import * as userService from "../../services/userService";

const router = Router();

// Get all users (admin only)
router.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await userService.getAllUsers();
    res.json({ users });
  })
);

// Get user by ID (admin only)
router.get(
  "/:userId",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user });
  })
);

// Create new user (admin only)
router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      password: z.string().min(8),
      role: z.enum(["admin", "editor", "user"] as const).default("user"),
      status: z.string().optional(),
      isActive: z.boolean().optional(),
      username: z.string().optional(),
      profileImageUrl: z.string().optional(),
    });

    const validatedData = schema.parse(req.body);
    const user = await userService.createUser(validatedData);

    res.status(201).json({ user });
  })
);

// Update user (admin only)
router.put(
  "/:userId",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "editor", "user"] as const).optional(),
      emailNotifications: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      projectUpdates: z.boolean().optional(),
      username: z.string().optional(),
      isBlocked: z.boolean().optional(),
      status: z.string().optional(),
      isActive: z.boolean().optional(),
      password: z.string().min(8).optional(),
      profileImageUrl: z.string().optional(),
    });

    const validatedData = schema.parse(req.body);
    const user = await userService.updateUser(req.params.userId, validatedData);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  })
);

// Block/unblock user (admin only)
router.put(
  "/:userId/block",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      isBlocked: z.boolean(),
    });

    const validatedData = schema.parse(req.body);
    const user = await userService.blockUser(
      req.params.userId,
      validatedData.isBlocked
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If blocking a user, terminate their active sessions
    if (validatedData.isBlocked) {
      await userService.terminateUserSessions(req.params.userId);
    }

    res.json({ 
      user,
      message: validatedData.isBlocked ? "User blocked successfully" : "User unblocked successfully" 
    });
  })
);

// Delete user (admin only)
router.delete(
  "/:userId",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Administrator accounts cannot be deleted" 
      });
    }
    
    try {
      await userService.deleteUser(req.params.userId);
      
      res.json({ 
        success: true,
        message: "User deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  })
);

export default router;