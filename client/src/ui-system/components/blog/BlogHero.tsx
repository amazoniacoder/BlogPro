import { Icon } from '@/ui-system/icons/components';

export interface BlogHeroProps {
  title: string;
  description?: string;
  imageUrl?: string;
  date: string;
  onImageClick?: () => void;
}

export function BlogHero({ title, description, imageUrl, date, onImageClick }: BlogHeroProps) {
  return (
    <div className="blog-hero">
      {imageUrl && (
        <img 
          src={imageUrl}
          alt={title}
          className="blog-hero__image"
          onClick={onImageClick}
          loading="lazy"
          tabIndex={onImageClick ? 0 : -1}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onImageClick) {
              e.preventDefault();
              onImageClick();
            }
          }}
        />
      )}
      <div className="blog-hero__content">
        <h1 className="blog-hero__title">{title}</h1>
        <div className="blog-hero__meta">
          <Icon name="calendar" size={16} />
          <span>{date}</span>
        </div>
        {description && (
          <div className="blog-hero__summary">
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}