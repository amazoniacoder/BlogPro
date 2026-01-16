/**
 * Word Count Component
 * 
 * Displays real-time word count, character count, and estimated reading time.
 * Provides comprehensive text analysis with accessibility support.
 * 
 * Features:
 * - Real-time word and character counting
 * - Estimated reading time calculation
 * - Paragraph and sentence counting
 * - Configurable display options
 * - Accessibility compliant with ARIA labels
 * - Mobile responsive design
 * 
 * @author BlogPro Text Editor Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UnifiedTextAnalysisService } from '../services/analysis/UnifiedTextAnalysisService';
import './WordCount.css';

// Types
export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  readingTime: number; // in minutes
}

export interface WordCountProps {
  /** Content to analyze */
  content: string;
  /** Display options */
  showWords?: boolean;
  showCharacters?: boolean;
  showReadingTime?: boolean;
  showParagraphs?: boolean;
  showSentences?: boolean;
  /** Reading speed in words per minute */
  readingSpeed?: number;
  /** Update frequency in milliseconds */
  updateDelay?: number;
  /** Custom CSS class */
  className?: string;
  /** Compact display mode */
  compact?: boolean;
  /** Callback when stats change */
  onStatsChange?: (stats: TextStats) => void;
}

const WordCount: React.FC<WordCountProps> = ({
  content,
  showWords = true,
  showCharacters = true,
  showReadingTime = true,
  showParagraphs = false,
  showSentences = false,
  readingSpeed = 200, // Average reading speed
  updateDelay = 300, // 300ms debounce
  className = '',
  compact = false,
  onStatsChange
}) => {
  const [stats, setStats] = useState<TextStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    sentences: 0,
    readingTime: 0
  });

  // Calculate text statistics using TextAnalysisService
  const calculateStats = useCallback((text: string): TextStats => {
    try {
      const analysisResult = UnifiedTextAnalysisService.analyzeText(text, {
        readingSpeed,
        includeHtml: false
      });
      

      
      return {
        words: analysisResult.words,
        characters: analysisResult.characters,
        charactersNoSpaces: analysisResult.charactersNoSpaces,
        paragraphs: analysisResult.paragraphs,
        sentences: analysisResult.sentences,
        readingTime: analysisResult.readingTime
      };
    } catch (error) {

      
      // Fallback to simple word counting
      const plainText = text.replace(/<[^>]*>/g, '');
      const wordMatches = plainText.match(/[\p{L}\p{N}]{2,}/gu);
      const words = wordMatches ? wordMatches.length : 0;
      const charactersNoSpaces = plainText.replace(/\s/g, '').length;
      
      return {
        words,
        characters: plainText.length,
        charactersNoSpaces,
        paragraphs: 1,
        sentences: 1,
        readingTime: Math.ceil(words / readingSpeed)
      };
    }
  }, [readingSpeed]);

  // Debounced stats update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newStats = calculateStats(content);
      setStats(newStats);
      onStatsChange?.(newStats);
    }, updateDelay);

    return () => clearTimeout(timeoutId);
  }, [content, calculateStats, updateDelay, onStatsChange]);

  // Format reading time display
  const formatReadingTime = (minutes: number): string => {
    if (minutes === 0) return '< 1 min read';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
  };

  // Format number with commas for large numbers
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Render individual stat item
  const renderStat = (label: string, value: string | number, key: string, tooltip: string) => (
    <div key={key} className="word-count__stat" title={tooltip}>
      <span className="word-count__value" aria-label={`${label}: ${value}`}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </span>
      {!compact && (
        <span className="word-count__label" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  );

  // Build stats array based on display options
  const statsToShow = [];
  
  if (showWords) {
    statsToShow.push(renderStat(
      compact ? 'Words' : 'words',
      stats.words,
      'words',
      `Word count: ${formatNumber(stats.words)} words in this document`
    ));
  }
  
  if (showCharacters) {
    statsToShow.push(renderStat(
      compact ? 'Chars' : 'characters',
      stats.charactersNoSpaces,
      'characters',
      `Character count: ${formatNumber(stats.charactersNoSpaces)} characters (excluding spaces)`
    ));
  }
  
  if (showParagraphs) {
    statsToShow.push(renderStat(
      compact ? 'Paras' : 'paragraphs',
      stats.paragraphs,
      'paragraphs',
      `Paragraph count: ${formatNumber(stats.paragraphs)} paragraphs in this document`
    ));
  }
  
  if (showSentences) {
    statsToShow.push(renderStat(
      compact ? 'Sents' : 'sentences',
      stats.sentences,
      'sentences',
      `Sentence count: ${formatNumber(stats.sentences)} sentences in this document`
    ));
  }
  
  if (showReadingTime) {
    statsToShow.push(renderStat(
      compact ? 'Read' : 'reading time',
      formatReadingTime(stats.readingTime),
      'reading-time',
      `Estimated reading time: ${formatReadingTime(stats.readingTime)} at ${readingSpeed} words per minute`
    ));
  }

  if (statsToShow.length === 0) {
    return null;
  }

  return (
    <div 
      className={`word-count ${compact ? 'word-count--compact' : ''} ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Document statistics"
    >
      <div className="word-count__stats">
        {statsToShow}
      </div>
    </div>
  );
};

export default WordCount;
