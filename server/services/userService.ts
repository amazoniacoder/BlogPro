// server/services/userService.ts
import { db } from "../db/db";
import { users, sessions } from "../../shared/types/schema";
import { eq, like } from "drizzle-orm";
// Create User type from the users table
type User = typeof users.$inferSelect;
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await db
      .select()
      .from(users as any)
      .orderBy(users.createdAt as any);

    // Don't return passwords
    return result.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUsersPaginated(page: number = 1, limit: number = 10): Promise<{ data: User[], total: number, totalPages: number }> {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const allUsers = await db.select().from(users as any);
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated data
    const result = await db
      .select()
      .from(users as any)
      .orderBy(users.createdAt as any)
      .limit(limit)
      .offset(offset);
    
    // Don't return passwords
    const data = result.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
    
    return {
      data,
      total,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching paginated users:', error);
    return {
      data: [],
      total: 0,
      totalPages: 1
    };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users as any)
    .where(eq(users.id as any, userId)) as any[];

  if (result.length === 0) {
    return null;
  }

  // Don't return password
  const { password: _, ...userWithoutPassword } = result[0];
  return userWithoutPassword as User;
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "editor" | "user";
  status?: string;
  isActive?: boolean;
  isBlocked?: boolean;
  username?: string;
  profileImageUrl?: string;
}): Promise<User> {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Determine username if not provided
    const username = data.username || 
                     data.firstName || 
                     (data.email ? data.email.split('@')[0] : null);
    
    // Determine isBlocked status
    let isBlocked = false;
    if (data.isBlocked !== undefined) {
      isBlocked = data.isBlocked;
    } else if (data.isActive !== undefined) {
      isBlocked = !data.isActive;
    } else if (data.status !== undefined) {
      isBlocked = data.status !== 'active';
    }
    
    // Create the user
    const result = await db
      .insert(users as any)
      .values({
        id: uuidv4(),
        username: username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        role: data.role || "user",
        isBlocked: isBlocked,
        emailVerified: false,
        profileImageUrl: data.profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning() as any[];

    if (result.length === 0) {
      throw new Error("Failed to create user");
    }

    // Don't return password
    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: "admin" | "editor" | "user";
    emailNotifications?: boolean;
    marketingEmails?: boolean;
    projectUpdates?: boolean;
    username?: string;
    isBlocked?: boolean;
    password?: string;
    profileImageUrl?: string;
    status?: string;
    isActive?: boolean;
  }
): Promise<User | null> {
  try {
    // Create update object with only provided fields
    const updateData: any = {};
    
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.emailNotifications !== undefined) updateData.emailNotifications = data.emailNotifications;
    if (data.marketingEmails !== undefined) updateData.marketingEmails = data.marketingEmails;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.isBlocked !== undefined) updateData.isBlocked = data.isBlocked;
    if (data.profileImageUrl !== undefined) updateData.profileImageUrl = data.profileImageUrl;
    
    // Handle status field - convert to isBlocked
    if (data.status !== undefined) {
      updateData.isBlocked = data.status !== 'active';
    }
    
    // Handle isActive field - convert to isBlocked
    if (data.isActive !== undefined) {
      updateData.isBlocked = !data.isActive;
    }
    
    // If password is provided, hash it
    if (data.password && data.password.trim()) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    // Always update the timestamp
    updateData.updatedAt = new Date();
    
    const result = await db
      .update(users as any)
      .set(updateData)
      .where(eq(users.id as any, userId))
      .returning() as any[];

    if (result.length === 0) {
      return null;
    }

    // Don't return password
    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword as User;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

export async function blockUser(
  userId: string,
  isBlocked: boolean
): Promise<User | null> {
  const result = await db
    .update(users as any)
    .set({ 
      isBlocked,
      updatedAt: new Date()
    })
    .where(eq(users.id as any, userId))
    .returning() as any[];

  if (result.length === 0) {
    return null;
  }

  // Don't return password
  const { password: _, ...userWithoutPassword } = result[0];
  return userWithoutPassword as User;
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // First check if the user exists and is not an admin
    const userToDelete = await getUserById(userId);
    if (!userToDelete) {
      throw new Error("User not found");
    }
    
    if (userToDelete.role === "admin") {
      throw new Error("Administrator accounts cannot be deleted");
    }
    
    // Delete related data first (cascade deletion)
    try {
      // Remove from mailing list recipients
      await db.execute(`DELETE FROM mailing_list_recipients WHERE user_id = '${userId}'`);
      
      // Remove user sessions
      await terminateUserSessions(userId);
    } catch (relatedDataError) {
      console.log("Error deleting related data:", relatedDataError);
      // Continue with user deletion even if related data cleanup fails
    }
    
    // Delete the user
    const result = await db
      .delete(users as any)
      .where(eq(users.id as any, userId))
      .returning() as any[];

    return result.length > 0;
  } catch (error) {
    console.error(`Error in deleteUser service for userId ${userId}:`, error);
    throw error;
  }
}

export async function updateUserSessions(userId: string, updatedUser: any): Promise<void> {
  try {
    // Find all sessions for this user and update them with new user data
    const userSessions = await db
      .select()
      .from(sessions as any)
      .where(like(sessions.sess as any, `%"id":"${userId}"%`))
      .catch(() => []);
    
    for (const session of userSessions) {
      try {
        const sessionData = session.sess;
        if (sessionData && sessionData.user && sessionData.user.id === userId) {
          // Update session with new user data (without password)
          const { password: _, ...userWithoutPassword } = updatedUser;
          sessionData.user = userWithoutPassword;
          
          // Update the session in database
          await db
            .update(sessions as any)
            .set({ sess: sessionData })
            .where(eq(sessions.sid as any, session.sid));
        }
      } catch (sessionError) {
        console.log('Error updating individual session:', sessionError);
      }
    }
  } catch (error) {
    console.log('Error in updateUserSessions:', error);
  }
}

export async function terminateUserSessions(userId: string): Promise<void> {
  try {
    // Find all sessions for this user and delete them
    // Note: This assumes session data contains user ID in a standard format
    // Check if sessions table exists first
    const result = await db.select().from(sessions as any).limit(1).catch(() => null);
    
    // If sessions table doesn't exist or is empty, skip this step
    if (result === null) {
      console.log("Sessions table not available, skipping session termination");
      return;
    }
    
    // Try to delete sessions, but don't fail if it doesn't work
    await db
      .delete(sessions as any)
      .where(like(sessions.sess as any, `%"userId":"${userId}"%`))
      .catch(err => {
        console.log("Error deleting sessions, continuing with user deletion:", err);
      });
  } catch (error) {
    console.log("Error in terminateUserSessions, continuing with user deletion:", error);
    // Don't throw the error, just log it and continue
  }
}

export async function verifyUserEmail(userId: string): Promise<User | null> {
  try {
    const result = await db
      .update(users as any)
      .set({ 
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id as any, userId))
      .returning() as any[];

    if (result.length === 0) {
      return null;
    }

    // Don't return password
    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error verifying user email:', error);
    throw error;
  }
}