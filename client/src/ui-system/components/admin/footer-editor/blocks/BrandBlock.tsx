import React from 'react';
import { AdminEditorField } from '../../AdminEditorField';
import { Input } from '../../../input';
import { Textarea } from '../../../form';
import { FileUpload } from '../../../form';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface BrandBlockProps {
  block: FooterBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<FooterBlock>) => void;
}

interface BrandContent {
  logo?: string;
  companyName?: string;
  description?: string;
  website?: string;
}

export const BrandBlock: React.FC<BrandBlockProps> = ({
  block,
  isSelected,
  onUpdate
}) => {
  const content = (block.content || {}) as BrandContent;

  const handleContentChange = (field: keyof BrandContent, value: string) => {
    onUpdate({
      content: {
        ...content,
        [field]: value
      }
    });
  };

  const handleLogoUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      // In a real implementation, you would upload the file and get a URL
      const logoUrl = URL.createObjectURL(files[0]);
      handleContentChange('logo', logoUrl);
    }
  };

  if (isSelected) {
    return (
      <div className="brand-block brand-block--editing">
        <AdminEditorField label="Логотип">
          <FileUpload
            accept="image/*"
            onFileSelect={handleLogoUpload}
          />
          {content.logo && (
            <div className="brand-block__logo-preview">
              <img src={content.logo} alt="Logo preview" />
            </div>
          )}
        </AdminEditorField>

        <AdminEditorField label="Название компании">
          <Input
            value={content.companyName || ''}
            onChange={(e) => handleContentChange('companyName', e.target.value)}
            placeholder="Введите название компании"
          />
        </AdminEditorField>

        <AdminEditorField label="Описание">
          <Textarea
            value={content.description || ''}
            onChange={(e) => handleContentChange('description', e.target.value)}
            placeholder="Краткое описание компании"
            rows={3}
          />
        </AdminEditorField>

        <AdminEditorField label="Веб-сайт">
          <Input
            type="url"
            value={content.website || ''}
            onChange={(e) => handleContentChange('website', e.target.value)}
            placeholder="https://example.com"
          />
        </AdminEditorField>
      </div>
    );
  }

  return (
    <div className="brand-block" style={block.styles}>
      {content.logo && (
        <div className="brand-block__logo">
          <img src={content.logo} alt={content.companyName || 'Logo'} />
        </div>
      )}
      
      {content.companyName && (
        <h3 className="brand-block__name">
          {content.companyName}
        </h3>
      )}
      
      {content.description && (
        <p className="brand-block__description">
          {content.description}
        </p>
      )}
      
      {content.website && (
        <a 
          href={content.website}
          className="brand-block__website"
          target="_blank"
          rel="noopener noreferrer"
        >
          Посетить сайт
        </a>
      )}
    </div>
  );
};