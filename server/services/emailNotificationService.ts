import { Pool } from 'pg';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationData {
  recipientEmail: string;
  recipientName: string;
  authorName: string;
  postTitle: string;
  postSlug: string;
  commentContent: string;
  commentId: number;
}

class EmailNotificationService {
  private db: Pool;

  constructor(database: Pool) {
    this.db = database;
  }

  // Send reply notification email
  async sendReplyNotification(data: NotificationData): Promise<void> {
    const template = this.getReplyTemplate(data);
    
    await this.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    // Mark notification as email sent
    await this.markEmailSent(data.commentId, 'reply');
  }

  // Send new comment notification to post author
  async sendPostCommentNotification(data: NotificationData): Promise<void> {
    const template = this.getPostCommentTemplate(data);
    
    await this.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    // Mark notification as email sent
    await this.markEmailSent(data.commentId, 'post_comment');
  }

  // Send mention notification
  async sendMentionNotification(data: NotificationData): Promise<void> {
    const template = this.getMentionTemplate(data);
    
    await this.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Get reply email template
  private getReplyTemplate(data: NotificationData): EmailTemplate {
    const commentUrl = `${process.env.FRONTEND_URL}/blog/${data.postSlug}#comment-${data.commentId}`;
    
    return {
      subject: `${data.authorName} replied to your comment on "${data.postTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Reply to Your Comment</h2>
          <p>Hi ${data.recipientName},</p>
          <p><strong>${data.authorName}</strong> replied to your comment on the blog post "<strong>${data.postTitle}</strong>":</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">${data.commentContent}</p>
          </div>
          
          <p>
            <a href="${commentUrl}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Reply
            </a>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            You're receiving this email because you commented on BlogPro. 
            <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      `,
      text: `
        Hi ${data.recipientName},
        
        ${data.authorName} replied to your comment on "${data.postTitle}":
        
        "${data.commentContent}"
        
        View the reply: ${commentUrl}
        
        ---
        You're receiving this email because you commented on BlogPro.
        Unsubscribe: ${process.env.FRONTEND_URL}/unsubscribe
      `
    };
  }

  // Get post comment email template
  private getPostCommentTemplate(data: NotificationData): EmailTemplate {
    const commentUrl = `${process.env.FRONTEND_URL}/blog/${data.postSlug}#comment-${data.commentId}`;
    
    return {
      subject: `New comment on your post "${data.postTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Comment on Your Blog Post</h2>
          <p>Hi ${data.recipientName},</p>
          <p><strong>${data.authorName}</strong> left a comment on your blog post "<strong>${data.postTitle}</strong>":</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">${data.commentContent}</p>
          </div>
          
          <p>
            <a href="${commentUrl}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Comment
            </a>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            You're receiving this email because someone commented on your BlogPro post.
            <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      `,
      text: `
        Hi ${data.recipientName},
        
        ${data.authorName} left a comment on your post "${data.postTitle}":
        
        "${data.commentContent}"
        
        View the comment: ${commentUrl}
        
        ---
        You're receiving this email because someone commented on your BlogPro post.
        Unsubscribe: ${process.env.FRONTEND_URL}/unsubscribe
      `
    };
  }

  // Get mention email template
  private getMentionTemplate(data: NotificationData): EmailTemplate {
    const commentUrl = `${process.env.FRONTEND_URL}/blog/${data.postSlug}#comment-${data.commentId}`;
    
    return {
      subject: `${data.authorName} mentioned you in a comment`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You Were Mentioned in a Comment</h2>
          <p>Hi ${data.recipientName},</p>
          <p><strong>${data.authorName}</strong> mentioned you in a comment on "<strong>${data.postTitle}</strong>":</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">${data.commentContent}</p>
          </div>
          
          <p>
            <a href="${commentUrl}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Comment
            </a>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            You're receiving this email because you were mentioned on BlogPro.
            <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      `,
      text: `
        Hi ${data.recipientName},
        
        ${data.authorName} mentioned you in a comment on "${data.postTitle}":
        
        "${data.commentContent}"
        
        View the comment: ${commentUrl}
        
        ---
        You're receiving this email because you were mentioned on BlogPro.
        Unsubscribe: ${process.env.FRONTEND_URL}/unsubscribe
      `
    };
  }

  // Send email using your existing email service
  private async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    try {
      // Use your existing email service here
      // This is a placeholder - replace with your actual email service
      const emailService = require('./emailService');
      
      await emailService.sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });
      
      console.log(`Email sent to ${emailData.to}: ${emailData.subject}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Mark notification as email sent
  private async markEmailSent(commentId: number, notificationType: string): Promise<void> {
    try {
      await this.db.query(
        `UPDATE comment_notifications 
         SET email_sent = true 
         WHERE comment_id = $1 AND type = $2`,
        [commentId, notificationType]
      );
    } catch (error) {
      console.error('Error marking email as sent:', error);
    }
  }

  // Process pending email notifications
  async processPendingNotifications(): Promise<void> {
    try {
      const query = `
        SELECT 
          cn.*,
          c.content as comment_content,
          bp.title as post_title,
          bp.slug as post_slug,
          recipient.email as recipient_email,
          recipient.display_name as recipient_name,
          author.display_name as author_name
        FROM comment_notifications cn
        JOIN comments c ON cn.comment_id = c.id
        JOIN blog_posts bp ON c.post_id = bp.id
        JOIN users recipient ON cn.user_id = recipient.id
        JOIN users author ON cn.triggered_by = author.id
        WHERE cn.email_sent = false
        AND cn.created_at > NOW() - INTERVAL '1 hour'
        LIMIT 50
      `;
      
      const result = await this.db.query(query);
      
      for (const notification of result.rows) {
        const data: NotificationData = {
          recipientEmail: notification.recipient_email,
          recipientName: notification.recipient_name || notification.recipient_email,
          authorName: notification.author_name || 'Someone',
          postTitle: notification.post_title,
          postSlug: notification.post_slug,
          commentContent: notification.comment_content,
          commentId: notification.comment_id
        };
        
        try {
          if (notification.type === 'reply') {
            await this.sendReplyNotification(data);
          } else if (notification.type === 'post_comment') {
            await this.sendPostCommentNotification(data);
          } else if (notification.type === 'mention') {
            await this.sendMentionNotification(data);
          }
        } catch (error) {
          console.error(`Error sending notification email for comment ${notification.comment_id}:`, error);
        }
      }
      
      console.log(`Processed ${result.rows.length} pending email notifications`);
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }
}

// Export singleton instance
const db = require('../db/database');
export default new EmailNotificationService(db);