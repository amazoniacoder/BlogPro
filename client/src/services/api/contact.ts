import { Contact, InsertContact } from "@/types/contact";

const API_URL = "/api/contact";

export const contactService = {
  submit: async (contact: InsertContact): Promise<{ message: string }> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact)
    });
    if (!response.ok) throw new Error("Failed to submit contact form");
    return response.json();
  },
  
  getAll: async (): Promise<Contact[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return response.json();
  }
};
