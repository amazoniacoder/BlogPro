import React, { useState } from 'react';
import { AdminEditorField } from '../../AdminEditorField';
import { Input } from '../../../input';
import { Textarea } from '../../../form';
import { Button } from '../../../button';
import { Icon } from '../../../../icons/components';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface CustomBlockProps {
  block: FooterBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<FooterBlock>) => void;
}

interface CustomContent {
  title?: string;
  html?: string;
  css?: string;
}

export const CustomBlock: React.FC<CustomBlockProps> = ({
  block,
  isSelected,
  onUpdate
}) => {
  const content = (block.content || {}) as CustomContent;
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  const handleContentChange = (field: keyof CustomContent, value: string) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  const sanitizeHTML = (html: string) => {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  if (isSelected) {
    return (
      <div className="custom-block custom-block--editing">
        <AdminEditorField label="Заголовок блока">
          <Input
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            placeholder="Заголовок (необязательно)"
          />
        </AdminEditorField>

        <div className="custom-block__editor">
          <div className="custom-block__editor-header">
            <h4>HTML контент</h4>
            <div className="custom-block__editor-tabs">
              <Button
                variant={previewMode === 'edit' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPreviewMode('edit')}
              >
                <Icon name="gear" size={14} />
                Код
              </Button>
              <Button
                variant={previewMode === 'preview' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPreviewMode('preview')}
              >
                <Icon name="eye" size={14} />
                Превью
              </Button>
            </div>
          </div>

          {previewMode === 'edit' ? (
            <>
              <AdminEditorField label="HTML">
                <Textarea
                  value={content.html || ''}
                  onChange={(e) => handleContentChange('html', e.target.value)}
                  placeholder="<div>Ваш HTML код здесь</div>"
                  rows={8}
                  className="custom-block__html-editor"
                />
              </AdminEditorField>

              <AdminEditorField label="CSS (необязательно)">
                <Textarea
                  value={content.css || ''}
                  onChange={(e) => handleContentChange('css', e.target.value)}
                  placeholder=".my-class { color: red; }"
                  rows={4}
                  className="custom-block__css-editor"
                />
              </AdminEditorField>
            </>
          ) : (
            <div className="custom-block__preview">
              {content.css && (
                <style dangerouslySetInnerHTML={{ __html: content.css }} />
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(content.html || '')
                }}
              />
            </div>
          )}
        </div>

        <div className="custom-block__help">
          <Icon name="info" size={16} />
          <div>
            <strong>Безопасность:</strong> JavaScript код будет удален из соображений безопасности.
            Используйте только HTML и CSS.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-block" style={block.styles}>
      {content.title && (
        <h4 className="custom-block__title">
          {content.title}
        </h4>
      )}
      
      {content.css && (
        <style dangerouslySetInnerHTML={{ __html: content.css }} />
      )}
      
      {content.html && (
        <div
          className="custom-block__content"
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(content.html)
          }}
        />
      )}
    </div>
  );
};