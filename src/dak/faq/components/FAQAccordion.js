/**
 * FAQ Accordion Component
 * Displays FAQ questions in an expandable accordion format
 * Questions are only executed when the user expands them
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import faqExecutionEngine from '../engine/FAQExecutionEngine.js';
import DOMPurify from 'dompurify';
import './FAQAccordion.css';

const FAQAccordion = ({ 
  repository,
  branch = 'main',
  githubService,
  filters = {},
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [questionResults, setQuestionResults] = useState(new Map());
  const [loadingQuestions, setLoadingQuestions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        await faqExecutionEngine.initialize();
        const availableQuestions = faqExecutionEngine.getCatalog(filters);
        setQuestions(availableQuestions);
        setError(null);
      } catch (err) {
        console.error('Failed to load FAQ questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [filters]);

  // Toggle question expansion
  const toggleQuestion = async (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    
    if (expandedQuestions.has(questionId)) {
      // Collapse question
      newExpanded.delete(questionId);
    } else {
      // Expand question and execute if not already executed
      newExpanded.add(questionId);
      
      if (!questionResults.has(questionId)) {
        await executeQuestion(questionId);
      }
    }
    
    setExpandedQuestions(newExpanded);
  };

  // Execute a specific question
  const executeQuestion = async (questionId) => {
    if (!githubService || !repository) {
      return;
    }

    setLoadingQuestions(prev => new Set(prev).add(questionId));

    try {
      // Prepare request parameters
      const request = {
        questionId,
        parameters: {
          repository,
          branch,
          locale: i18n.language.replace('-', '_') || 'en_US'
        }
      };

      // Execute question
      const context = { githubService };
      const result = await faqExecutionEngine.executeQuestion(request, context);
      
      setQuestionResults(prev => new Map(prev).set(questionId, result));
    } catch (err) {
      console.error(`Failed to execute question ${questionId}:`, err);
      setQuestionResults(prev => new Map(prev).set(questionId, {
        structured: {},
        narrative: `<p class="error">Error: ${err.message}</p>`,
        errors: [err.message],
        warnings: [],
        meta: {}
      }));
    } finally {
      setLoadingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  // Retry execution for a question
  const retryQuestion = async (questionId) => {
    setQuestionResults(prev => {
      const newMap = new Map(prev);
      newMap.delete(questionId);
      return newMap;
    });
    await executeQuestion(questionId);
  };

  // Sanitize HTML content
  const sanitizeHTML = (html) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'time', 'small'],
      ALLOWED_ATTR: ['class', 'datetime']
    });
  };

  // Render question result
  const renderQuestionResult = (questionId) => {
    const result = questionResults.get(questionId);
    const isLoading = loadingQuestions.has(questionId);

    if (isLoading) {
      return (
        <div className="faq-answer loading">
          <div className="faq-loading-spinner"></div>
          <p>{t('dak.faq.loading')}</p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="faq-answer empty">
          <p>{t('dak.faq.no_data')}</p>
        </div>
      );
    }

    if (result.errors && result.errors.length > 0) {
      return (
        <div className="faq-answer error">
          <div 
            className="faq-narrative"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(result.narrative || '') }}
          />
          <div className="faq-messages">
            {result.errors.map((error, index) => (
              <div key={`error-${index}`} className="faq-message faq-error">
                <span className="faq-message-icon">⚠️</span>
                {error}
              </div>
            ))}
          </div>
          <button 
            onClick={() => retryQuestion(questionId)} 
            className="faq-retry-button"
          >
            {t('dak.faq.retry')}
          </button>
        </div>
      );
    }

    return (
      <div className="faq-answer success">
        <div 
          className="faq-narrative"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(result.narrative || '') }}
        />
        {result.warnings && result.warnings.length > 0 && (
          <div className="faq-messages">
            {result.warnings.map((warning, index) => (
              <div key={`warning-${index}`} className="faq-message faq-warning">
                <span className="faq-message-icon">⚠️</span>
                {warning}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`faq-accordion loading ${className}`}>
        <div className="faq-loading">
          <div className="loading-spinner"></div>
          <p>{t('dak.faq.loading_questions')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`faq-accordion error ${className}`}>
        <div className="faq-error">
          <h4>{t('dak.faq.error_title')}</h4>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`faq-accordion empty ${className}`}>
        <div className="faq-empty">
          <h4>{t('dak.faq.no_questions_title')}</h4>
          <p>{t('dak.faq.no_questions_message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`faq-accordion ${className}`}>
      <div className="faq-accordion-header">
        <h4>{t('dak.faq.available_questions', { count: questions.length })}</h4>
        <p>{t('dak.faq.accordion_description')}</p>
      </div>
      
      <div className="faq-accordion-list">
        {questions.map((question) => {
          const isExpanded = expandedQuestions.has(question.id);
          const isLoading = loadingQuestions.has(question.id);
          
          return (
            <div 
              key={question.id} 
              className={`faq-accordion-item ${isExpanded ? 'expanded' : ''} ${isLoading ? 'loading' : ''}`}
            >
              <button
                className="faq-accordion-toggle"
                onClick={() => toggleQuestion(question.id)}
                aria-expanded={isExpanded}
                aria-controls={`faq-content-${question.id}`}
              >
                <div className="faq-question-info">
                  <h5 className="faq-question-title">{question.title}</h5>
                  <p className="faq-question-description">{question.description}</p>
                  <div className="faq-question-meta">
                    <span className="faq-level">{question.level}</span>
                    {question.tags && question.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="faq-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="faq-accordion-icon">
                  {isLoading ? (
                    <div className="faq-loading-icon"></div>
                  ) : (
                    <span className={`faq-chevron ${isExpanded ? 'rotated' : ''}`}>
                      ▼
                    </span>
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div 
                  id={`faq-content-${question.id}`}
                  className="faq-accordion-content"
                >
                  {renderQuestionResult(question.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQAccordion;