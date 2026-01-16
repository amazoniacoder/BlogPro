import { Request, Response } from 'express';
import { db } from '../../db/db';
import { contacts } from '../../../shared/types/schema';

export async function sendContactMessage(req: Request, res: Response) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, email, and message are required' 
      });
    }

    // Save to database
    const [newContact] = await db.insert(contacts).values({
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      email,
      message: `Subject: ${subject || 'Contact Form Message'}\n\n${message}`
    }).returning();

    // In a real implementation, you would send email here
    console.log('New contact message:', {
      id: newContact.id,
      name,
      email,
      subject
    });

    res.status(201).json({
      message: 'Message sent successfully',
      id: newContact.id
    });

  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: 'Please try again later' 
    });
  }
}