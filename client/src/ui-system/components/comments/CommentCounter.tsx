import { Button } from '@/ui-system/components/button';
import { Icon } from '@/ui-system/icons/components';

interface CommentCounterProps {
  count: number;
  onLoadComments: () => void;
  isLoading?: boolean;
}

export function CommentCounter({ count, onLoadComments, isLoading }: CommentCounterProps) {
  return (
    <div className="comment-counter">
      <Button 
        variant="outline" 
        onClick={onLoadComments}
        disabled={isLoading}
        className="comment-counter__button"
      >
        <Icon name="reply" size={16} />
        {isLoading ? 'Loading...' : `Comments (${count})`}
      </Button>
    </div>
  );
}