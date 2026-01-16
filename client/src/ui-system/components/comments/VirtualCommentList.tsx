import React, { useState, useRef, useMemo } from 'react';
import { CommentItem } from './CommentItem';

interface CommentTree {
  id: number;
  post_id: number;
  user_id: string;
  parent_id?: number | null;
  content: string;
  content_html: string;
  created_at: string;
  updated_at: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  reaction_count: number;
  reply_count: number;
  depth: number;
  replies: CommentTree[];
}

interface VirtualCommentListProps {
  comments: CommentTree[];
  currentUser?: any;
  onReply: (data: any) => Promise<void>;
  onUpdate: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  itemHeight?: number;
  containerHeight?: number;
}

export function VirtualCommentList({
  comments,
  currentUser,
  onReply,
  onUpdate,
  onDelete,
  itemHeight = 120,
  containerHeight = 600
}: VirtualCommentListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const flatComments = useMemo(() => {
    const flatten = (commentList: CommentTree[], depth = 0): Array<CommentTree & { depth: number }> => {
      return commentList.reduce((acc, comment) => {
        acc.push({ ...comment, depth });
        if (comment.replies?.length > 0) {
          acc.push(...flatten(comment.replies, depth + 1));
        }
        return acc;
      }, [] as Array<CommentTree & { depth: number }>);
    };
    return flatten(comments);
  }, [comments]);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 2, flatComments.length);
    return { start: Math.max(0, start - 1), end };
  }, [scrollTop, itemHeight, containerHeight, flatComments.length]);

  const visibleComments = useMemo(() => {
    return flatComments.slice(visibleRange.start, visibleRange.end);
  }, [flatComments, visibleRange]);

  const totalHeight = flatComments.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div 
      ref={containerRef}
      className="virtual-comment-list"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              style={{ 
                height: itemHeight,
                paddingLeft: `${comment.depth * 20}px`
              }}
            >
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                onReply={onReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}