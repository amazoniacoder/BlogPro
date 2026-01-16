import { useState, useEffect } from 'react';
import { CommentList } from './CommentList';
import { Icon } from '@/ui-system/icons/components';

interface CommentSectionProps {
  postId: number;
  className?: string;
}

export function CommentSection({ postId, className = '' }: CommentSectionProps) {
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const commentSection = document.querySelector('.comment-section');
      if (commentSection) {
        const rect = commentSection.getBoundingClientRect();
        setShowFloatingButton(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCommentForm = () => {
    // Try to find comment form field first (for logged-in users)
    const commentField = document.querySelector('.comment-form__field');
    if (commentField) {
      commentField.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }
    
    // Fallback to login prompt (for non-logged-in users)
    const loginPrompt = document.querySelector('.comment-form__login-prompt');
    if (loginPrompt) {
      loginPrompt.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }
    
    // Final fallback to comment section
    const commentSection = document.querySelector('.comment-section');
    if (commentSection) {
      commentSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  return (
    <>
      <section className={`comment-section ${className}`} id="comments">
        <CommentList postId={postId} />
      </section>
      
      {showFloatingButton && (
        <button 
          className="floating-comment-btn"
          onClick={scrollToCommentForm}
          aria-label="Add comment"
        >
          <Icon name="add" size={20} />
          <span>Add Comment</span>
        </button>
      )}
    </>
  );
}