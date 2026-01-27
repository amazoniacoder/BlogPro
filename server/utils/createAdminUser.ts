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
      .where(or(eq(users.username, 'Gena'), eq(users.email, 'genavinogradov@gmail.com')));

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('H76&9j_+867#$', 10);
    
    await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        username: 'Gena',
        email: 'genavinogradov@gmail.com',
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
    console.log('   Login: Gena');
    console.log('   Password: H76&9j_+867#$');
    console.log('   Email: genavinogradov@gmail.com');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  }
}