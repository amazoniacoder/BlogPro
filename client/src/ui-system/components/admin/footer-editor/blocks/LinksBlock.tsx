import React, { useState } from 'react';
import { AdminEditorField } from '../../AdminEditorField';
import { Input } from '../../../input';
import { Button } from '../../../button';
import { Icon } from '../../../../icons/components';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface LinksBlockProps {
  block: FooterBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<FooterBlock>) => void;
}

interface LinkItem {
  id: string;
  label: string;
  url: string;
  target?: '_blank' | '_self';
}

interface LinksContent {
  title?: string;
  links?: LinkItem[];
}

export const LinksBlock: React.FC<LinksBlockProps> = ({
  block,
  isSelected,
  onUpdate
}) => {
  const content = (block.content || {}) as LinksContent;
  const [newLink, setNewLink] = useState<Partial<LinkItem>>({});

  const handleContentChange = (field: keyof LinksContent, value: any) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  const handleAddLink = () => {
    if (!newLink.label || !newLink.url) return;

    const links = content.links || [];
    const link: LinkItem = {
      id: `link-${Date.now()}`,
      label: newLink.label,
      url: newLink.url,
      target: newLink.target || '_self'
    };

    handleContentChange('links', [...links, link]);
    setNewLink({});
  };

  const handleUpdateLink = (linkId: string, updates: Partial<LinkItem>) => {
    const links = content.links || [];
    const updatedLinks = links.map(link =>
      link.id === linkId ? { ...link, ...updates } : link
    );
    handleContentChange('links', updatedLinks);
  };

  const handleDeleteLink = (linkId: string) => {
    const links = content.links || [];
    const filteredLinks = links.filter(link => link.id !== linkId);
    handleContentChange('links', filteredLinks);
  };

  if (isSelected) {
    return (
      <div className="links-block links-block--editing">
        <AdminEditorField label="Заголовок секции">
          <Input
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            placeholder="Например: Навигация"
          />
        </AdminEditorField>

        <div className="links-block__editor">
          <h4>Ссылки</h4>
          
          {(content.links || []).map((link) => (
            <div key={link.id} className="links-block__link-item">
              <div className="links-block__link-fields">
                <Input
                  placeholder="Текст ссылки"
                  value={link.label}
                  onChange={(e) => handleUpdateLink(link.id, { label: e.target.value })}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                />
                <select
                  value={link.target || '_self'}
                  onChange={(e) => handleUpdateLink(link.id, { target: e.target.value as '_blank' | '_self' })}
                >
                  <option value="_self">Текущая вкладка</option>
                  <option value="_blank">Новая вкладка</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteLink(link.id)}
              >
                <Icon name="delete" size={14} />
              </Button>
            </div>
          ))}

          <div className="links-block__add-link">
            <div className="links-block__link-fields">
              <Input
                placeholder="Текст ссылки"
                value={newLink.label || ''}
                onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              />
              <Input
                placeholder="URL"
                value={newLink.url || ''}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              />
              <select
                value={newLink.target || '_self'}
                onChange={(e) => setNewLink({ ...newLink, target: e.target.value as '_blank' | '_self' })}
              >
                <option value="_self">Текущая вкладка</option>
                <option value="_blank">Новая вкладка</option>
              </select>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddLink}
              disabled={!newLink.label || !newLink.url}
            >
              <Icon name="add" size={14} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="links-block" style={block.styles}>
      {content.title && (
        <h4 className="links-block__title">
          {content.title}
        </h4>
      )}
      
      {content.links && content.links.length > 0 && (
        <ul className="links-block__list">
          {content.links.map((link) => (
            <li key={link.id} className="links-block__item">
              <a
                href={link.url}
                target={link.target}
                rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="links-block__link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};