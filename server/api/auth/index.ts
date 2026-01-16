// server/api/auth/index.ts
import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middleware/errorHandler";
import * as authService from "../../services/authService";
import { createSuccessResponse } from "../../../shared/types/api-responses";
import { scheduleUserDeletionSchema } from "../../../shared/types/deletion";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware";
import { authRateLimiter } from "../../middleware/security";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';


const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    });

    const validatedData = schema.parse(req.body);
    await authService.registerUser(validatedData);

    // In a real app, send verification email here

    res.status(201).json(createSuccessResponse(
      null,
      "User registered. Please check your email to verify your account."
    ));
  })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    console.log('Login request body:', req.body);
    
    const schema = z.object({
      username: z.string(),
      password: z.string(),
    });

    try {
      const validatedData = schema.parse(req.body);
      console.log('Validated data:', { username: validatedData.username, password: '[HIDDEN]' });
      
      const user = await authService.authenticateUser(
        validatedData.username,
        validatedData.password
      );

      if (!user) {
        console.log('Authentication failed: user not found or invalid password');
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is blocked
      if (user.isBlocked) {
        console.log('Authentication failed: user is blocked');
        return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      console.log('Login successful for user:', user.username);
      res.json(createSuccessResponse({ user, token }, 'Login successful'));
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Login failed" });
    }
  })
);

// Logout
router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json(createSuccessResponse(null, "Logged out successfully"));
  })
);

// Verify email
router.get(
  "/verify/:token",
  asyncHandler(async (req, res) => {
    const user = await authService.verifyUser(req.params.token);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    // Generate JWT token for verified user
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ message: "Email verified successfully", user, token });
  })
);

// Request password reset
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
    });

    const validatedData = schema.parse(req.body);
    await authService.initiatePasswordReset(
      validatedData.email
    );

    // Always return success to prevent email enumeration
    res.json({
      message:
        "If your email exists in our system, you will receive a password reset link",
    });
  })
);

// Reset password
router.post(
  "/reset-password/:token",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      password: z.string().min(8),
    });

    const validatedData = schema.parse(req.body);
    const success = await authService.resetPassword(
      req.params.token,
      validatedData.password
    );

    if (!success) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    res.json({ message: "Password reset successfully" });
  })
);

// Validate token
router.get(
  "/validate-token",
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      res.json({ valid: true, userId: decoded.userId, role: decoded.role });
    } catch (error) {
      res.status(401).json({ valid: false, message: "Invalid token" });
    }
  })
);

// Get current user
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      
      // Fetch fresh user data from database
      const { storage } = await import("../../services/storage");
      const freshUser = await storage.getUserById(decoded.userId);
      
      if (!freshUser) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json({ user: freshUser });
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  })
);

// Update avatar
router.put(
  "/avatar",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const schema = z.object({
        profileImageUrl: z.string().nullable(),
      });

      const validatedData = schema.parse(req.body);
      
      let processedImageUrl = validatedData.profileImageUrl;
      
      // Process base64 image data if provided
      if (validatedData.profileImageUrl && validatedData.profileImageUrl.startsWith('data:image/')) {
        try {
          processedImageUrl = await authService.processAvatarImage(
            validatedData.profileImageUrl,
            req.user.id
          );
          console.log('Avatar processed successfully:', processedImageUrl);
        } catch (error) {
          console.error('Avatar processing failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to process avatar image';
          return res.status(400).json({ message: errorMessage });
        }
      }
      
      const user = await authService.updateUserAvatar(
        req.user.id,
        processedImageUrl
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // User data updated in database
      
      // Clear user-related caches
      const { clearApiCache } = await import("../../middleware/apiCache");
      await clearApiCache("*users*");
      await clearApiCache("*auth*");
      await clearApiCache(`GET:/api/users/${user.id}`);
      await clearApiCache("GET:/api/auth/me");
      
      // Broadcast WebSocket update for avatar change
      console.log('Broadcasting avatar update via WebSocket for user:', user.id);
      console.log('Avatar URL being broadcast:', user.profileImageUrl);
      const { broadcastUpdate } = await import("../../websocket");
      broadcastUpdate((global as any).wss, 'user_updated', user);
      
      res.json({ user });
    } catch (error) {
      console.error('Avatar update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update avatar';
      return res.status(500).json({ message: errorMessage });
    }
  })
);

// Update profile
router.put(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const schema = z.object({
      username: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      emailNotifications: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
    });

    const validatedData = schema.parse(req.body);
    const user = await authService.updateUserProfile(
      req.user.id,
      validatedData
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // User data updated in database
    
    // Clear user-related caches
    const { clearApiCache } = await import("../../middleware/apiCache");
    await clearApiCache("*users*");
    await clearApiCache("*auth*");
    await clearApiCache(`GET:/api/users/${user.id}`);
    await clearApiCache("GET:/api/auth/me");
    
    // Broadcast WebSocket update for profile change
    console.log('Broadcasting profile update via WebSocket for user:', user.id);
    const { broadcastUpdate } = await import("../../websocket");
    broadcastUpdate((global as any).wss, 'user_updated', user);
    
    res.json({ user });
  })
);

// Change password
router.put(
  "/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    });

    const validatedData = schema.parse(req.body);
    const success = await authService.changeUserPassword(
      req.user.id,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    if (!success) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    res.json({ message: "Password updated successfully" });
  })
);

// Schedule user deletion
router.post(
  "/schedule-deletion",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const validatedData = scheduleUserDeletionSchema.parse(req.body);
    const userId = req.user.id;
    
    const success = await authService.scheduleUserDeletion(
      userId,
      validatedData.reason
    );

    if (!success) {
      return res.status(500).json({ message: "Failed to schedule account deletion" });
    }

    // Get updated user data for WebSocket broadcast
    const { storage } = await import("../../services/storage");
    const updatedUser = await storage.getUserById(userId);
    
    // Broadcast WebSocket update with full user data
    const { broadcastUpdate } = await import("../../websocket");
    if (updatedUser) {
      broadcastUpdate((global as any).wss, 'user_updated', updatedUser);
    }
    
    broadcastUpdate((global as any).wss, 'user_deletion_scheduled', {
      userId,
      deletionScheduledAt: new Date(),
      deletionReason: validatedData.reason
    });

    res.json({ message: "Account scheduled for deletion in 24 hours" });
  })
);

// Get deletion status
router.get(
  "/deletion-status",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const status = await authService.getUserDeletionStatus(userId);

    if (!status) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(status);
  })
);

// Cancel user deletion (admin only)
router.post(
  "/users/:userId/cancel-deletion",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const success = await authService.cancelUserDeletion(req.params.userId);

    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get updated user data for WebSocket broadcast
    const { storage } = await import("../../services/storage");
    const updatedUser = await storage.getUserById(req.params.userId);
    
    // Broadcast WebSocket update with full user data
    const { broadcastUpdate } = await import("../../websocket");
    if (updatedUser) {
      broadcastUpdate((global as any).wss, 'user_updated', updatedUser);
    }
    
    broadcastUpdate((global as any).wss, 'user_deletion_cancelled', {
      userId: req.params.userId
    });

    res.json({ message: "Account deletion cancelled successfully" });
  })
);

// Update user role (admin only)
router.put(
  "/users/:userId/role",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      role: z.enum(["admin", "editor", "user"] as const),
    });

    const validatedData = schema.parse(req.body);
    const user = await authService.updateUserRole(
      req.params.userId,
      validatedData.role
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  })
);

// Verify user email (admin only)
router.post(
  "/users/:userId/verify-email",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { storage } = await import("../../services/storage");
    const user = await storage.verifyUserEmail(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Broadcast WebSocket update
    const { broadcastUpdate } = await import("../../websocket");
    broadcastUpdate((global as any).wss, 'user_updated', user);

    res.json({ user, message: "Email verified successfully" });
  })
);



export default router;