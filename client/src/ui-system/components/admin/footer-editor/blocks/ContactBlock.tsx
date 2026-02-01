import React from 'react';
import { AdminEditorField } from '../../AdminEditorField';
import { Input } from '../../../input';
import { Textarea } from '../../../form';
import { Icon } from '../../../../icons/components';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface ContactBlockProps {
  block: FooterBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<FooterBlock>) => void;
}

interface ContactContent {
  title?: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
}

export const ContactBlock: React.FC<ContactBlockProps> = ({
  block,
  isSelected,
  onUpdate
}) => {
  const content = (block.content || {}) as ContactContent;

  const handleContentChange = (field: keyof ContactContent, value: string) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  if (isSelected) {
    return (
      <div className="contact-block contact-block--editing">
        <AdminEditorField label="Заголовок">
          <Input
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            placeholder="Например: Контакты"
          />
        </AdminEditorField>

        <AdminEditorField label="Адрес">
          <Textarea
            value={content.address || ''}
            onChange={(e) => handleContentChange('address', e.target.value)}
            placeholder="Введите адрес"
            rows={2}
          />
        </AdminEditorField>

        <AdminEditorField label="Телефон">
          <Input
            type="tel"
            value={content.phone || ''}
            onChange={(e) => handleContentChange('phone', e.target.value)}
            placeholder="+7 (999) 123-45-67"
          />
        </AdminEditorField>

        <AdminEditorField label="Email">
          <Input
            type="email"
            value={content.email || ''}
            onChange={(e) => handleContentChange('email', e.target.value)}
            placeholder="info@example.com"
          />
        </AdminEditorField>

        <AdminEditorField label="Часы работы">
          <Input
            value={content.workingHours || ''}
            onChange={(e) => handleContentChange('workingHours', e.target.value)}
            placeholder="Пн-Пт: 9:00-18:00"
          />
        </AdminEditorField>
      </div>
    );
  }

  return (
    <div className="contact-block" style={block.styles}>
      {content.title && (
        <h4 className="contact-block__title">
          {content.title}
        </h4>
      )}
      
      <div className="contact-block__items">
        {content.address && (
          <div className="contact-block__item">
            <Icon name="house" size={16} className="contact-block__icon" />
            <span className="contact-block__text">
              {content.address}
            </span>
          </div>
        )}
        
        {content.phone && (
          <div className="contact-block__item">
            <Icon name="bell" size={16} className="contact-block__icon" />
            <a 
              href={`tel:${content.phone.replace(/\D/g, '')}`}
              className="contact-block__link"
            >
              {content.phone}
            </a>
          </div>
        )}
        
        {content.email && (
          <div className="contact-block__item">
            <Icon name="email" size={16} className="contact-block__icon" />
            <a 
              href={`mailto:${content.email}`}
              className="contact-block__link"
            >
              {content.email}
            </a>
          </div>
        )}
        
        {content.workingHours && (
          <div className="contact-block__item">
            <Icon name="clock" size={16} className="contact-block__icon" />
            <span className="contact-block__text">
              {content.workingHours}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};