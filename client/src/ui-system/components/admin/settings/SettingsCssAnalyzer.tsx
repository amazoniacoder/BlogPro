import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import { useToast } from '@/ui-system/components/feedback';

interface CSSRule {
  selector: string;
  properties: Record<string, string>;
  file: string;
  line: number;
}

interface DuplicateGroup {
  id: string;
  rules: CSSRule[];
  duplicateType: 'identical' | 'similar';
  similarity: number;
}

interface AnalysisResult {
  totalFiles: number;
  totalRules: number;
  duplicateGroups: DuplicateGroup[];
  summary: {
    identicalDuplicates: number;
    similarDuplicates: number;
  };
}

interface ValidationError {
  file: string;
  line: number;
  column: number;
  message: string;
  property?: string;
  value?: string;
}

interface ValidationResult {
  totalFiles: number;
  validFiles: number;
  errors: ValidationError[];
  summary: {
    syntaxErrors: number;
    propertyErrors: number;
    valueErrors: number;
  };
}

const SettingsCssAnalyzer: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { showSuccess, showError } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);

  const refreshAnalyzer = async () => {
    try {
      const response = await fetch('/api/admin/css-analyzer/reset', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setResults(null);
        setValidationResults(null);
        setSelectedDuplicates(new Set());
        showSuccess(t('admin:analyzerRefreshed', { defaultValue: 'Analyzer refreshed successfully' }));
      } else {
        throw new Error(data.message || 'Failed to refresh analyzer');
      }
    } catch (error) {
      console.error('Failed to refresh analyzer:', error);
      showError(t('admin:refreshError', { defaultValue: 'Failed to refresh analyzer. Please try again.' }));
    }
  };

  const analyzeCSSFiles = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/admin/css-analyzer/analyze');
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        showSuccess(t('admin:analysisComplete', { defaultValue: 'CSS analysis completed successfully' }));
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      showError(t('admin:analysisError', { defaultValue: 'CSS analysis failed. Please check server logs.' }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateW3C = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/admin/css-analyzer/validate');
      const data = await response.json();
      
      if (data.success) {
        setValidationResults(data.data);
        showSuccess(t('admin:validationComplete', { defaultValue: 'W3C validation completed successfully' }));
      } else {
        throw new Error(data.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      showError(t('admin:validationError', { defaultValue: 'W3C validation failed. Please check server logs.' }));
    } finally {
      setIsValidating(false);
    }
  };

  const removeDuplicate = async (filePath: string, selector: string) => {
    try {
      const response = await fetch('/api/admin/css-analyzer/duplicate', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, selector })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(t('admin:duplicateRemoved', { defaultValue: 'Duplicate removed successfully' }));
        analyzeCSSFiles();
      } else {
        throw new Error(data.message || 'Failed to remove duplicate');
      }
    } catch (error) {
      console.error('Failed to remove duplicate:', error);
      showError(t('admin:removeError', { defaultValue: 'Failed to remove duplicate. Please try again.' }));
    }
  };

  const toggleDuplicateSelection = (ruleId: string) => {
    const newSelection = new Set(selectedDuplicates);
    if (newSelection.has(ruleId)) {
      newSelection.delete(ruleId);
    } else {
      newSelection.add(ruleId);
    }
    setSelectedDuplicates(newSelection);
  };

  const selectAllDuplicates = () => {
    if (!results) return;
    const allIds = new Set(results.duplicateGroups.map(g => g.id));
    setSelectedDuplicates(allIds);
  };

  const selectAllIdentical = () => {
    if (!results) return;
    const identicalIds = new Set(
      results.duplicateGroups
        .filter(g => g.duplicateType === 'identical')
        .map(g => g.id)
    );
    setSelectedDuplicates(identicalIds);
  };

  const deselectAll = () => {
    setSelectedDuplicates(new Set());
  };

  const removeSelectedDuplicates = async () => {
    if (!results) return;
    
    for (const groupId of selectedDuplicates) {
      const group = results.duplicateGroups.find(g => g.id === groupId);
      if (group && group.rules.length > 1) {
        for (let i = 1; i < group.rules.length; i++) {
          await removeDuplicate(group.rules[i].file, group.rules[i].selector);
        }
      }
    }
    
    setSelectedDuplicates(new Set());
    analyzeCSSFiles();
  };

  return (
    <div className="settings-content__panel settings-content__panel--active">
      <div className="css-analyzer">
        <div className="css-analyzer__header">
          <h2>{t('admin:cssAnalyzer', { defaultValue: 'CSS Duplicate Analyzer' })}</h2>
          <div className="analyzer-actions">
            <button 
              onClick={refreshAnalyzer}
              className="admin-button admin-button--secondary"
            >
              <Icon name="refresh" size={16} />
              {t('admin:refresh', { defaultValue: 'Refresh' })}
            </button>
            <button 
              onClick={validateW3C}
              disabled={isValidating}
              className="admin-button admin-button--secondary"
            >
              <Icon name="check" size={16} />
              {isValidating ? t('admin:validating', { defaultValue: 'Validating...' }) : t('admin:validateW3C', { defaultValue: 'Validate W3C' })}
            </button>
            <button 
              onClick={analyzeCSSFiles} 
              disabled={isAnalyzing}
              className="admin-button admin-button--primary"
            >
              <Icon name="search" size={16} />
              {isAnalyzing ? t('admin:analyzing', { defaultValue: 'Analyzing...' }) : t('admin:analyzeCss', { defaultValue: 'Analyze CSS Files' })}
            </button>
          </div>
        </div>

        {validationResults && (
          <div className="css-analyzer__validation">
            <div className="summary-card">
              <h3>{t('admin:w3cValidationResults', { defaultValue: 'W3C Validation Results' })}</h3>
              <p>{t('admin:totalFiles', { defaultValue: 'Total Files' })}: {validationResults.totalFiles}</p>
              <p>{t('admin:validFiles', { defaultValue: 'Valid Files' })}: {validationResults.validFiles}</p>
              <p>{t('admin:filesWithErrors', { defaultValue: 'Files with Errors' })}: {validationResults.totalFiles - validationResults.validFiles}</p>
              <p>{t('admin:syntaxErrors', { defaultValue: 'Syntax Errors' })}: {validationResults.summary.syntaxErrors}</p>
              <p>{t('admin:propertyErrors', { defaultValue: 'Property Errors' })}: {validationResults.summary.propertyErrors}</p>
              <p>{t('admin:valueErrors', { defaultValue: 'Value Errors' })}: {validationResults.summary.valueErrors}</p>
            </div>
            
            {validationResults.errors.length > 0 && (
              <div className="validation-errors">
                <h4>{t('admin:validationErrors', { defaultValue: 'Validation Errors' })}</h4>
                {validationResults.errors.map((error, index) => (
                  <div key={index} className="validation-error">
                    <div className="error-location">
                      {error.file}:{error.line}:{error.column}
                    </div>
                    <div className="error-message">{error.message}</div>
                    {error.property && (
                      <div className="error-details">
                        {t('admin:property', { defaultValue: 'Property' })}: {error.property}
                        {error.value && ` | ${t('admin:value', { defaultValue: 'Value' })}: ${error.value}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!results && !validationResults && (
          <div className="css-analyzer__placeholder">
            <div className="summary-card">
              <h3>{t('admin:cssAnalyzerReady', { defaultValue: 'CSS Analyzer Ready' })}</h3>
              <p>{t('admin:cssAnalyzerDesc', { defaultValue: 'Use the buttons above to analyze your CSS files for duplicates or validate against W3C standards.' })}</p>
              <div className="css-analyzer__features">
                <div className="feature-item">
                  <Icon name="search" size={16} />
                  <span>{t('admin:duplicateDetection', { defaultValue: 'Duplicate Detection' })}</span>
                </div>
                <div className="feature-item">
                  <Icon name="check" size={16} />
                  <span>{t('admin:w3cValidation', { defaultValue: 'W3C Validation' })}</span>
                </div>
                <div className="feature-item">
                  <Icon name="delete" size={16} />
                  <span>{t('admin:bulkRemoval', { defaultValue: 'Bulk Removal' })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="css-analyzer__results">
            <div className="css-analyzer__summary">
              <div className="summary-card">
                <h3>{t('admin:analysisSummary', { defaultValue: 'Analysis Summary' })}</h3>
                <p>{t('admin:totalFiles', { defaultValue: 'Total Files' })}: {results.totalFiles}</p>
                <p>{t('admin:totalRules', { defaultValue: 'Total Rules' })}: {results.totalRules}</p>
                <p>{t('admin:identicalDuplicates', { defaultValue: 'Identical Duplicates' })}: {results.summary.identicalDuplicates}</p>
                <p>{t('admin:similarDuplicates', { defaultValue: 'Similar Duplicates' })}: {results.summary.similarDuplicates}</p>
              </div>
            </div>

            {results.duplicateGroups.length > 0 && (
              <div className="css-analyzer__duplicates">
                <div className="duplicates-header">
                  <h3>{t('admin:foundDuplicates', { defaultValue: 'Found Duplicates' })}</h3>
                  <div className="duplicates-actions">
                    <button 
                      onClick={selectAllIdentical}
                      className="admin-button admin-button--secondary admin-button--small"
                    >
                      {t('admin:selectAllIdentical', { defaultValue: 'Select All Identical' })}
                    </button>
                    <button 
                      onClick={selectAllDuplicates}
                      className="admin-button admin-button--secondary admin-button--small"
                    >
                      {t('admin:selectAll', { defaultValue: 'Select All' })}
                    </button>
                    <button 
                      onClick={deselectAll}
                      className="admin-button admin-button--secondary admin-button--small"
                    >
                      {t('admin:deselectAll', { defaultValue: 'Deselect All' })}
                    </button>
                    {selectedDuplicates.size > 0 && (
                      <button 
                        onClick={removeSelectedDuplicates}
                        className="admin-button admin-button--danger"
                      >
                        <Icon name="delete" size={16} />
                        {t('admin:removeSelected', { defaultValue: 'Remove Selected' })} ({selectedDuplicates.size})
                      </button>
                    )}
                  </div>
                </div>

                {results.duplicateGroups.map((group) => (
                  <div key={group.id} className="duplicate-group">
                    <div className="duplicate-group__header">
                      <input
                        type="checkbox"
                        checked={selectedDuplicates.has(group.id)}
                        onChange={() => toggleDuplicateSelection(group.id)}
                        className="admin-form__checkbox-input"
                      />
                      <span className={`duplicate-type duplicate-type--${group.duplicateType}`}>
                        {group.duplicateType} ({Math.round(group.similarity * 100)}% {t('admin:similar', { defaultValue: 'similar' })})
                      </span>
                    </div>

                    <div className="duplicate-rules">
                      {group.rules.map((rule, index) => (
                        <div key={index} className="css-rule">
                          <div className="css-rule__header">
                            <strong>{rule.selector}</strong>
                            <span className="css-rule__location">
                              {rule.file}:{rule.line}
                            </span>
                            {index > 0 && (
                              <button
                                className="admin-button admin-button--secondary admin-button--small"
                                onClick={() => removeDuplicate(rule.file, rule.selector)}
                              >
                                <Icon name="delete" size={14} />
                                {t('admin:remove', { defaultValue: 'Remove' })}
                              </button>
                            )}
                          </div>
                          <div className="css-rule__properties">
                            {Object.entries(rule.properties).map(([prop, value]) => (
                              <div key={prop} className="css-property">
                                <span className="property-name">{prop}:</span>
                                <span className="property-value">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsCssAnalyzer;
