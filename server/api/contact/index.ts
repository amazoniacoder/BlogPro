import { Router } from "express";
import { db } from "../../db/db";
import { contacts } from "../../../shared/types/schema";
import { createInsertSchema } from "drizzle-zod";

// Create insert schema from the contacts table
const insertContactSchema = createInsertSchema(contacts);
import { z } from "zod";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAdmin } from "../../middleware/authMiddleware";
import { desc } from "drizzle-orm";
import { sendContactMessage } from "./send-message";
import { emailService } from "../../services/emailService";

const router = Router();

// Submit contact form
router.post("/", asyncHandler(async (req, res) => {
  try {
    const validatedData = insertContactSchema.parse(req.body);
    
    // Insert contact into database
    await db.insert(contacts as any).values(validatedData).returning();
    
    // Send email notification
    try {
      await emailService.sendContactMessage({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        message: validatedData.message
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      message: "Thank you for your message! I'll get back to you soon.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid contact data", errors: error.errors });
    }
    throw error;
  }
}));

// Send message to contact
router.post("/send", requireAdmin, sendContactMessage);

// Get all contacts (admin only)
router.get("/", requireAdmin, asyncHandler(async (_req, res) => {
  const contactsList = await db.select().from(contacts as any).orderBy(desc(contacts.createdAt as any));
  res.json(contactsList);
}));

export default router;