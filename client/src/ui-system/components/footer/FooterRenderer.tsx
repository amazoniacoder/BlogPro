import React, { useEffect, useState } from 'react';
import { footerApi } from '../../../services/api/footer';
import { BrandBlock } from '../admin/footer-editor/blocks/BrandBlock';
import { LinksBlock } from '../admin/footer-editor/blocks/LinksBlock';
import { ContactBlock } from '../admin/footer-editor/blocks/ContactBlock';
import { SocialBlock } from '../admin/footer-editor/blocks/SocialBlock';
import { NewsletterBlock } from '../admin/footer-editor/blocks/NewsletterBlock';
import { CustomBlock } from '../admin/footer-editor/blocks/CustomBlock';
import type { FooterConfig, FooterBlock } from '../../../../../shared/types/footer';
import './footer-renderer.css';

interface FooterRendererProps {
  className?: string;
}

export const FooterRenderer: React.FC<FooterRendererProps> = ({ className }) => {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFooterConfig();
  }, []);

  const loadFooterConfig = async () => {
    try {
      const activeConfig = await footerApi.getActiveConfig();
      setConfig(activeConfig);
    } catch (error) {
      console.error('Failed to load footer config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBlock = (block: FooterBlock) => {
    const blockProps = {
      block,
      isSelected: false,
      onUpdate: () => {} // No updates in render mode
    };

    switch (block.type) {
      case 'brand':
        return <BrandBlock key={block.id} {...blockProps} />;
      case 'links':
        return <LinksBlock key={block.id} {...blockProps} />;
      case 'contact':
        return <ContactBlock key={block.id} {...blockProps} />;
      case 'social':
        return <SocialBlock key={block.id} {...blockProps} />;
      case 'newsletter':
        return <NewsletterBlock key={block.id} {...blockProps} />;
      case 'custom':
        return <CustomBlock key={block.id} {...blockProps} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <footer className={`footer-renderer footer-renderer--loading ${className || ''}`}>
        <div className="footer-renderer__loading">
          Загрузка футера...
        </div>
      </footer>
    );
  }

  if (!config || config.blocks.length === 0) {
    return null; // No footer to render
  }

  const footerStyle = {
    backgroundColor: config.styles?.backgroundColor,
    color: config.styles?.textColor,
    padding: config.styles?.padding,
    margin: config.styles?.margin,
    '--link-color': config.styles?.linkColor,
    '--border-color': config.styles?.borderColor
  } as React.CSSProperties;

  const layoutClasses = [
    'footer-renderer',
    `footer-renderer--${config.layout?.type || 'grid'}`,
    `footer-renderer--theme-${config.styles?.theme || 'light'}`,
    className
  ].filter(Boolean).join(' ');

  const layoutStyle = {
    gridTemplateColumns: config.layout?.type === 'grid' 
      ? `repeat(${config.layout.columns || 3}, 1fr)` 
      : undefined,
    gap: config.layout?.gap,
    maxWidth: config.layout?.maxWidth
  };

  return (
    <footer className={layoutClasses} style={footerStyle}>
      <div className="footer-renderer__container" style={layoutStyle}>
        {config.blocks
          .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
          .map(renderBlock)}
      </div>
    </footer>
  );
};