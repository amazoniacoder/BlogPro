import React from 'react';
import { Button } from '../button';
import type { Documentation } from '../../../../../shared/types/documentation';
import './documentation-content.css';

interface DocumentationContentProps {
  document?: Documentation | null;
  onBack?: () => void;
  className?: string;
}

export const DocumentationContent: React.FC<DocumentationContentProps> = ({
  document,
  onBack,
  className = ''
}) => {
  if (!document) {
    return (
      <div className={`documentation-content documentation-content--empty ${className}`}>
        <div className="documentation-content__empty-state">
          <h1 className="documentation-content__empty-title">Документация</h1>
          <p className="documentation-content__empty-description">
            Полное руководство по использованию BlogPro. Выберите документ из боковой панели.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`documentation-content ${className}`}>
      {onBack && (
        <div className="documentation-content__header">
          <Button 
            variant="ghost"
            onClick={onBack}
            className="documentation-content__back-button"
          >
            ← Back to Documentation
          </Button>
        </div>
      )}
      
      <article className="documentation-content__article">
        <header className="documentation-content__article-header">
          <h1 className="documentation-content__title">{document.title}</h1>
          {document.excerpt && (
            <p className="documentation-content__excerpt">{document.excerpt}</p>
          )}
        </header>
        
        <div 
          className="documentation-content__body"
          dangerouslySetInnerHTML={{ __html: document.content || '' }}
        />
      </article>
    </div>
  );
};
