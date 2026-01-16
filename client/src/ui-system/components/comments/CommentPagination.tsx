import React from 'react';
import { Button } from '@/ui-system/components/button';
import { Stack } from '@/ui-system/components/utility';

interface CommentPaginationProps {
  currentPage: number;
  totalPages: number;
  totalComments: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function CommentPagination({
  currentPage,
  totalPages,
  totalComments,
  onPageChange,
  loading = false
}: CommentPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="comment-pagination">
      <div className="comment-pagination__info">
        Showing page {currentPage} of {totalPages} ({totalComments} comments)
      </div>
      
      <Stack direction="row" spacing="xs" align="center" className="comment-pagination__controls">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          Previous
        </Button>
        
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="comment-pagination__dots">...</span>
            ) : (
              <Button
                variant={page === currentPage ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={loading}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          Next
        </Button>
      </Stack>
    </div>
  );
}