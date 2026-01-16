/**
 * BlogPro Blog Detail Page Pattern
 * Full-width blog post with bottom sidebar content
 */

import React from 'react';


export interface BlogDetailPageProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  children,
  navigation,
  sidebar,
  footer,
  className = ''
}) => {
  return (
    <div className={`blog-detail-page ${className}`}>
      <div className="blog-detail-page__container">
        {/* Full-width main content */}
        <main className="blog-detail-page__main">
          {children}
        </main>

        {/* Bottom sections */}
        <div className="blog-detail-page__bottom">
          {navigation && (
            <div className="blog-detail-page__navigation">
              {navigation}
            </div>
          )}
          
          {sidebar && (
            <div className="blog-detail-page__sidebar">
              {sidebar}
            </div>
          )}
          
          {footer && (
            <div className="blog-detail-page__footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
