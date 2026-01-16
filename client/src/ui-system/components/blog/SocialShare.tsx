import { Icon } from '@/ui-system/icons/components';

interface SocialShareProps {
  title: string;
  url: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
  return (
    <div className="social-share">
      <h3 className="social-share__title">Share this post</h3>
      <div className="social-share__buttons">
        <button 
          className="social-share__button"
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')}
          aria-label="Share on Twitter"
        >
          <Icon name="share" size={16} />
          Twitter
        </button>
        <button 
          className="social-share__button"
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')}
          aria-label="Share on Facebook"
        >
          <Icon name="share" size={16} />
          Facebook
        </button>
        <button 
          className="social-share__button"
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')}
          aria-label="Share on LinkedIn"
        >
          <Icon name="share" size={16} />
          LinkedIn
        </button>
      </div>
    </div>
  );
}