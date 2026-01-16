import React, { useState, useMemo } from 'react';
import { Input } from '@/ui-system/components/input';
import { Icon } from '@/ui-system/icons/components';
import { Stack } from '@/ui-system/components/utility';

interface CommentTree {
  id: number;
  content: string;
  username: string;
  first_name?: string;
  last_name?: string;
  replies: CommentTree[];
}

interface CommentSearchProps {
  comments: CommentTree[];
  onSearchResults: (results: CommentTree[]) => void;
  placeholder?: string;
}

export function CommentSearch({ 
  comments, 
  onSearchResults, 
  placeholder = "Search comments..." 
}: CommentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchComments = useMemo(() => {
    if (!searchQuery.trim()) {
      return comments;
    }

    const query = searchQuery.toLowerCase();
    
    const filterComments = (commentList: CommentTree[]): CommentTree[] => {
      return commentList.filter(comment => {
        const contentMatch = comment.content.toLowerCase().includes(query);
        const authorMatch = comment.username.toLowerCase().includes(query) ||
          (comment.first_name && comment.first_name.toLowerCase().includes(query)) ||
          (comment.last_name && comment.last_name.toLowerCase().includes(query));
        
        const hasMatchingReplies = comment.replies.length > 0 && 
          filterComments(comment.replies).length > 0;
        
        return contentMatch || authorMatch || hasMatchingReplies;
      }).map(comment => ({
        ...comment,
        replies: filterComments(comment.replies)
      }));
    };

    return filterComments(comments);
  }, [comments, searchQuery]);

  React.useEffect(() => {
    onSearchResults(searchComments);
  }, [searchComments, onSearchResults]);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="comment-search">
      <Stack direction="row" spacing="sm" align="center">
        <div className="comment-search__input">
          <div style={{ position: 'relative' }}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
            />
            <Icon name="search" size={16} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
        {searchQuery && (
          <button 
            className="comment-search__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </Stack>
      
      {searchQuery && (
        <div className="comment-search__results">
          {searchComments.length} comment{searchComments.length !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  );
}