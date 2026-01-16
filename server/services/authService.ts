// server/services/authService.ts
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../db/db";
import { users } from "../../shared/types/schema";

// Define types since they don't exist in schema
type UserRole = 'admin' | 'editor' | 'user';
type User = typeof users.$inferSelect;
import { eq, or } from "drizzle-orm";
import { UserDeletionStatusResponse } from "../../shared/types/deletion";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Account deletion notification email function
async function sendAccountDeletionEmail(email: string, userName: string) {
  try {
    const { emailService } = await import('../services/emailService');
    await emailService.initialize();
    
    // Get email settings to use as sender
    const emailSettings = await emailService.getEmailSettings();
    
    const mailOptions = {
      from: emailSettings.smtpUser,
      to: email,
      subject: '⚠️ Запланировано удаление аккаунта - BlogPro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Deletion Scheduled</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">BlogPro</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Professional Blogging Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px; text-align: center;">
                      <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
                      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Account Deletion Scheduled</h2>
                      <p style="color: #666; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">Hello ${userName},</p>
                      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Your BlogPro account has been scheduled for deletion as requested.</p>
                      
                      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                        <p style="color: #856404; font-size: 14px; margin: 0; font-weight: 600;">⚠️ Important Notice:</p>
                        <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0; line-height: 1.4;">Your account is now locked and you will no longer be able to log in. All your data will remain scheduled for deletion.</p>
                      </div>
                      
                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If you did not request this deletion, please contact our support team immediately.</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">This is an automated notification from BlogPro.</p>
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 BlogPro. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };
    
    if (!emailService.transporter) {
      throw new Error('Email transporter not initialized');
    }
    
    await emailService.transporter.sendMail(mailOptions);
    console.log(`⚠️ Уведомление об удалении учетной записи отправлено: ${email}`);
  } catch (error) {
    console.error('Не удалось отправить удаление аккаунта на email:', error);
    console.log(`\n⚠️ Запланировано удаление учетной записи (сбой в работе службы электронной почты)`);
    console.log(`To: ${email}`);
    console.log(`User: ${userName}`);
  }
}

// Password reset email function
async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.CLIENT_URL || 'https://blogpro.tech'}/reset-password/${token}`;
  
  try {
    const { emailService } = await import('../services/emailService');
    await emailService.initialize();
    
    // Get email settings to use as sender
    const emailSettings = await emailService.getEmailSettings();
    
    const mailOptions = {
      from: emailSettings.smtpUser,
      to: email,
      subject: '🔐 Сбросьте свой пароль BlogPro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Сброс пароля</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">BlogPro</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Professional Blogging Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px; text-align: center;">
                      <div style="font-size: 60px; margin-bottom: 20px;">🔐</div>
                      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Reset Your Password</h2>
                      <p style="color: #666; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">We received a request to reset your password for your BlogPro account.</p>
                      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 40px 0;">Click the button below to create a new password:</p>
                      
                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 50px; transition: all 0.3s ease;">🔑 Reset Password</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 40px 0 0 0;">If the button doesn't work, copy and paste this link:</p>
                      <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0;">${resetUrl}</p>
                      
                      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                        <p style="color: #856404; font-size: 14px; margin: 0; font-weight: 600;">⚠️ Security Notice:</p>
                        <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0; line-height: 1.4;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">This password reset link will expire in 1 hour.</p>
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 BlogPro. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };
    
    if (!emailService.transporter) {
      throw new Error('Email транспортер не инициализирован');
    }
    
    await emailService.transporter.sendMail(mailOptions);
    console.log(`🔐 Password reset email sent to: ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // Fallback to console logging for development
    console.log(`\n🔐 Password Reset Required (Email service failed)`);
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`\nClick the link above to reset your password.\n`);
  }
}

// Email verification function using existing email service
async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.CLIENT_URL || 'https://blogpro.tech'}/verify-email/${token}`;
  
  try {
    const { emailService } = await import('../services/emailService');
    await emailService.initialize();
    
    // Get email settings to use as sender
    const emailSettings = await emailService.getEmailSettings();
    
    const mailOptions = {
      from: emailSettings.smtpUser,
      to: email,
      subject: '🎉 Добро пожаловать в BlogPro — подтвердите свой адрес электронной почты',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">BlogPro</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Professional Blogging Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px; text-align: center;">
                      <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
                      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Welcome to BlogPro!</h2>
                      <p style="color: #666; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for joining our community! We're excited to have you on board.</p>
                      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 40px 0;">To get started, please verify your email address by clicking the button below:</p>
                      
                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 50px; transition: all 0.3s ease;">✨ Verify Email Address</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 40px 0 0 0;">If the button doesn't work, copy and paste this link:</p>
                      <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0;">${verificationUrl}</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">This verification link will expire in 24 hours.</p>
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 BlogPro. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };
    
    if (!emailService.transporter) {
      throw new Error('Email transporter not initialized');
    }
    
    await emailService.transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to: ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Fallback to console logging for development
    console.log(`\n📧 Email Verification Required (Email service failed)`);
    console.log(`To: ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`\nClick the link above to verify your email address.\n`);
  }
}

export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}): Promise<User> {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create user with default role as 'user' if not specified
  const result = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || "user",
      verificationToken,
      emailVerified: false, // Require email verification
    })
    .returning();

  // Send verification email
  await sendVerificationEmail(userData.email, verificationToken);

  return result[0];
}

export async function verifyUser(token: string): Promise<User | null> {
  const result = await db
    .update(users)
    .set({ emailVerified: true, verificationToken: null })
    .where(eq(users.verificationToken, token))
    .returning();

  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<User | null> {
  console.log('Authenticating user:', username);
  
  const result = await db
    .select()
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, username)));

  console.log('Database query result:', result.length > 0 ? 'User found' : 'User not found');
  
  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  console.log('User details:', { id: user.id, username: user.username, emailVerified: user.emailVerified, isBlocked: user.isBlocked });
  
  if (user.isScheduledForDeletion) {
    console.log('Authentication failed: user scheduled for deletion');
    throw new Error("This account is scheduled for deletion and cannot be accessed");
  }
  
  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', passwordMatch);

  if (!passwordMatch) {
    return null;
  }

  if (!user.emailVerified) {
    console.log('Authentication failed: email not verified');
    throw new Error("Please verify your email address before logging in");
  }

  console.log('Authentication successful');
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

export async function initiatePasswordReset(email: string): Promise<boolean> {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour

  const result = await db
    .update(users)
    .set({ resetPasswordToken: resetToken, resetPasswordExpires: resetExpires })
    .where(eq(users.email, email))
    .returning();

  if (result.length > 0) {
    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);
  }

  return result.length > 0;
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const result = await db
    .update(users)
    .set({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    })
    .where(eq(users.resetPasswordToken, token))
    .returning();

  return result.length > 0;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<User | null> {
  const result = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning();

  if (result.length === 0) {
    return null;
  }

  // Don't return password
  const { password: _, ...userWithoutPassword } = result[0];
  return userWithoutPassword as User;
}

export async function updateUserAvatar(
  userId: string,
  profileImageUrl: string | null
): Promise<User | null> {
  try {
    console.log('Updating avatar for user:', userId);
    console.log('Avatar data:', profileImageUrl ? 'URL provided' : 'null (removing)');
    
    // Get current user to check existing avatar
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (currentUser.length === 0) {
      console.log('No user found with ID:', userId);
      return null;
    }
    
    // If removing avatar (setting to null), delete the physical file
    if (profileImageUrl === null && currentUser[0].profileImageUrl) {
      try {
        const currentUrl = currentUser[0].profileImageUrl;
        if (currentUrl.startsWith('/uploads/avatars/')) {
          const filename = path.basename(currentUrl);
          const filePath = path.join(process.cwd(), 'public/uploads/avatars', filename);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted avatar file:', filename);
          }
        }
      } catch (deleteError) {
        console.error('Failed to delete avatar file:', deleteError);
        // Continue with database update even if file deletion fails
      }
    }
    
    const result = await db
      .update(users)
      .set({ 
        profileImageUrl: profileImageUrl,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    console.log('Avatar updated successfully');
    // Don't return password
    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error in updateUserAvatar:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    emailNotifications?: boolean;
    marketingEmails?: boolean;
  }
): Promise<User | null> {
  // Create update object with only provided fields
  const updateData: any = {};
  
  if (data.username !== undefined) updateData.username = data.username;
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.emailNotifications !== undefined) updateData.emailNotifications = data.emailNotifications;
  if (data.marketingEmails !== undefined) updateData.marketingEmails = data.marketingEmails;

  
  // Always update the timestamp
  updateData.updatedAt = new Date();
  
  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  if (result.length === 0) {
    return null;
  }

  // Don't return password
  const { password: _, ...userWithoutPassword } = result[0];
  return userWithoutPassword as User;
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  // First verify current password
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return false;
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user[0].password);
  if (!passwordMatch) {
    return false;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  const result = await db
    .update(users)
    .set({ 
      password: hashedPassword,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();

  return result.length > 0;
}

export async function scheduleUserDeletion(
  userId: string,
  reason: string = "User requested deletion"
): Promise<boolean> {
  const deletionScheduledAt = new Date();
  
  const result = await db
    .update(users)
    .set({
      isScheduledForDeletion: true,
      deletionScheduledAt,
      deletionReason: reason,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();

  if (result.length > 0) {
    // Send deletion notification email
    await sendAccountDeletionEmail(result[0].email, result[0].firstName || result[0].username || 'User');
    
    // Terminate all user sessions to log them out
    const { terminateUserSessions } = await import('./userService');
    await terminateUserSessions(userId);
  }

  return result.length > 0;
}

export async function cancelUserDeletion(
  userId: string
): Promise<boolean> {
  const result = await db
    .update(users)
    .set({
      isScheduledForDeletion: false,
      deletionScheduledAt: null,
      deletionReason: null,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();

  return result.length > 0;
}

export async function getUserDeletionStatus(
  userId: string
): Promise<UserDeletionStatusResponse | null> {
  const result = await db
    .select({
      isScheduledForDeletion: users.isScheduledForDeletion,
      deletionScheduledAt: users.deletionScheduledAt,
      deletionReason: users.deletionReason
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0) return null;

  const user = result[0];
  let hoursUntilDeletion: number | null = null;

  if (user.isScheduledForDeletion && user.deletionScheduledAt) {
    const deletionTime = new Date(user.deletionScheduledAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    hoursUntilDeletion = Math.max(0, Math.ceil((deletionTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
  }

  return {
    isScheduledForDeletion: user.isScheduledForDeletion || false,
    deletionScheduledAt: user.deletionScheduledAt,
    deletionReason: user.deletionReason,
    hoursUntilDeletion
  };
}



export async function processAvatarImage(
  base64Data: string,
  userId: string
): Promise<string> {
  try {
    console.log('Processing avatar for user:', userId);
    console.log('Base64 data length:', base64Data.length);
    
    // Extract base64 data - support more formats including gif and jfif
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]*);base64,(.+)$/);
    if (!matches) {
      console.error('Invalid base64 format');
      throw new Error('Invalid base64 image data');
    }
    
    const imageFormat = matches[1].toLowerCase();
    console.log('Image format detected:', imageFormat);
    const imageBuffer = Buffer.from(matches[2], 'base64');
    console.log('Image buffer size:', imageBuffer.length);
    
    // Validate supported formats
    const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'jfif', 'pjpeg'];
    if (!supportedFormats.includes(imageFormat)) {
      throw new Error(`Unsupported image format: ${imageFormat}`);
    }
    
    // Create avatars directory
    const avatarsDir = path.join(process.cwd(), "public/uploads/avatars");
    console.log('Avatars directory:', avatarsDir);
    
    if (!fs.existsSync(avatarsDir)) {
      console.log('Creating avatars directory');
      fs.mkdirSync(avatarsDir, { recursive: true });
    }
    
    // Generate filename
    const filename = `${userId}_${Date.now()}.webp`;
    const filePath = path.join(avatarsDir, filename);
    console.log('Output file path:', filePath);
    
    // Convert to WebP and resize with better error handling
    console.log('Starting Sharp processing');
    const sharpInstance = sharp(imageBuffer);
    
    // Handle animated GIFs by taking the first frame
    if (imageFormat === 'gif') {
      await sharpInstance
        .resize(200, 200, { fit: "cover" })
        .webp({ quality: 85 })
        .toFile(filePath);
    } else {
      await sharpInstance
        .resize(200, 200, { fit: "cover" })
        .webp({ quality: 85 })
        .toFile(filePath);
    }
    
    console.log('Sharp processing completed');
    const url = `/uploads/avatars/${filename}`;
    console.log('Returning URL:', url);
    
    return url;
  } catch (error) {
    console.error('Error processing avatar image:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(`Failed to process avatar image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}