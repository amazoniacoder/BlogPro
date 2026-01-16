import { logger } from './logger';

export interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export class AuditLogger {
  // Log analytics-related audit events
  static logAnalyticsEvent(event: Omit<AuditEvent, 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date()
    };
    
    // Sanitize sensitive data
    const sanitizedEvent = {
      ...auditEvent,
      details: this.sanitizeDetails(auditEvent.details),
      userAgent: auditEvent.userAgent?.substring(0, 200) // Limit length
    };
    
    logger.info('AUDIT_EVENT', sanitizedEvent);
  }
  
  // Log data clearing operations
  static logDataClear(userId: string, ipAddress: string, userAgent?: string): void {
    this.logAnalyticsEvent({
      userId,
      action: 'CLEAR_ANALYTICS_DATA',
      resource: 'analytics',
      details: { 
        severity: 'HIGH',
        description: 'All analytics data cleared by admin'
      },
      ipAddress,
      userAgent
    });
  }
  
  // Log manual aggregation triggers
  static logManualAggregation(userId: string, date: string, ipAddress: string, userAgent?: string): void {
    this.logAnalyticsEvent({
      userId,
      action: 'MANUAL_AGGREGATION',
      resource: 'analytics',
      details: { 
        date,
        description: 'Manual analytics aggregation triggered'
      },
      ipAddress,
      userAgent
    });
  }
  
  // Log failed authentication attempts
  static logAuthFailure(ipAddress: string, reason: string, userAgent?: string): void {
    this.logAnalyticsEvent({
      action: 'AUTH_FAILURE',
      resource: 'analytics',
      details: { 
        reason,
        severity: 'MEDIUM'
      },
      ipAddress,
      userAgent
    });
  }
  
  // Sanitize audit details to prevent log injection
  private static sanitizeDetails(details: any): any {
    if (!details) return details;
    
    if (typeof details === 'string') {
      return details.replace(/[\r\n\t]/g, ' ').substring(0, 500);
    }
    
    if (typeof details === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(details)) {
        if (typeof value === 'string') {
          sanitized[key] = value.replace(/[\r\n\t]/g, ' ').substring(0, 200);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return details;
  }
}