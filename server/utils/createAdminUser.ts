// server/utils/createAdminUser.ts
import { db } from "../db/db";
import { users } from "../../shared/types/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function ensureAdminUserExists(): Promise<void> {
  try {
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(or(eq(users.username, 'admin'), eq(users.email, 'admin@blogpro.local')));

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        username: 'admin',
        email: 'admin@blogpro.local',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        emailVerified: true, // Skip email verification for admin
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

    console.log('✅ Admin user created successfully');
    console.log('   Login: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@blogpro.local');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  }
}