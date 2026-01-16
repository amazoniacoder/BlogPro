
/**
 * Grammar Error Display Component
 * 
 * Enhanced error display for grammar errors with better UX
 */

import React from 'react';
import { GrammarError } from '../types/LanguageTypes';

interface GrammarErrorDisplayProps {
  error: GrammarError;
  onApplySuggestion: (suggestion: string) => void;
  onIgnoreError: () => void;
  onLearnCorrection?: (original: string, corrected: string) => void;
}

export const GrammarErrorDisplay: React.FC<GrammarErrorDisplayProps> = ({
  error,
  onApplySuggestion,
  onIgnoreError,
  onLearnCorrection
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'suggestion': return '💡';
      default: return '📝';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'suggestion': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getTypeDescription = (type: string, subtype?: string) => {
    if (subtype) {
      switch (subtype) {
        case 'comma': return 'Пунктуация: запятые';
        case 'quotes': return 'Пунктуация: кавычки';
        case 'capitalization': return 'Заглавные буквы';
        case 'sentence_ending': return 'Окончание предложения';
        default: return `${type}: ${subtype}`;
      }
    }
    
    switch (type) {
      case 'punctuation': return 'Пунктуация';
      case 'syntax': return 'Синтаксис';
      case 'agreement': return 'Согласование';
      case 'style': return 'Стиль';
      default: return type;
    }
  };

  return (
    <div 
      className="grammar-error-display"
      style={{
        border: `2px solid ${getSeverityColor(error.severity)}`,
        borderRadius: '8px',
        padding: '12px',
        margin: '8px 0',
        backgroundColor: '#f9fafb',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {/* Error Header */}
      <div 
        className="grammar-error-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        <span style={{ marginRight: '8px', fontSize: '16px' }}>
          {getSeverityIcon(error.severity)}
        </span>
        <span style={{ color: getSeverityColor(error.severity) }}>
          {getTypeDescription(error.type, error.subtype)}
        </span>
        <span 
          style={{ 
            marginLeft: 'auto', 
            fontSize: '12px', 
            color: '#6b7280',
            backgroundColor: '#e5e7eb',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
        >
          {Math.round(error.confidence * 100)}%
        </span>
      </div>

      {/* Error Message */}
      <div 
        className="grammar-error-message"
        style={{
          fontSize: '14px',
          color: '#374151',
          marginBottom: '8px',
          lineHeight: '1.4'
        }}
      >
        <strong>{error.message}</strong>
      </div>

      {/* Error Explanation */}
      {error.explanation && (
        <div 
          className="grammar-error-explanation"
          style={{
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '12px',
            fontStyle: 'italic',
            lineHeight: '1.3'
          }}
        >
          {error.explanation}
        </div>
      )}

      {/* Error Context */}
      <div 
        className="grammar-error-context"
        style={{
          fontSize: '13px',
          backgroundColor: '#f3f4f6',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '12px',
          fontFamily: 'monospace',
          border: '1px solid #e5e7eb'
        }}
      >
        <span style={{ color: '#6b7280' }}>Контекст: </span>
        <span style={{ color: '#1f2937' }}>
          {error.context.substring(0, error.start - error.context.indexOf(error.text))}
        </span>
        <span 
          style={{ 
            backgroundColor: getSeverityColor(error.severity) + '20',
            color: getSeverityColor(error.severity),
            fontWeight: 'bold',
            padding: '1px 2px',
            borderRadius: '2px'
          }}
        >
          {error.text}
        </span>
        <span style={{ color: '#1f2937' }}>
          {error.context.substring(error.end - error.context.indexOf(error.text))}
        </span>
      </div>

      {/* Suggestions */}
      {error.suggestions && error.suggestions.length > 0 && (
        <div className="grammar-error-suggestions" style={{ marginBottom: '12px' }}>
          <div 
            style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '6px' 
            }}
          >
            Предложения:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {error.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onApplySuggestion(suggestion)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div 
        className="grammar-error-actions"
        style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end' 
        }}
      >
        <button
          onClick={onIgnoreError}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Игнорировать
        </button>
        
        {onLearnCorrection && error.suggestions.length > 0 && (
          <button
            onClick={() => onLearnCorrection!(error.text, error.suggestions[0])}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Запомнить
          </button>
        )}
      </div>
    </div>
  );
};
