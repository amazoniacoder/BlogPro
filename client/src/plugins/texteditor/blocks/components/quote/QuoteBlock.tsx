import React from 'react';
import { AbstractBlock } from '../../types/BaseBlock';
import './QuoteBlock.css';

interface QuoteData {
  content: string;
  author?: string;
  citation?: string;
}

export class QuoteBlock extends AbstractBlock {
  render(): React.ReactElement {
    const data = this.data as QuoteData;
    
    return (
      <blockquote className="quote-block">
        <div className="quote-block__content">{data.content}</div>
        {data.author && (
          <cite className="quote-block__author">— {data.author}</cite>
        )}
        {data.citation && (
          <div className="quote-block__citation">{data.citation}</div>
        )}
      </blockquote>
    );
  }

  serialize(): string {
    return JSON.stringify(this.data);
  }

  deserialize(data: string): void {
    this.data = JSON.parse(data);
  }
}
