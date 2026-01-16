/**
 * BlogPro Textarea Component
 * UI System textarea with BEM styling
 */

import React from "react";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        className={`textarea ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
