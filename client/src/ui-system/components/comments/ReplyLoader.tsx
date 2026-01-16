import { Button } from '@/ui-system/components/button';
import { Icon } from '@/ui-system/icons/components';

interface ReplyLoaderProps {
  commentId: number;
  replyCount: number;
  onLoadReplies: (commentId: number) => void;
  isLoading?: boolean;
}

export function ReplyLoader({ commentId, replyCount, onLoadReplies, isLoading }: ReplyLoaderProps) {
  if (replyCount === 0) return null;
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => onLoadReplies(commentId)}
      disabled={isLoading}
      className="reply-loader"
    >
      <Icon name="reply" size={14} />
      {isLoading ? 'Loading...' : `Show Replies (${replyCount})`}
    </Button>
  );
}