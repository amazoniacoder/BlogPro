import nodemailer from 'nodemailer';
import { db } from '../db/db';
import { settings } from '../../shared/types/schema';

export class EmailService {
  public transporter: nodemailer.Transporter | null = null;

  async initialize() {
    // Get email settings from database
    const emailSettings = await this.getEmailSettings();
    
    if (!emailSettings.smtpHost) {
      console.warn('Email service not configured - SMTP settings missing');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort,
      secure: emailSettings.smtpPort === 465,
      auth: emailSettings.smtpUser && emailSettings.smtpPass ? {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPass,
      } : undefined, // Для локального Postfix аутентификация может не требоваться
      tls: {
        rejectUnauthorized: false // Для локального сервера
      }
    });
  }

  async getEmailSettings() {
    try {
      const allSettings = await db.select().from(settings);
      const settingsObj = allSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>);

      return {
        smtpHost: settingsObj.smtpHost || process.env.SMTP_HOST || 'localhost',
        smtpPort: parseInt(settingsObj.smtpPort || process.env.SMTP_PORT || '587'),
        smtpUser: settingsObj.smtpUser || process.env.SMTP_USER || 'noreply@blogpro.tech',
        smtpPass: settingsObj.smtpPass || process.env.SMTP_PASS || '',
        recipientEmail: settingsObj.contactRecipientEmail || 'genavinogradov@gmail.com'
      };
    } catch (error) {
      console.error('Failed to load email settings:', error);
      return {
        smtpHost: process.env.SMTP_HOST || 'localhost',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || 'noreply@blogpro.tech',
        smtpPass: process.env.SMTP_PASS || '',
        recipientEmail: 'genavinogradov@gmail.com'
      };
    }
  }

  async sendContactMessage(contactData: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  }) {
    if (!this.transporter) {
      await this.initialize();
    }

    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const emailSettings = await this.getEmailSettings();

    const mailOptions = {
      from: `"${contactData.firstName} ${contactData.lastName}" <${emailSettings.smtpUser}>`,
      to: emailSettings.recipientEmail,
      replyTo: contactData.email,
      subject: `📧 Новое сообщение от ${contactData.firstName} ${contactData.lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Message</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">BlogPro</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Новое сообщение</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #333; margin: 0 0 30px 0; font-size: 24px;">Контактная информация</h2>
                      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; color: #374151;"><strong>Имя:</strong> ${contactData.firstName} ${contactData.lastName}</p>
                        <p style="margin: 0; color: #374151;"><strong>Email:</strong> ${contactData.email}</p>
                      </div>
                      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Сообщение:</h3>
                      <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; border-left: 4px solid #2563eb;">
                        <p style="color: #374151; line-height: 1.6; margin: 0;">${contactData.message.replace(/\n/g, '<br>')}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 BlogPro. Все права защищены.</p>
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

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();