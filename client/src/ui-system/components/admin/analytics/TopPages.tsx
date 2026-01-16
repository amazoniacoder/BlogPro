import React from 'react';

interface TopPagesProps {
  pages: Array<{ page: string; views: number }>;
}

const TopPages: React.FC<TopPagesProps> = ({ pages }) => {
  return (
    <div className="admin-analytics-top-pages">
      <h3 className="admin-analytics-top-pages__title">Top Pages</h3>
      <div className="admin-analytics-top-pages__list">
        {pages.slice(0, 10).map((page, index) => (
          <div key={page.page || `page-${index}`} className="admin-analytics-top-pages__item">
            <div className="admin-analytics-top-pages__rank">{index + 1}</div>
            <div className="admin-analytics-top-pages__page flex-1">
              <span className="admin-analytics-top-pages__path">{page.page}</span>
              <span className="admin-analytics-top-pages__views">{page.views.toLocaleString()} views</span>
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <div className="admin-analytics-top-pages__empty">No page data available</div>
        )}
      </div>
    </div>
  );
};

export default TopPages;
