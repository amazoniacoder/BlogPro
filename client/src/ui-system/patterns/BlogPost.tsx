/**
 * BlogPro Blog Post Component
 * Full blog post display with rich content
 */

import React from 'react';

export interface BlogPostProps {
  title: string;
  content: string;
  category?: string;
  date?: string;
  image?: string;
  className?: string;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  title,
  content,
  category,
  date,
  image,
  className = ''
}) => {
  const postClasses = [
    'blog-post',
    className
  ].filter(Boolean).join(' ');

  return (
    <article className={postClasses}>
      <div className="blog-post__header">
        <h1 className="blog-post__title">{title}</h1>
        
        {(category || date) && (
          <div className="blog-post__meta">
            {category && (
              <span className="blog-post__category">{category}</span>
            )}
            {date && (
              <span className="blog-post__date">{date}</span>
            )}
          </div>
        )}
        
        {image && (
          <img 
            src={image} 
            alt={title}
            className="blog-post__image"
          />
        )}
      </div>
      
      <div 
        className="blog-post__content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
};

export default BlogPost;
