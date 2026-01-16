import rateLimit from 'express-rate-limit';

// Use any type to avoid interface conflicts
type AuthRequest = any;

// Rate limiter for comment creation - More reasonable limits
export const commentCreateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 comments per 5 minutes
  message: {
    success: false,
    error: 'Comment creation limit reached. Please wait before posting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter for comment modifications (edit/delete)
export const commentModifyLimit = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 15, // 15 modifications per 2 minutes
  message: {
    success: false,
    error: 'Too many comment modifications. Please slow down.'
  },
  keyGenerator: (req: AuthRequest) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Rate limiter for reactions - Higher limits for quick interactions
export const reactionLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 reactions per minute
  message: {
    success: false,
    error: 'Reaction limit reached. Please slow down.'
  },
  keyGenerator: (req: AuthRequest) => {
    return req.user ? req.user.id : req.ip;
  }
});

// Legacy exports for backward compatibility
export const commentRateLimit = commentCreateLimit;
export const reactionRateLimit = reactionLimit;

// Basic spam detection
export class SpamDetectionService {
  
  // Check if content might be spam
  async checkContent(content: string): Promise<boolean> {
    if (!content) return false;
    
    // Basic spam indicators
    const spamPatterns = [
      /https?:\/\/[^\s]+/gi, // Multiple URLs
      /\b(buy|sale|discount|offer|deal|free|win|prize)\b/gi, // Commercial terms
      /(.)\1{10,}/gi, // Repeated characters
      /[A-Z]{20,}/g // Excessive caps
    ];
    
    let spamScore = 0;
    
    // Check for spam patterns
    spamPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        spamScore += matches.length;
      }
    });
    
    // Check content length vs unique characters
    const uniqueChars = new Set(content.toLowerCase()).size;
    const totalChars = content.length;
    
    if (totalChars > 50 && uniqueChars / totalChars < 0.3) {
      spamScore += 2; // Low character diversity
    }
    
    // Return true if spam score is too high
    return spamScore >= 3;
  }
  
  // Check comment frequency for user
  async checkCommentFrequency(_userId: string): Promise<boolean> {
    // This would typically check database for recent comments
    // For now, return false (not spam)
    return false;
  }
}

export const spamDetectionService = new SpamDetectionService();