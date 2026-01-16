import { useState } from 'react';
import { Product } from '../../../shared/types/product';
import { SocialShareService } from '../services/sharing/SocialShareService';

export const useProductShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareProduct = async (product: Product, platform: string) => {
    setIsSharing(true);
    setError(null);
    
    try {
      switch (platform) {
        case 'facebook':
          SocialShareService.shareToFacebook(product);
          break;
        case 'twitter':
          SocialShareService.shareToTwitter(product);
          break;
        case 'linkedin':
          SocialShareService.shareToLinkedIn(product);
          break;
        case 'whatsapp':
          SocialShareService.shareToWhatsApp(product);
          break;
        case 'email':
          SocialShareService.shareViaEmail(product);
          break;
        case 'copy':
          await SocialShareService.copyToClipboard(product);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Share failed');
      throw err;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    isSharing,
    error,
    copySuccess,
    shareProduct
  };
};
