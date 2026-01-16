import { Product } from '../../../../shared/types/product';

export class SocialShareService {
  static shareToFacebook(product: Product): void {
    const url = this.getProductUrl(product);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    this.openShareWindow(shareUrl, 'facebook');
    this.trackShare(product.id, 'facebook');
  }

  static shareToTwitter(product: Product): void {
    const url = this.getProductUrl(product);
    const text = `Check out ${product.title}: ${product.description}`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    this.openShareWindow(shareUrl, 'twitter');
    this.trackShare(product.id, 'twitter');
  }

  static shareToLinkedIn(product: Product): void {
    const url = this.getProductUrl(product);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    this.openShareWindow(shareUrl, 'linkedin');
    this.trackShare(product.id, 'linkedin');
  }

  static shareToWhatsApp(product: Product): void {
    const url = this.getProductUrl(product);
    const text = `${product.title}: ${product.description} ${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    this.trackShare(product.id, 'whatsapp');
  }

  static copyToClipboard(product: Product): Promise<void> {
    const url = this.getProductUrl(product);
    return navigator.clipboard.writeText(url).then(() => {
      this.trackShare(product.id, 'clipboard');
    });
  }

  static shareViaEmail(product: Product): void {
    const url = this.getProductUrl(product);
    const subject = `Check out ${product.title}`;
    const body = `I thought you might be interested in this: ${product.title}\n\n${product.description}\n\n${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    this.trackShare(product.id, 'email');
  }

  private static getProductUrl(product: Product): string {
    return `${window.location.origin}/products/${product.slug}`;
  }

  private static openShareWindow(url: string, platform: string): void {
    window.open(url, `share-${platform}`, 'width=600,height=400,scrollbars=yes,resizable=yes');
  }

  private static trackShare(productId: string, platform: string): void {
    // Analytics tracking
    console.log(`Product ${productId} shared via ${platform}`);
    // TODO: Implement actual analytics tracking
  }
}
