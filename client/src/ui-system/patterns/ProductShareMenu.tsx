import React, { useState } from 'react';
import { Product } from '../../../../shared/types/product';
import { SocialShareService } from '@/services/sharing/SocialShareService';
import { Icon } from '../icons/components';
import { Button } from '../components/button';

interface ProductShareMenuProps {
  product: Product;
  baseUrl?: string;
}

export const ProductShareMenu: React.FC<ProductShareMenuProps> = ({
  product,
  baseUrl = window.location.origin
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const productUrl = `${baseUrl}/products/${product.slug}`;

  const platforms = [
    { platform: 'facebook', label: 'Facebook', icon: 'share', color: '#1877f2' },
    { platform: 'twitter', label: 'Twitter', icon: 'share', color: '#1da1f2' },
    { platform: 'linkedin', label: 'LinkedIn', icon: 'share', color: '#0077b5' },
    { platform: 'whatsapp', label: 'WhatsApp', icon: 'share', color: '#25d366' },
    { platform: 'email', label: 'Email', icon: 'share', color: '#ea4335' }
  ];

  const handleShare = async (platform: string) => {
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
          return;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(productUrl)}`;

  return (
    <div className="product-share-menu">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="share" size={16} />
        Share
      </Button>

      {isOpen && (
        <div className="product-share-menu__dropdown">
          <div className="product-share-menu__header">
            <h4>Share Product</h4>
            <button
              className="product-share-menu__close"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="product-share-menu__url">
            <input
              type="text"
              value={productUrl}
              readOnly
              className="product-share-menu__url-input"
            />
            <button
              className={`product-share-menu__copy ${copySuccess ? 'product-share-menu__copy--success' : ''}`}
              onClick={() => handleShare('copy')}
            >
              <Icon name={copySuccess ? 'check' : 'share'} size={16} />
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="product-share-menu__platforms">
            {platforms.map(({ platform, label, icon, color }) => (
              <button
                key={platform}
                className="product-share-menu__platform"
                onClick={() => handleShare(platform)}
                style={{ '--platform-color': color } as React.CSSProperties}
              >
                <Icon name={icon as any} size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="product-share-menu__qr">
            <button
              className="product-share-menu__qr-toggle"
              onClick={() => setShowQR(!showQR)}
            >
              <Icon name="grid" size={16} />
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>

            {showQR && (
              <div className="product-share-menu__qr-code">
                <img src={qrCodeUrl} alt="QR Code" />
                <p>Scan to view product</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
