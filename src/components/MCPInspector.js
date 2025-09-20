import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout, PageHeader } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import { lazyLoadSyntaxHighlighter, lazyLoadSyntaxHighlighterStyles } from '../utils/lazyRouteUtils';
import './shared-styles.css';
import './MCPInspector.css';

/**
 * MCP Inspector Component
 * 
 * Provides inspection, browsing, and validation of local MCP service traffic.
 * Supports multi-service traffic logging, schema validation, and dynamic service discovery.
 * Enhanced with view toggle, request tracking, and advanced filtering capabilities.
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
  
  // New state for enhanced functionality
  const [viewMode, setViewMode] = useState('logs'); // 'logs' or 'requests'
  const [logEntries, setLogEntries] = useState([]);
  const [filteredLogEntries, setFilteredLogEntries] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [logFilter, setLogFilter] = useState({
    levels: ['error', 'warn', 'info', 'debug'],
    categories: [],
    searchText: ''
  });
  const [requestFilter, setRequestFilter] = useState({
    methods: [],
    statusCodes: [],
    services: [],
    timeRange: 'all'
  });
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  
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

  // Fetch traffic logs and requests periodically
  useEffect(() => {
    if (!isLocalDeployment || services.length === 0) return;

    const fetchData = async () => {
      try {
        // Fetch log entries from the logger API
        await fetchLogEntries();
        
        // Fetch HTTP requests from the request tracking API
        await fetchRequests();
        
        // For backward compatibility, also generate mock traffic logs
        const mockLogs = generateMockTrafficLogs(services);
        setTrafficLogs(mockLogs);
      } catch (err) {
        console.warn('Failed to fetch data:', err);
      }
    };

    // Initial fetch
    fetchData();
    
    // Refresh every 2 seconds for real-time updates
    const interval = setInterval(fetchData, 2000);
    
    return () => clearInterval(interval);
  }, [isLocalDeployment, services]);

  // Fetch log entries from MCP services
  const fetchLogEntries = async () => {
    try {
      for (const service of services) {
        const response = await fetch(`${service.baseUrl}/logs?limit=100`);
        if (response.ok) {
          const data = await response.json();
          setLogEntries(prev => {
            const newEntries = data.logs || [];
            const combined = [...prev, ...newEntries];
            // Remove duplicates and limit to buffer size
            const unique = combined.filter((entry, index, arr) => 
              index === arr.findIndex(e => e.id === entry.id)
            );
            return unique.slice(-2000); // Keep last 2000 entries
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch log entries:', err);
    }
  };

  // Fetch HTTP requests from MCP services
  const fetchRequests = async () => {
    try {
      for (const service of services) {
        const response = await fetch(`${service.baseUrl}/requests?limit=100`);
        if (response.ok) {
          const data = await response.json();
          setRequests(prev => {
            const newRequests = data.requests || [];
            const combined = [...prev, ...newRequests];
            // Remove duplicates and limit to buffer size
            const unique = combined.filter((request, index, arr) => 
              index === arr.findIndex(r => r.uuid === request.uuid)
            );
            return unique.slice(-2000); // Keep last 2000 requests
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch requests:', err);
    }
  };

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

  // Filter log entries based on log filter
  useEffect(() => {
    let filtered = logEntries;

    // Filter by levels
    if (logFilter.levels.length > 0) {
      filtered = filtered.filter(entry => logFilter.levels.includes(entry.level));
    }

    // Filter by categories
    if (logFilter.categories.length > 0) {
      filtered = filtered.filter(entry => logFilter.categories.includes(entry.category));
    }

    // Filter by search text
    if (logFilter.searchText.trim()) {
      const query = logFilter.searchText.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.message.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredLogEntries(filtered);
  }, [logEntries, logFilter]);

  // Filter requests based on request filter
  useEffect(() => {
    let filtered = requests;

    // Filter by methods
    if (requestFilter.methods.length > 0) {
      filtered = filtered.filter(req => requestFilter.methods.includes(req.method));
    }

    // Filter by status codes
    if (requestFilter.statusCodes.length > 0) {
      filtered = filtered.filter(req => requestFilter.statusCodes.includes(Math.floor(req.status / 100)));
    }

    // Filter by services
    if (requestFilter.services.length > 0) {
      filtered = filtered.filter(req => requestFilter.services.includes(req.serviceId));
    }

    // Filter by time range
    if (requestFilter.timeRange !== 'all') {
      const now = new Date();
      const timeLimit = new Date(now.getTime() - getTimeRangeMs(requestFilter.timeRange));
      filtered = filtered.filter(req => new Date(req.timestamp) >= timeLimit);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = getSortValue(a, sortBy);
      const bVal = getSortValue(b, sortBy);
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    setFilteredRequests(filtered);
  }, [requests, requestFilter, sortBy, sortOrder]);

  // Helper functions for filtering and sorting
  const getTimeRangeMs = (range) => {
    switch (range) {
      case '1h': return 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  };

  const getSortValue = (item, sortField) => {
    switch (sortField) {
      case 'timestamp': return new Date(item.timestamp);
      case 'status': return item.status;
      case 'responseTime': return item.responseTime || 0;
      case 'method': return item.method;
      case 'url': return item.url;
      default: return new Date(item.timestamp);
    }
  };

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

  // Handle request selection for detailed view
  const handleRequestClick = async (request) => {
    try {
      // Fetch full request details from the API
      const response = await fetch(`http://127.0.0.1:3001/mcp/requests/${request.uuid}`);
      if (response.ok) {
        const fullRequest = await response.json();
        setSelectedRequest(fullRequest);
      } else {
        setSelectedRequest(request);
      }
    } catch (err) {
      console.warn('Failed to fetch request details:', err);
      setSelectedRequest(request);
    }
  };

  // Copy to clipboard functionality
  const copyToClipboard = async (text, type = 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Export request data as structured JSON
  const exportRequestData = (request) => {
    const exportData = {
      uuid: request.uuid,
      timestamp: request.timestamp,
      request: {
        method: request.method,
        url: request.url,
        headers: request.request?.headers || {},
        body: request.request?.body
      },
      response: {
        status: request.status,
        headers: request.response?.headers || {},
        body: request.response?.body
      },
      metadata: {
        serviceId: request.serviceId,
        serviceName: request.serviceName,
        responseTime: request.responseTime,
        ipAddress: request.metadata?.ipAddress,
        userAgent: request.metadata?.userAgent,
        referrer: request.metadata?.referrer
      },
      performance: {
        requestSize: request.metadata?.requestSize || 0,
        responseSize: request.metadata?.responseSize || 0,
        timing: request.timing || {}
      }
    };
    
    copyToClipboard(JSON.stringify(exportData, null, 2));
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
        <div className="sgex-error-container mcp-inspector-error">
          <div className="sgex-error-message">
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
        <div className="sgex-loading-container mcp-inspector-loading">
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
      
      <div className="sgex-fullheight-container mcp-inspector-container">
        
        {/* Enhanced Header with View Toggle */}
        <div className="mcp-inspector-header">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'logs' ? 'active' : ''}`}
              onClick={() => setViewMode('logs')}
            >
              📋 Log View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'requests' ? 'active' : ''}`}
              onClick={() => setViewMode('requests')}
            >
              🔍 Request View
            </button>
          </div>
          
          <div className="inspector-controls">
            <input
              type="text"
              placeholder={viewMode === 'logs' ? 'Search logs...' : 'Search requests...'}
              value={viewMode === 'logs' ? logFilter.searchText : searchQuery}
              onChange={(e) => {
                if (viewMode === 'logs') {
                  setLogFilter(prev => ({ ...prev, searchText: e.target.value }));
                } else {
                  setSearchQuery(e.target.value);
                }
              }}
              className="search-input"
            />
            <button
              onClick={() => {
                if (viewMode === 'logs') {
                  setLogEntries([]);
                } else {
                  setRequests([]);
                }
              }}
              className="clear-logs-btn"
            >
              Clear {viewMode === 'logs' ? 'Logs' : 'Requests'}
            </button>
          </div>
        </div>
        
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

        {/* Conditional Content Panel */}
        {viewMode === 'logs' ? (
          /* Enhanced Log View Panel */
          <div className="mcp-logs-panel">
            <div className="logs-header">
              <h3>Service Logs</h3>
              <div className="log-filters">
                <select
                  value=""
                  onChange={(e) => {
                    const level = e.target.value;
                    if (level) {
                      setLogFilter(prev => ({
                        ...prev,
                        levels: prev.levels.includes(level) 
                          ? prev.levels.filter(l => l !== level)
                          : [...prev.levels, level]
                      }));
                    }
                  }}
                >
                  <option value="">Filter by Level</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                  <option value="trace">Trace</option>
                </select>
              </div>
            </div>

            <div className="log-entries">
              {filteredLogEntries.length === 0 ? (
                <div className="no-logs">
                  <p>No log entries found.</p>
                  <p>Logs will appear here as services generate them.</p>
                </div>
              ) : (
                filteredLogEntries.map(entry => (
                  <div key={entry.id} className={`log-entry-enhanced ${entry.level}`}>
                    <div className="log-content">
                      <div className="log-meta">
                        <span className={`log-level ${entry.level}`}>{entry.level.toUpperCase()}</span>
                        <span className="log-category">{entry.category}</span>
                        <span className="log-timestamp-enhanced">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="log-message">{entry.message}</div>
                    </div>
                    <button
                      className="copy-log-btn"
                      onClick={() => copyToClipboard(JSON.stringify(entry, null, 2))}
                      title="Copy full log entry"
                    >
                      📋
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Enhanced Request View Panel */
          <div className="mcp-requests-panel">
            <div className="requests-header">
              <h3>HTTP Requests</h3>
              <div className="request-filters">
                <select
                  value=""
                  onChange={(e) => {
                    const method = e.target.value;
                    if (method) {
                      setRequestFilter(prev => ({
                        ...prev,
                        methods: prev.methods.includes(method)
                          ? prev.methods.filter(m => m !== method)
                          : [...prev.methods, method]
                      }));
                    }
                  }}
                >
                  <option value="">Filter by Method</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="timestamp">Sort by Time</option>
                  <option value="status">Sort by Status</option>
                  <option value="responseTime">Sort by Duration</option>
                  <option value="method">Sort by Method</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="sort-order-btn"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            <div className="request-entries">
              {filteredRequests.length === 0 ? (
                <div className="no-requests">
                  <p>No HTTP requests found.</p>
                  <p>Requests will appear here as services handle them.</p>
                </div>
              ) : (
                filteredRequests.map(request => (
                  <div key={request.uuid} className="request-card" onClick={() => handleRequestClick(request)}>
                    <div className="request-summary">
                      <div className="request-method-url">
                        <span className={`method-badge ${request.method.toLowerCase()}`}>
                          {request.method}
                        </span>
                        <span className="request-url">{request.url}</span>
                        <span className="request-uuid" title={request.uuid}>
                          {request.uuid.substring(0, 8)}...
                        </span>
                      </div>
                      
                      <div className="request-badges">
                        <span className={`status-badge status-${Math.floor(request.status / 100)}xx`}>
                          {request.status}
                        </span>
                        <span className="timing-badge">
                          {request.responseTime || 0}ms
                        </span>
                        <span className="service-badge">
                          {request.serviceName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="request-timestamp">
                      {new Date(request.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Enhanced Request Detail Modal */}
        {selectedRequest && (
          <div className="request-detail-modal" onClick={() => setSelectedRequest(null)}>
            <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Request Details</h3>
                <div className="modal-actions">
                  <button
                    className="export-btn"
                    onClick={() => exportRequestData(selectedRequest)}
                    title="Export structured JSON"
                  >
                    📤 Export
                  </button>
                  <button
                    className="modal-close"
                    onClick={() => setSelectedRequest(null)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="modal-body-enhanced">
                <div className="request-overview">
                  <div className="overview-row">
                    <strong>UUID:</strong> 
                    <span className="uuid-display">{selectedRequest.uuid}</span>
                    <button 
                      className="copy-small-btn"
                      onClick={() => copyToClipboard(selectedRequest.uuid)}
                    >
                      📋
                    </button>
                  </div>
                  <div className="overview-row">
                    <strong>Service:</strong> {selectedRequest.serviceName}
                  </div>
                  <div className="overview-row">
                    <strong>Timestamp:</strong> {new Date(selectedRequest.timestamp).toLocaleString()}
                  </div>
                  <div className="overview-row">
                    <strong>Method:</strong> 
                    <span className={`method-badge ${selectedRequest.method.toLowerCase()}`}>
                      {selectedRequest.method}
                    </span>
                  </div>
                  <div className="overview-row">
                    <strong>URL:</strong> {selectedRequest.url}
                  </div>
                  <div className="overview-row">
                    <strong>Status:</strong>
                    <span className={`status-badge status-${Math.floor(selectedRequest.status / 100)}xx`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="overview-row">
                    <strong>Response Time:</strong> {selectedRequest.responseTime || 0}ms
                  </div>
                </div>

                <div className="request-details-tabs">
                  <div className="detail-section">
                    <div className="section-header">
                      <h4>📤 Request</h4>
                      <button 
                        className="copy-section-btn"
                        onClick={() => copyToClipboard(JSON.stringify(selectedRequest.request, null, 2))}
                      >
                        📋 Copy
                      </button>
                    </div>
                    {SyntaxHighlighter ? (
                      <SyntaxHighlighter
                        language="json"
                        style={syntaxStyles}
                        className="syntax-highlighter"
                      >
                        {JSON.stringify(selectedRequest.request, null, 2)}
                      </SyntaxHighlighter>
                    ) : (
                      <pre className="json-display">
                        {JSON.stringify(selectedRequest.request, null, 2)}
                      </pre>
                    )}
                  </div>

                  <div className="detail-section">
                    <div className="section-header">
                      <h4>📥 Response</h4>
                      <button 
                        className="copy-section-btn"
                        onClick={() => copyToClipboard(JSON.stringify(selectedRequest.response, null, 2))}
                      >
                        📋 Copy
                      </button>
                    </div>
                    {SyntaxHighlighter ? (
                      <SyntaxHighlighter
                        language="json"
                        style={syntaxStyles}
                        className="syntax-highlighter"
                      >
                        {JSON.stringify(selectedRequest.response, null, 2)}
                      </SyntaxHighlighter>
                    ) : (
                      <pre className="json-display">
                        {JSON.stringify(selectedRequest.response, null, 2)}
                      </pre>
                    )}
                  </div>

                  {selectedRequest.metadata && (
                    <div className="detail-section">
                      <div className="section-header">
                        <h4>🔍 Metadata</h4>
                        <button 
                          className="copy-section-btn"
                          onClick={() => copyToClipboard(JSON.stringify(selectedRequest.metadata, null, 2))}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div className="metadata-grid">
                        <div className="metadata-item">
                          <strong>IP Address:</strong> {selectedRequest.metadata.ipAddress || 'N/A'}
                        </div>
                        <div className="metadata-item">
                          <strong>User Agent:</strong> {selectedRequest.metadata.userAgent || 'N/A'}
                        </div>
                        <div className="metadata-item">
                          <strong>Referrer:</strong> {selectedRequest.metadata.referrer || 'N/A'}
                        </div>
                        <div className="metadata-item">
                          <strong>Request Size:</strong> {selectedRequest.metadata.requestSize || 0} bytes
                        </div>
                        <div className="metadata-item">
                          <strong>Response Size:</strong> {selectedRequest.metadata.responseSize || 0} bytes
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Log Detail Modal (for backward compatibility) */}
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