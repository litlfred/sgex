/**
 * FAQ Answer React Component
 * Renders FAQ question results with internationalization support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import faqExecutionEngine from '../engine/FAQExecutionEngine.js';
import DOMPurify from 'dompurify';
import './FAQAnswer.css';

const FAQAnswer = ({ 
  questionId, 
  parameters = {}, 
  githubService = null,
  assetFiles = [],
  showRawData = false,
  className = '',
  executionMode = 'client-side' // 'client-side' or 'mcp-service'
}) => {
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeQuestion = useCallback(async () => {
    if (!questionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let questionResult;

      if (executionMode === 'client-side') {
        // Client-side execution using FAQExecutionEngine
        if (!githubService) {
          throw new Error('GitHub service is required for client-side execution');
        }

        const request = {
          questionId,
          parameters: {
            ...parameters,
            locale: i18n.language.replace('-', '_') || 'en_US'
          },
          assetFiles
        };

        const context = { githubService };
        questionResult = await faqExecutionEngine.executeQuestion(request, context);

      } else if (executionMode === 'mcp-service') {
        // MCP service execution
        const request = {
          questionId,
          parameters: {
            ...parameters,
            locale: i18n.language.replace('-', '_') || 'en_US'
          },
          assetFiles
        };

        const response = await fetch('http://127.0.0.1:3001/mcp/faq/questions/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questions: [request]
          })
        });

        if (!response.ok) {
          throw new Error(`MCP service error: ${response.status} ${response.statusText}`);
        }

        const mcpResponse = await response.json();
        if (!mcpResponse.success || !mcpResponse.results || mcpResponse.results.length === 0) {
          throw new Error('MCP service returned no results');
        }

        const result = mcpResponse.results[0];
        if (!result.success) {
          throw new Error(result.error || 'MCP service execution failed');
        }

        questionResult = result.result;

      } else {
        throw new Error(`Unknown execution mode: ${executionMode}`);
      }
      
      setResult(questionResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [questionId, parameters, githubService, assetFiles, i18n.language, executionMode]);

  useEffect(() => {
    executeQuestion();
  }, [executeQuestion]);

  const sanitizeHTML = (html) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'time', 'small'],
      ALLOWED_ATTR: ['class', 'datetime']
    });
  };

  const renderNarrative = () => {
    if (!result?.narrative) return null;

    return (
      <div 
        className="faq-narrative"
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(result.narrative) }}
      />
    );
  };

  const renderStructuredData = () => {
    if (!showRawData || !result?.structured) return null;

    return (
      <details className="faq-structured-data">
        <summary>{t('dak.faq.structured_data')}</summary>
        <pre>{JSON.stringify(result.structured, null, 2)}</pre>
      </details>
    );
  };

  const renderMessages = () => {
    const warnings = result?.warnings || [];
    const errors = result?.errors || [];
    
    if (warnings.length === 0 && errors.length === 0) return null;

    return (
      <div className="faq-messages">
        {errors.map((error, index) => (
          <div key={`error-${index}`} className="faq-message faq-error">
            <span className="faq-message-icon">⚠️</span>
            {error}
          </div>
        ))}
        {warnings.map((warning, index) => (
          <div key={`warning-${index}`} className="faq-message faq-warning">
            <span className="faq-message-icon">⚠️</span>
            {warning}
          </div>
        ))}
      </div>
    );
  };

  const renderMetadata = () => {
    if (!showRawData || !result?.meta) return null;

    return (
      <details className="faq-metadata">
        <summary>{t('dak.faq.metadata')}</summary>
        <pre>{JSON.stringify(result.meta, null, 2)}</pre>
      </details>
    );
  };

  if (loading) {
    return (
      <div className={`faq-answer loading ${className}`}>
        <div className="faq-loading-spinner"></div>
        <p>{t('dak.faq.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`faq-answer error ${className}`}>
        <h4>{t('dak.faq.error_title')}</h4>
        <p className="faq-error-message">{error}</p>
        <button onClick={executeQuestion} className="faq-retry-button">
          {t('dak.faq.retry')}
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`faq-answer empty ${className}`}>
        <p>{t('dak.faq.no_data')}</p>
      </div>
    );
  }

  return (
    <div className={`faq-answer success ${className}`}>
      <div className="faq-execution-mode">
        <small>
          {executionMode === 'client-side' ? 
            '🌐 Executed client-side via GitHub API' : 
            '🖥️ Executed via MCP service'
          }
        </small>
      </div>
      {renderNarrative()}
      {renderMessages()}
      {renderStructuredData()}
      {renderMetadata()}
    </div>
  );
};

export default FAQAnswer;