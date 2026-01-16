/**
 * BlogPro Blog Card Pattern
 * Card component for displaying blog post previews
 */

import React, { memo } from 'react';

import { BlogPost as LocalBlogPost } from '@/types/blog';
import { BlogPost as ApiBlogPost } from '@/../../shared/types/api';
import { formatDate } from '@/utils/date';
import { Icon } from '../icons/components';
import './blog-card.css';

export interface BlogCardProps {
  post: LocalBlogPost | ApiBlogPost;
  className?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, className = '' }) => {
  return (
    <div className={`blog-card overflow-hidden ${className}`}>
      <div className="blog-card__image-container overflow-hidden">
        <img 
          src={post.imageUrl || '/placeholder-blog.jpg'} 
          alt={post.title} 
          className="blog-card__image scale-hover object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-blog.jpg';
          }}
        />
      </div>
      <div className="blog-card__content">
        <div className="blog-card__meta">
          <span className="blog-card__date">
            <Icon name="calendar" size={14} className="blog-card__date-icon" />
            {typeof post.created_at === 'string' 
              ? formatDate(new Date(post.created_at)) 
              : formatDate(post.created_at)}
          </span>
        </div>
        <h3 className="blog-card__title text-lg">{post.title}</h3>
        <p className="blog-card__excerpt mb-4 overflow-hidden">{post.description}</p>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(BlogCard, (prevProps, nextProps) => {
  // For debugging
  if (prevProps.post.id === nextProps.post.id && 
      prevProps.post.updated_at !== nextProps.post.updated_at) {
    console.log(`BlogCard ${prevProps.post.id} detected update:`, 
      { prevUpdatedAt: prevProps.post.updated_at, newUpdatedAt: nextProps.post.updated_at });
  }
  
  // More detailed comparison to ensure updates are detected
  return prevProps.post.id === nextProps.post.id && 
         prevProps.post.updated_at === nextProps.post.updated_at &&
         prevProps.post.title === nextProps.post.title &&
         prevProps.post.description === nextProps.post.description &&
         prevProps.post.imageUrl === nextProps.post.imageUrl &&
         prevProps.post.categoryId === nextProps.post.categoryId &&
         JSON.stringify(prevProps.post.tags) === JSON.stringify(nextProps.post.tags);
});

export { BlogCard };
