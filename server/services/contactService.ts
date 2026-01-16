import { db } from '../db/db';
import { contacts } from '../../shared/types/schema';
import { eq } from 'drizzle-orm';
// Create types from the contacts table
type Contact = typeof contacts.$inferSelect;
type InsertContact = typeof contacts.$inferInsert;

export async function getContacts(): Promise<Contact[]> {
  return await db.select().from(contacts).orderBy(contacts.createdAt);
}

export async function getContact(id: number): Promise<Contact | undefined> {
  const results = await db.select().from(contacts).where(eq(contacts.id, id));
  return results[0];
}

export async function createContact(data: InsertContact): Promise<Contact> {
  const result = await db.insert(contacts).values(data).returning();
  return result[0];
}