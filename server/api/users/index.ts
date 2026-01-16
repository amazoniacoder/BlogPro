import { Router } from "express";
import { storage } from "../../services/storage";

import { asyncHandler } from "../../middleware/errorHandler";
import { BadRequestError, NotFoundError } from "../../../shared/utils/errors";
import { requireAdmin } from "../../middleware/authMiddleware";
import { clearApiCache } from "../../middleware/apiCache";
import { broadcastUpdate } from "../../websocket";
import { db } from "../../db/db";
import { users } from "../../../shared/types/schema";
import { eq, ilike, or } from "drizzle-orm";

// Get mailing list recipients from database
const getMailingListUsers = async (mailingListId: number) => {
  try {
    // Direct database query for mailing list recipients
    const result = await db.execute(`
      SELECT user_id FROM mailing_list_recipients 
      WHERE mailing_list_id = ${mailingListId}
    `);
    
    return result.rows.map((row: any) => row.user_id);
  } catch (error) {
    console.log('Could not fetch mailing list recipients:', error);
    return [];
  }
};

const router = Router();

// Get all users with pagination (admin only)
router.get("/", requireAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { data, total, totalPages } = await storage.getUsersPaginated(page, limit);
  
  // Remove sensitive information
  const sanitizedUsers = data.map(user => {
    const { password, resetPasswordToken, verificationToken, ...safeUser } = user;
    return safeUser;
  });
  
  // Add cache-busting headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.json({ data: sanitizedUsers, total, totalPages });
}));

// GET /api/users/for-mailing - Get users available for mailing
router.get("/for-mailing", requireAdmin, asyncHandler(async (req, res) => {
  // Add cache-busting headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  const { search, mailingListId } = req.query;
  
  if (mailingListId && mailingListId !== 'all') {
    // Get user IDs subscribed to specific mailing list
    const subscribedUserIds = await getMailingListUsers(parseInt(mailingListId as string));
    
    if (subscribedUserIds.length === 0) {
      res.json([]);
      return;
    }
    
    // Get user details for all subscribed users
    const subscribedUsers = await db.select({
      id: users.id,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      marketingEmails: users.marketingEmails
    })
    .from(users)
    .where(or(...subscribedUserIds.map(userId => eq(users.id, userId))))
    
    res.json(subscribedUsers);
    return;
  }
  
  // Get all users
  let query = db.select({
    id: users.id,
    username: users.username,
    firstName: users.firstName,
    lastName: users.lastName,
    email: users.email,
    role: users.role,
    emailVerified: users.emailVerified,
    marketingEmails: users.marketingEmails
  }).from(users);
  
  if (search) {
    query = query.where(
      or(
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    ) as typeof query;
  }
  
  const userList = await query;
  res.json(userList);
}));

// Get user by ID (admin only)
router.get("/:id", requireAdmin, asyncHandler(async (req, res) => {
  // Add cache-busting headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  const id = req.params.id;
  
  const user = await storage.getUserById(id);
  
  if (!user) {
    throw new NotFoundError("User not found");
  }
  
  // Remove sensitive information
  const { password, resetPasswordToken, verificationToken, ...safeUser } = user;
  
  res.json(safeUser);
}));

// Create new user (admin only)
router.post("/", requireAdmin, asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role, username, profileImageUrl } = req.body;
  
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }
  
  try {
    const user = await storage.createUser({
      email,
      password,
      firstName,
      lastName,
      role: role || "user",
      username,
      profileImageUrl
    });
    
    // Clear cache for users endpoints
    await clearApiCache("GET:/api/users");
    
    // Broadcast WebSocket update (sanitize large data)
    const sanitizedUser = {
      ...user,
      profileImageUrl: user.profileImageUrl?.startsWith('data:') ? '[base64 image data]' : user.profileImageUrl
    };
    broadcastUpdate((global as any).wss, 'user_created', sanitizedUser);
    
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      throw new BadRequestError("User with this email already exists");
    }
    throw error;
  }
}));

// Update user (admin only)
router.put("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  
  try {
    const user = await storage.updateUser(id, updateData);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }
    
    // Update session if this user is currently logged in
    if ((req.session as any).user && (req.session as any).user.id === id) {
      (req.session as any).user = user;
    }
    
    // Clear all user-related caches with correct patterns
    await clearApiCache("GET:/api/users*");
    await clearApiCache(`GET:/api/users/${id}`);
    await clearApiCache("GET:/api/auth/me");
    await clearApiCache("*auth*");
    await clearApiCache("*users*");
    
    // Broadcast WebSocket update with actual image URL
    broadcastUpdate((global as any).wss, 'user_updated', user);
    
    res.json(user);
  } catch (error) {
    console.error('Users API error:', error);
    throw error;
  }
}));

// Delete user (admin only)
router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  const deleted = await storage.deleteUser(id);
  
  if (!deleted) {
    throw new NotFoundError("User not found");
  }
  
  // Clear cache for users endpoints
  await clearApiCache("GET:/api/users");
  await clearApiCache(`GET:/api/users/${id}`);
  
  // Broadcast WebSocket update
  broadcastUpdate((global as any).wss, 'user_deleted', { userId: id });
  
  res.json({ message: "User deleted successfully" });
}));

export default router;