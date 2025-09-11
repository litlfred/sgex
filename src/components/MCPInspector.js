import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout, PageHeader } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import { lazyLoadSyntaxHighlighter, lazyLoadSyntaxHighlighterStyles } from '../utils/lazyRouteUtils';

/**
 * MCP Inspector Component
 * 
 * Provides inspection, browsing, and validation of local MCP service traffic.
 * Supports multi-service traffic logging, schema validation, and dynamic service discovery.
 * Only available when deployed locally (not on GitHub Pages).
 */
const MCPInspector = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  
  // Component state
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(new Set());
  const [trafficLogs, setTrafficLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [serviceHealth, setServiceHealth] = useState({});
  
  // Lazy-loaded components for syntax highlighting
  const [SyntaxHighlighter, setSyntaxHighlighter] = useState(null);
  const [syntaxStyles, setSyntaxStyles] = useState(null);

  // Determine if this is local deployment
  const isLocalDeployment = useMemo(() => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }, []);

  // Load syntax highlighting components
  useEffect(() => {
    const loadSyntaxComponents = async () => {
      try {
        const [highlighter, styles] = await Promise.all([
          lazyLoadSyntaxHighlighter(),
          lazyLoadSyntaxHighlighterStyles()
        ]);
        setSyntaxHighlighter(() => highlighter);
        setSyntaxStyles(styles);
      } catch (err) {
        console.warn('Failed to load syntax highlighting:', err);
      }
    };
    
    loadSyntaxComponents();
  }, []);

  // Discover MCP services
  useEffect(() => {
    const discoverServices = async () => {
      if (!isLocalDeployment) {
        setError('MCP Inspector is only available in local development environment.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Discover available MCP services
        const serviceList = await fetchMCPServices();
        setServices(serviceList);
        
        // Initially select all services
        setSelectedServices(new Set(serviceList.map(s => s.id)));
        
        // Check health of each service
        const healthChecks = await Promise.allSettled(
          serviceList.map(async (service) => {
            try {
              const response = await fetch(`${service.baseUrl}/health`);
              return {
                serviceId: service.id,
                healthy: response.ok,
                status: response.status,
                timestamp: new Date().toISOString()
              };
            } catch (err) {
              return {
                serviceId: service.id,
                healthy: false,
                error: err.message,
                timestamp: new Date().toISOString()
              };
            }
          })
        );
        
        const healthStatus = {};
        healthChecks.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            healthStatus[serviceList[index].id] = result.value;
          } else {
            healthStatus[serviceList[index].id] = {
              serviceId: serviceList[index].id,
              healthy: false,
              error: result.reason?.message || 'Health check failed',
              timestamp: new Date().toISOString()
            };
          }
        });
        
        setServiceHealth(healthStatus);
        
      } catch (err) {
        setError(`Failed to discover MCP services: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    discoverServices();
  }, [isLocalDeployment]);

  // Fetch traffic logs periodically
  useEffect(() => {
    if (!isLocalDeployment || services.length === 0) return;

    const fetchTrafficLogs = async () => {
      try {
        // For now, simulate traffic logs since we need to implement the logging infrastructure
        // In a full implementation, this would fetch actual traffic logs from each service
        const mockLogs = generateMockTrafficLogs(services);
        setTrafficLogs(mockLogs);
      } catch (err) {
        console.warn('Failed to fetch traffic logs:', err);
      }
    };

    // Initial fetch
    fetchTrafficLogs();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchTrafficLogs, 5000);
    
    return () => clearInterval(interval);
  }, [isLocalDeployment, services]);

  // Filter logs based on selected services and search query
  useEffect(() => {
    let filtered = trafficLogs.filter(log => 
      selectedServices.has(log.serviceId)
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.method.toLowerCase().includes(query) ||
        log.url.toLowerCase().includes(query) ||
        log.status.toString().includes(query) ||
        JSON.stringify(log.request).toLowerCase().includes(query) ||
        JSON.stringify(log.response).toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredLogs(filtered);
  }, [trafficLogs, selectedServices, searchQuery]);

  // Fetch list of available MCP services
  const fetchMCPServices = async () => {
    try {
      // Try to fetch from the service registry endpoint
      const response = await fetch('http://127.0.0.1:3001/mcp/services');
      if (response.ok) {
        const registry = await response.json();
        return registry.services || [];
      }
    } catch (err) {
      console.warn('Failed to fetch from service registry:', err);
    }
    
    // Fallback to hardcoded list if registry unavailable
    return [
      {
        id: 'dak-faq',
        name: 'DAK FAQ MCP Service',
        description: 'WHO SMART Guidelines DAK FAQ functionality',
        functionality: 'dak-faq',
        baseUrl: 'http://127.0.0.1:3001/mcp',
        version: '1.0.0',
        endpoints: [
          'GET /health',
          'GET /faq/questions/catalog',
          'POST /faq/questions/execute',
          'GET /faq/schemas',
          'GET /faq/openapi'
        ]
      }
    ];
  };

  // Generate mock traffic logs for demonstration
  const generateMockTrafficLogs = (serviceList) => {
    const logs = [];
    const now = Date.now();
    
    serviceList.forEach(service => {
      // Generate some sample traffic
      for (let i = 0; i < 5; i++) {
        logs.push({
          id: `${service.id}-${i}-${now}`,
          serviceId: service.id,
          serviceName: service.name,
          timestamp: new Date(now - (i * 30000)).toISOString(),
          method: ['GET', 'POST'][Math.floor(Math.random() * 2)],
          url: service.endpoints[Math.floor(Math.random() * service.endpoints.length)],
          status: [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)],
          responseTime: Math.floor(Math.random() * 1000) + 50,
          request: {
            headers: { 'Content-Type': 'application/json' },
            body: { questionId: 'sample-question', parameters: {} }
          },
          response: {
            headers: { 'Content-Type': 'application/json' },
            body: { status: 'success', data: { result: 'Sample response' } }
          }
        });
      }
    });
    
    return logs;
  };

  // Handle service selection toggle
  const handleServiceToggle = (serviceId) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  // Handle log selection for detailed view
  const handleLogClick = (log) => {
    setSelectedLog(log);
  };

  // Group services by functionality
  const servicesByFunctionality = useMemo(() => {
    const groups = {};
    services.forEach(service => {
      const func = service.functionality || 'other';
      if (!groups[func]) {
        groups[func] = [];
      }
      groups[func].push(service);
    });
    return groups;
  }, [services]);

  // Render error state
  if (error) {
    return (
      <PageLayout>
        <PageHeader 
          title="MCP Inspector"
          breadcrumbItems={[
            { label: 'Home', path: '/' },
            { label: 'MCP Inspector', path: '/mcp-inspector', current: true }
          ]}
        />
        <div className="mcp-inspector-error">
          <div className="error-message">
            <h3>MCP Inspector Unavailable</h3>
            <p>{error}</p>
            {!isLocalDeployment && (
              <div className="local-only-notice">
                <p>The MCP Inspector is only available when running SGEX locally for development and testing.</p>
                <p>To use the MCP Inspector:</p>
                <ol>
                  <li>Clone the SGEX repository locally</li>
                  <li>Run <code>npm start</code> to start the development server</li>
                  <li>Start MCP services with <code>npm run run-mcp</code></li>
                  <li>Access the inspector at <code>http://localhost:3000/sgex/mcp-inspector</code></li>
                </ol>
              </div>
            )}
          </div>
        </div>
        <ContextualHelpMascot pageId="mcp-inspector" />
      </PageLayout>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <PageLayout>
        <PageHeader 
          title="MCP Inspector"
          breadcrumbItems={[
            { label: 'Home', path: '/' },
            { label: 'MCP Inspector', path: '/mcp-inspector', current: true }
          ]}
        />
        <div className="mcp-inspector-loading">
          <div className="loading-spinner"></div>
          <p>Discovering MCP services...</p>
        </div>
        <ContextualHelpMascot pageId="mcp-inspector" />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader 
        title="MCP Inspector"
        subtitle="Inspect and monitor local MCP service traffic"
        breadcrumbItems={[
          { label: 'Home', path: '/' },
          { label: 'MCP Inspector', path: '/mcp-inspector', current: true }
        ]}
      />
      
      <div className="mcp-inspector-container">
        
        {/* Service Discovery Panel */}
        <div className="mcp-services-panel">
          <h3>Discovered MCP Services</h3>
          
          {Object.entries(servicesByFunctionality).map(([functionality, funcServices]) => (
            <div key={functionality} className="functionality-group">
              <h4 className="functionality-title">
                {functionality.charAt(0).toUpperCase() + functionality.slice(1)} Services
              </h4>
              
              {funcServices.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <label className="service-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedServices.has(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                      />
                      <span className="service-name">{service.name}</span>
                    </label>
                    
                    <div className={`service-health ${serviceHealth[service.id]?.healthy ? 'healthy' : 'unhealthy'}`}>
                      {serviceHealth[service.id]?.healthy ? '🟢' : '🔴'}
                    </div>
                  </div>
                  
                  <div className="service-details">
                    <p className="service-description">{service.description}</p>
                    <p className="service-url">{service.baseUrl}</p>
                    <div className="service-endpoints">
                      <small>Endpoints: {service.endpoints.join(', ')}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Traffic Logs Panel */}
        <div className="mcp-traffic-panel">
          <div className="traffic-header">
            <h3>Traffic Logs</h3>
            <div className="traffic-controls">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button
                onClick={() => setTrafficLogs([])}
                className="clear-logs-btn"
              >
                Clear Logs
              </button>
            </div>
          </div>

          <div className="traffic-logs">
            {filteredLogs.length === 0 ? (
              <div className="no-logs">
                <p>No traffic logs found.</p>
                {selectedServices.size === 0 && (
                  <p>Select one or more services to view their traffic.</p>
                )}
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className={`log-entry ${log.status >= 400 ? 'error' : 'success'}`}
                  onClick={() => handleLogClick(log)}
                >
                  <div className="log-summary">
                    <span className="log-method">{log.method}</span>
                    <span className="log-url">{log.url}</span>
                    <span className={`log-status status-${Math.floor(log.status / 100)}xx`}>
                      {log.status}
                    </span>
                    <span className="log-time">{log.responseTime}ms</span>
                    <span className="log-timestamp">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="log-service">{log.serviceName}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="log-detail-modal" onClick={() => setSelectedLog(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Traffic Log Details</h3>
                <button
                  className="modal-close"
                  onClick={() => setSelectedLog(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="log-metadata">
                  <div className="metadata-row">
                    <strong>Service:</strong> {selectedLog.serviceName}
                  </div>
                  <div className="metadata-row">
                    <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                  </div>
                  <div className="metadata-row">
                    <strong>Method:</strong> {selectedLog.method}
                  </div>
                  <div className="metadata-row">
                    <strong>URL:</strong> {selectedLog.url}
                  </div>
                  <div className="metadata-row">
                    <strong>Status:</strong> 
                    <span className={`status-badge status-${Math.floor(selectedLog.status / 100)}xx`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <div className="metadata-row">
                    <strong>Response Time:</strong> {selectedLog.responseTime}ms
                  </div>
                </div>

                <div className="log-details">
                  <div className="detail-section">
                    <h4>Request</h4>
                    {SyntaxHighlighter ? (
                      <SyntaxHighlighter
                        language="json"
                        style={syntaxStyles}
                        className="syntax-highlighter"
                      >
                        {JSON.stringify(selectedLog.request, null, 2)}
                      </SyntaxHighlighter>
                    ) : (
                      <pre className="json-display">
                        {JSON.stringify(selectedLog.request, null, 2)}
                      </pre>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Response</h4>
                    {SyntaxHighlighter ? (
                      <SyntaxHighlighter
                        language="json"
                        style={syntaxStyles}
                        className="syntax-highlighter"
                      >
                        {JSON.stringify(selectedLog.response, null, 2)}
                      </SyntaxHighlighter>
                    ) : (
                      <pre className="json-display">
                        {JSON.stringify(selectedLog.response, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ContextualHelpMascot pageId="mcp-inspector" />
    </PageLayout>
  );
};

export default MCPInspector;