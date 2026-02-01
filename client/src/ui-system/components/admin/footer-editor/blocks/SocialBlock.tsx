import React, { useState } from 'react';
import { Input } from '../../../input';
import { Button } from '../../../button';
import { Icon } from '../../../../icons/components';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface SocialBlockProps {
  block: FooterBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<FooterBlock>) => void;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface SocialContent {
  title?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
}

const socialPlatforms = [
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'twitter', label: 'Twitter', icon: 'twitter' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' },
  { value: 'telegram', label: 'Telegram', icon: 'telegram' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'share' },
  { value: 'vk', label: 'VKontakte', icon: 'users' },
  { value: 'github', label: 'GitHub', icon: 'share' }
];

export const SocialBlock: React.FC<SocialBlockProps> = ({
  block,
  isSelected,
  onUpdate
}) => {
  const content = (block.content || {}) as SocialContent;
  const [newLink, setNewLink] = useState<Partial<SocialLink>>({});

  const handleContentChange = (field: keyof SocialContent, value: any) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  const handleAddLink = () => {
    if (!newLink.platform || !newLink.url) return;

    const platform = socialPlatforms.find(p => p.value === newLink.platform);
    if (!platform) return;

    const socialLinks = content.socialLinks || [];
    const link = {
      platform: newLink.platform,
      url: newLink.url,
      icon: platform.icon
    };

    handleContentChange('socialLinks', [...socialLinks, link]);
    setNewLink({});
  };

  const handleUpdateLink = (linkIndex: number, updates: Partial<SocialLink>) => {
    const socialLinks = content.socialLinks || [];
    const updatedLinks = socialLinks.map((link, index) => {
      if (index === linkIndex) {
        const updatedLink = { ...link, ...updates };
        if (updates.platform) {
          const platform = socialPlatforms.find(p => p.value === updates.platform);
          if (platform) {
            updatedLink.icon = platform.icon;
          }
        }
        return updatedLink;
      }
      return link;
    });
    handleContentChange('socialLinks', updatedLinks);
  };

  const handleDeleteLink = (linkIndex: number) => {
    const socialLinks = content.socialLinks || [];
    const filteredLinks = socialLinks.filter((_, index) => index !== linkIndex);
    handleContentChange('socialLinks', filteredLinks);
  };

  if (isSelected) {
    return (
      <div className="social-block social-block--editing">
        <div>
          <div className="social-block__field">
            <label className="social-block__label">Заголовок</label>
            <Input
              value={content.title || ''}
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Например: Мы в соцсетях"
            />
          </div>

          <div className="social-block__editor">
            <h4>Социальные сети</h4>
            
            {(content.socialLinks || []).map((link, index) => (
              <div key={index} className="social-block__link-item">
                <div className="social-block__link-fields">
                  <select
                    value={link.platform}
                    onChange={(e) => handleUpdateLink(index, { platform: e.target.value })}
                  >
                    <option value="">Выберите платформу</option>
                    {socialPlatforms.map(platform => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="URL профиля"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(index, { url: e.target.value })}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteLink(index)}
                >
                  <Icon name="delete" size={14} />
                </Button>
              </div>
            ))}

            <div className="social-block__add-link">
              <div className="social-block__link-fields">
                <select
                  value={newLink.platform || ''}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                >
                  <option value="">Выберите платформу</option>
                  {socialPlatforms.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="URL профиля"
                  value={newLink.url || ''}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddLink}
                disabled={!newLink.platform || !newLink.url}
              >
                <Icon name="add" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="social-block" style={block.styles}>
      {content.title && (
        <h4 className="social-block__title">
          {content.title}
        </h4>
      )}
      
      {content.socialLinks && content.socialLinks.length > 0 && (
        <div className="social-block__links">
          {content.socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-block__link"
              title={socialPlatforms.find(p => p.value === link.platform)?.label}
            >
              <Icon name={link.icon as any} size={20} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};