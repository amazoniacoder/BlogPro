import React, { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/ui-system/components/form';

interface User {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMention?: (users: User[]) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

export function MentionInput({
  value,
  onChange,
  onMention,
  placeholder,
  maxLength = 2000,
  rows = 3
}: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    
    // Check for @ mentions
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPosition - mentionMatch[0].length);
      
      if (onMention && mentionMatch[1].length >= 2) {
        // Trigger mention search (would typically call an API)
        onMention([]);
      }
    } else {
      setMentionQuery('');
      setMentionPosition(null);
    }
  }, [onChange, onMention]);

  const insertMention = useCallback((user: User) => {
    if (mentionPosition === null || !textareaRef.current) return;
    
    const beforeMention = value.slice(0, mentionPosition);
    const afterMention = value.slice(mentionPosition + mentionQuery.length + 1);
    const mention = `@${user.username}`;
    
    const newValue = beforeMention + mention + afterMention;
    onChange(newValue);
    
    setMentionQuery('');
    setMentionPosition(null);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = mentionPosition + mention.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [value, mentionPosition, mentionQuery, onChange]);

  return (
    <div className="mention-input">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
      />
      
      {mentionQuery && mentionPosition !== null && (
        <div className="mention-input__suggestions">
          <div className="mention-input__suggestion" onClick={() => insertMention({ id: '1', username: 'example' })}>
            @example
          </div>
        </div>
      )}
    </div>
  );
}