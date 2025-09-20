/**
 * DAK FAQ Demo Page
 * Demonstrates the FAQ functionality with sample questions
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import FAQAnswer from '../dak/faq/components/FAQAnswer.js';
import faqExecutionEngine from '../dak/faq/engine/FAQExecutionEngine.js';
import githubService from '../services/githubService.js';
import { PageLayout, usePage } from './framework';
import './DAKFAQDemo.css';

const DAKFAQDemo = () => {
  return (
    <PageLayout pageName="dak-faq-demo">
      <DAKFAQDemoContent />
    </PageLayout>
  );
};

const DAKFAQDemoContent = () => {
  const { t } = useTranslation();
  const { user, repository, branch } = usePage();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mcpEndpoints, setMcpEndpoints] = useState([]);
  const [mcpServiceStatus, setMcpServiceStatus] = useState('unknown');

  // Get user and repo from page framework
  const repo = repository?.name;

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
    },
    {
      id: 'decision-table-inputs',
      title: 'What are the inputs required for this decision table?',
      description: 'Analyzes DMN files and extracts input requirements for decision tables'
    }
  ];

  useEffect(() => {
    initializeFAQEngine();
    fetchMCPEndpoints();
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

  const fetchMCPEndpoints = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/');
      if (response.ok) {
        const data = await response.json();
        if (data.endpoints) {
          // Convert endpoints object to array with additional metadata
          const endpointsArray = Object.entries(data.endpoints).map(([endpoint, description]) => ({
            endpoint,
            description,
            method: endpoint.split(' ')[0],
            path: endpoint.split(' ')[1],
            fullUrl: `http://127.0.0.1:3001${endpoint.split(' ')[1]}`
          }));
          setMcpEndpoints(endpointsArray);
          setMcpServiceStatus('running');
        }
      } else {
        setMcpServiceStatus('not-running');
      }
    } catch (error) {
      console.log('MCP service not available:', error.message);
      setMcpServiceStatus('not-running');
      // Set fallback endpoints with corrected URLs
      setMcpEndpoints([
        {
          endpoint: 'GET /mcp/faq/questions/catalog',
          description: 'Get question catalog',
          method: 'GET',
          path: '/mcp/faq/questions/catalog',
          fullUrl: 'http://127.0.0.1:3001/mcp/faq/questions/catalog'
        },
        {
          endpoint: 'POST /mcp/faq/questions/execute',
          description: 'Execute questions',
          method: 'POST',
          path: '/mcp/faq/questions/execute',
          fullUrl: 'http://127.0.0.1:3001/mcp/faq/questions/execute'
        }
      ]);
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
            
            {question.id === 'decision-table-inputs' ? (
              // Special handling for asset-level DMN question
              <div className="dmn-demo">
                <p><em>This is an asset-level question that analyzes individual DMN files. 
                In a real DAK repository, this would scan DMN files in directories like input/cql/ or input/dmn/.</em></p>
                <FAQAnswer
                  questionId={question.id}
                  parameters={{
                    ...repositoryContext,
                    assetFile: 'input/cql/IMMZ.D2.DT.BCG.dmn' // Example DMN file path
                  }}
                  githubService={githubService}
                  showRawData={true}
                />
              </div>
            ) : (
              // Regular DAK/component-level questions
              <FAQAnswer
                questionId={question.id}
                parameters={repositoryContext}
                githubService={githubService}
                showRawData={true}
              />
            )}
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
        <div className="mcp-status">
          <p>
            <strong>Service Status:</strong> 
            <span className={`status-badge ${mcpServiceStatus}`}>
              {mcpServiceStatus === 'running' ? '🟢 Running' : 
               mcpServiceStatus === 'not-running' ? '🔴 Not Running' : '⚪ Unknown'}
            </span>
          </p>
        </div>
        
        <p>
          The FAQ system can be accessed via the local MCP server API for programmatic access.
          {mcpServiceStatus === 'not-running' && (
            <span> <strong>Start the MCP server</strong> to access all endpoints.</span>
          )}
        </p>
        
        <div className="endpoints-section">
          <h3>Available Endpoints ({mcpEndpoints.length})</h3>
          {mcpEndpoints.length > 0 ? (
            <div className="endpoints-list">
              {mcpEndpoints.map((endpoint, index) => (
                <div key={index} className="endpoint-item">
                  <div className="endpoint-header">
                    <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
                      {endpoint.method}
                    </span>
                    <code className="endpoint-url">{endpoint.fullUrl}</code>
                  </div>
                  <p className="endpoint-description">{endpoint.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No endpoints available. Start the MCP server to see all available endpoints.</p>
          )}
        </div>
        
        <div className="mcp-usage-info">
          <h4>Usage Instructions</h4>
          <ol>
            <li>Start the MCP server: <code>cd services/dak-faq-mcp && npm start</code></li>
            <li>Use any HTTP client to access the endpoints above</li>
            <li>Refresh this page to see updated endpoint status</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DAKFAQDemo;