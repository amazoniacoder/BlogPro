import { emailService } from './emailService';
import { db } from '../db/connection';

interface DigitalProduct {
  id: string;
  title: string;
  downloadUrl?: string;
  licenseKey?: string;
  instructions?: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: DigitalProduct[];
  totalAmount: number;
}

export class DigitalGoodsService {
  async deliverDigitalGoods(orderDetails: OrderDetails) {
    try {
      // Generate download links and license keys for digital products
      const processedItems = await this.processDigitalItems(orderDetails.items);
      
      // Send delivery email
      await this.sendDeliveryEmail(orderDetails, processedItems);
      
      // Log delivery
      await this.logDelivery(orderDetails.id, orderDetails.customerEmail);
      
      return { success: true, message: 'Digital goods delivered successfully' };
    } catch (error) {
      console.error('Failed to deliver digital goods:', error);
      throw new Error('Failed to deliver digital goods');
    }
  }

  private async processDigitalItems(items: DigitalProduct[]): Promise<DigitalProduct[]> {
    return items.map(item => ({
      ...item,
      downloadUrl: this.generateDownloadUrl(item.id),
      licenseKey: this.generateLicenseKey(item.id),
      instructions: this.getProductInstructions(item.title)
    }));
  }

  private generateDownloadUrl(productId: string): string {
    // Generate secure download URL with expiration
    const token = Buffer.from(`${productId}-${Date.now()}`).toString('base64');
    return `${process.env.BASE_URL || 'https://blogpro.tech'}/api/downloads/${token}`;
  }

  private generateLicenseKey(productId: string): string {
    // Generate unique license key
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${productId.substring(0, 4).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }

  private getProductInstructions(productTitle: string): string {
    return `
Installation Instructions for ${productTitle}:

1. Download the product files using the secure link provided
2. Extract the files to your desired location
3. Follow the README.md file included in the download
4. Use your license key for activation if required
5. Contact support if you need assistance

Your license is valid for unlimited personal/commercial use.
    `.trim();
  }

  private async sendDeliveryEmail(orderDetails: OrderDetails, items: DigitalProduct[]) {
    if (!emailService.transporter) {
      await emailService.initialize();
    }

    if (!emailService.transporter) {
      throw new Error('Email service not configured');
    }

    // Send individual email for each product with its custom template
    for (const item of items) {
      await this.sendProductEmail(orderDetails, item);
    }
  }

  private async sendProductEmail(orderDetails: OrderDetails, item: DigitalProduct) {
    try {
      // Get product-specific email template
      const template = await this.getProductEmailTemplate(item.id);
      
      // Prepare template variables
      const variables = {
        customer_name: orderDetails.customerName,
        customer_email: orderDetails.customerEmail,
        product_title: item.title,
        order_number: orderDetails.orderNumber,
        license_key: item.licenseKey || '',
        download_url: item.downloadUrl || '',
        purchase_date: new Date().toLocaleDateString(),
        total_amount: orderDetails.totalAmount.toFixed(2)
      };

      // Replace template variables
      const subject = this.replaceVariables(template.subject, variables);
      const content = this.replaceVariables(template.content, variables);

      const mailOptions = {
        from: `"BlogPro Digital Delivery" <${(await emailService.getEmailSettings()).smtpUser}>`,
        to: orderDetails.customerEmail,
        subject,
        html: content
      };

      await emailService.transporter!.sendMail(mailOptions);
    } catch (error) {
      console.error(`Failed to send email for product ${item.id}:`, error);
      // Fallback to default email if custom template fails
      await this.sendFallbackEmail(orderDetails, item);
    }
  }

  private async getProductEmailTemplate(productId: string) {
    try {
      // Get product's custom template or default template
      const result = await db.query(`
        SELECT 
          COALESCE(p.custom_email_subject, et.subject) as subject,
          COALESCE(p.custom_email_content, et.content) as content
        FROM products p
        LEFT JOIN email_templates et ON p.email_template_id = et.id
        LEFT JOIN email_templates def ON def.is_default = true AND def.template_type = 'product_delivery'
        WHERE p.id = $1
      `, [productId]);

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Fallback to default template
      const defaultResult = await db.query(`
        SELECT subject, content FROM email_templates 
        WHERE is_default = true AND template_type = 'product_delivery'
        LIMIT 1
      `);

      return defaultResult.rows[0] || {
        subject: '🎉 Your {{product_title}} is Ready!',
        content: '<p>Hello {{customer_name}}, your {{product_title}} is ready for download!</p>'
      };
    } catch (error) {
      console.error('Failed to get email template:', error);
      return {
        subject: '🎉 Your {{product_title}} is Ready!',
        content: '<p>Hello {{customer_name}}, your {{product_title}} is ready for download!</p>'
      };
    }
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  }

  private async sendFallbackEmail(orderDetails: OrderDetails, item: DigitalProduct) {
    const mailOptions = {
      from: `"BlogPro Digital Delivery" <${(await emailService.getEmailSettings()).smtpUser}>`,
      to: orderDetails.customerEmail,
      subject: `🎉 Your ${item.title} is Ready! Order #${orderDetails.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>🎉 Thank you for your purchase!</h1>
          <p>Hello ${orderDetails.customerName},</p>
          <p>Your digital product <strong>${item.title}</strong> is ready for download!</p>
          <p><strong>License Key:</strong> ${item.licenseKey}</p>
          <p><a href="${item.downloadUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download ${item.title}</a></p>
        </div>
      `
    };

    await emailService.transporter!.sendMail(mailOptions);
  }

  private async logDelivery(orderId: string, customerEmail: string) {
    try {
      await db.query(`
        INSERT INTO digital_deliveries (order_id, customer_email, delivered_at, status)
        VALUES ($1, $2, NOW(), 'delivered')
        ON CONFLICT (order_id) DO UPDATE SET
          delivered_at = NOW(),
          status = 'delivered'
      `, [orderId, customerEmail]);
    } catch (error) {
      console.error('Failed to log delivery:', error);
    }
  }
}

export const digitalGoodsService = new DigitalGoodsService();