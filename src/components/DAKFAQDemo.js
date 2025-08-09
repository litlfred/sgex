/**
 * DAK FAQ Demo Page
 * Demonstrates the FAQ functionality with sample questions
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import FAQAnswer from '../dak/faq/components/FAQAnswer.js';
import faqExecutionEngine from '../dak/faq/engine/FAQExecutionEngine.js';
import githubService from '../services/githubService.js';
import './DAKFAQDemo.css';

const DAKFAQDemo = () => {
  const { t } = useTranslation();
  const { user, repo, branch } = useParams();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample questions to demonstrate
  const sampleQuestions = [
    {
      id: 'dak-name',
      title: 'What is the name of this DAK?',
      description: 'Extracts the DAK name from sushi-config.yaml'
    },
    {
      id: 'dak-version',
      title: 'What is the version of this DAK?',
      description: 'Extracts the DAK version from sushi-config.yaml'
    }
  ];

  useEffect(() => {
    initializeFAQEngine();
  }, []);

  const initializeFAQEngine = async () => {
    try {
      setLoading(true);
      await faqExecutionEngine.initialize();
      const catalog = faqExecutionEngine.getCatalog();
      setQuestions(catalog);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRepositoryContext = () => {
    if (user && repo) {
      return {
        repository: `${user}/${repo}`,
        branch: branch || 'main'
      };
    }
    
    // Fallback to location state
    const state = location.state;
    if (state?.user && state?.repo) {
      return {
        repository: `${state.user}/${state.repo}`,
        branch: state.branch || 'main'
      };
    }
    
    return null;
  };

  const repositoryContext = getRepositoryContext();

  if (loading) {
    return (
      <div className="dak-faq-demo loading">
        <div className="loading-spinner"></div>
        <p>{t('dak.faq.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dak-faq-demo error">
        <h2>FAQ System Error</h2>
        <p>{error}</p>
        <button onClick={initializeFAQEngine}>Retry</button>
      </div>
    );
  }

  if (!repositoryContext) {
    return (
      <div className="dak-faq-demo no-context">
        <h2>DAK FAQ Demo</h2>
        <p>No repository context available. Please navigate from a DAK repository page.</p>
        <div className="demo-info">
          <h3>Available Questions</h3>
          <ul>
            {questions.map(question => (
              <li key={question.id}>
                <strong>{question.title}</strong> - {question.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="dak-faq-demo">
      <header className="dak-faq-demo-header">
        <h1>DAK FAQ Demo</h1>
        <div className="repository-info">
          <span className="repo-name">{repositoryContext.repository}</span>
          <span className="branch-name">({repositoryContext.branch})</span>
        </div>
      </header>

      <div className="faq-questions">
        <h2>Available Questions</h2>
        <p>Here are some example FAQ questions that can be answered about this DAK:</p>
        
        {sampleQuestions.map(question => (
          <div key={question.id} className="faq-question-section">
            <h3>{question.title}</h3>
            <p className="question-description">{question.description}</p>
            
            <FAQAnswer
              questionId={question.id}
              parameters={repositoryContext}
              githubService={githubService}
              showRawData={true}
            />
          </div>
        ))}
      </div>

      <div className="faq-catalog">
        <h2>FAQ Question Catalog</h2>
        <p>All available questions in the system:</p>
        
        <div className="catalog-grid">
          {questions.map(question => (
            <div key={question.id} className="catalog-item">
              <h4>{question.title}</h4>
              <p>{question.description}</p>
              <div className="catalog-meta">
                <span className="level">{question.level}</span>
                <span className="version">v{question.version}</span>
              </div>
              <div className="tags">
                {question.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mcp-info">
        <h2>MCP Server Integration</h2>
        <p>
          The FAQ system can also be accessed via the local MCP server API for programmatic access.
          Start the MCP server and access:
        </p>
        <ul>
          <li><code>GET http://127.0.0.1:3001/faq/questions/catalog</code> - Get question catalog</li>
          <li><code>POST http://127.0.0.1:3001/faq/questions/execute</code> - Execute questions</li>
        </ul>
      </div>
    </div>
  );
};

export default DAKFAQDemo;