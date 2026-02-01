import React from 'react';
import { AdminEditorField } from '../../AdminEditorField';
import { Input } from '../../../input';
import { Textarea } from '../../../form';
import { Button } from '../../../button';
import { Icon } from '../../../../icons/components';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface NewsletterBlockProps {
  block: FooterBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<FooterBlock>) => void;
}

interface NewsletterContent {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  privacyText?: string;
}

export const NewsletterBlock: React.FC<NewsletterBlockProps> = ({
  block,
  isSelected,
  onUpdate
}) => {
  const content = (block.content || {}) as NewsletterContent;

  const handleContentChange = (field: keyof NewsletterContent, value: string) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription submitted');
  };

  if (isSelected) {
    return (
      <div className="newsletter-block newsletter-block--editing">
        <AdminEditorField label="Заголовок">
          <Input
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            placeholder="Например: Подпишитесь на рассылку"
          />
        </AdminEditorField>

        <AdminEditorField label="Описание">
          <Textarea
            value={content.description || ''}
            onChange={(e) => handleContentChange('description', e.target.value)}
            placeholder="Получайте последние новости и обновления"
            rows={2}
          />
        </AdminEditorField>

        <AdminEditorField label="Placeholder для email">
          <Input
            value={content.placeholder || ''}
            onChange={(e) => handleContentChange('placeholder', e.target.value)}
            placeholder="Введите ваш email"
          />
        </AdminEditorField>

        <AdminEditorField label="Текст кнопки">
          <Input
            value={content.buttonText || ''}
            onChange={(e) => handleContentChange('buttonText', e.target.value)}
            placeholder="Подписаться"
          />
        </AdminEditorField>

        <AdminEditorField label="Текст о конфиденциальности">
          <Textarea
            value={content.privacyText || ''}
            onChange={(e) => handleContentChange('privacyText', e.target.value)}
            placeholder="Мы не передаем ваши данные третьим лицам"
            rows={2}
          />
        </AdminEditorField>
      </div>
    );
  }

  return (
    <div className="newsletter-block" style={block.styles}>
      {content.title && (
        <h4 className="newsletter-block__title">
          {content.title}
        </h4>
      )}
      
      {content.description && (
        <p className="newsletter-block__description">
          {content.description}
        </p>
      )}
      
      <form className="newsletter-block__form" onSubmit={handleSubmit}>
        <div className="newsletter-block__input-group">
          <Input
            type="email"
            placeholder={content.placeholder || 'Введите ваш email'}
            required
            className="newsletter-block__input"
          />
          <Button
            type="submit"
            variant="primary"
            className="newsletter-block__button"
          >
            <Icon name="email" size={16} />
            {content.buttonText || 'Подписаться'}
          </Button>
        </div>
      </form>
      
      {content.privacyText && (
        <p className="newsletter-block__privacy">
          {content.privacyText}
        </p>
      )}
    </div>
  );
};