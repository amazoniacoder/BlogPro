import { Request } from 'express';

export interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
  screenResolution?: string;
}

export function detectDevice(req: Request): DeviceInfo {
  const userAgent = req.get('User-Agent') || '';
  
  // Device type detection
  let deviceType = 'desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad/i.test(userAgent)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'mobile';
    }
  } else if (/Tablet/i.test(userAgent)) {
    deviceType = 'tablet';
  }

  // Browser detection
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  } else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
    browser = 'Internet Explorer';
  }

  // OS detection
  let os = 'Unknown';
  if (userAgent.includes('Windows NT')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iPhone OS') || userAgent.includes('iOS')) {
    os = 'iOS';
  }

  return {
    deviceType,
    browser,
    os
  };
}

export function getClientIP(req: Request): string {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    '127.0.0.1'
  );
}