/**
 * BlogPro Blog Section Pattern
 * Universal blog section component for displaying featured posts
 */

import React from 'react';
import { Button } from '../components';
import { BlogPost } from '@/types/blog';
import BlogCard from './BlogCard';

export interface BlogSectionProps {
  title: string;
  posts: BlogPost[];
  showViewAll?: boolean;
  viewAllText?: string;
  viewAllHref?: string;
  className?: string;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  title,
  posts,
  showViewAll = true,
  viewAllText = "View All Posts",
  viewAllHref = "/blog",
  className = ''
}) => {
  const sectionClasses = [
    'blog-section',
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      <div className="blog-section__container">
        <h2 className="blog-section__title">{title}</h2>
        {posts.length > 0 ? (
          <>
            <div className="blog-section__grid">
              {posts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {showViewAll && (
              <div className="blog-section__actions">
                <Button variant="secondary" size="sm" as="a" href={viewAllHref}>
                  {viewAllText}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="blog-section__empty">
            <p className="blog-section__empty-message">
              No blog posts available at the moment. Check back soon!
            </p>
            <Button variant="primary" size="lg" as="a" href="/contact">
              Contact Us
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
