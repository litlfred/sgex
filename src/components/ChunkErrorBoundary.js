import React from 'react';

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a chunk loading error
    if (error?.name === 'ChunkLoadError' || 
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to import')) {
      return { hasError: true, error };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chunk loading error caught:', error, errorInfo);
    
    // Check if this is a chunk loading error
    if (error?.name === 'ChunkLoadError' || 
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to import')) {
      
      // Store the error for user feedback
      this.setState({ 
        hasError: true, 
        error: {
          ...error,
          isChunkError: true,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  handleReload = () => {
    // Force a full page reload to get fresh chunks
    window.location.reload();
  };

  handleClearCache = () => {
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    
    // If available, clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Force reload after clearing cache
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isChunkError = error?.isChunkError || 
                          error?.name === 'ChunkLoadError' || 
                          error?.message?.includes('Loading chunk');

      return (
        <div style={{
          padding: '20px',
          margin: '20px auto',
          maxWidth: '600px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          
          <h2 style={{ color: '#721c24', marginBottom: '16px' }}>
            {isChunkError ? 'Application Update Required' : 'Something went wrong'}
          </h2>
          
          {isChunkError ? (
            <div>
              <p style={{ marginBottom: '16px', color: '#721c24' }}>
                The application has been updated since your last visit. Please refresh the page to load the latest version.
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <button 
                  onClick={this.handleReload}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    marginRight: '10px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Refresh Page
                </button>
                
                <button 
                  onClick={this.handleClearCache}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Clear Cache & Reload
                </button>
              </div>
              
              <details style={{ textAlign: 'left', marginTop: '16px' }}>
                <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                  Technical Details
                </summary>
                <pre style={{ 
                  backgroundColor: '#f1f3f4', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '8px'
                }}>
                  {error?.message || 'Chunk loading error'}
                  {error?.timestamp && `\nTime: ${error.timestamp}`}
                </pre>
              </details>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '16px', color: '#721c24' }}>
                An unexpected error occurred. Please try refreshing the page.
              </p>
              
              <button 
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Refresh Page
              </button>
              
              <details style={{ textAlign: 'left', marginTop: '16px' }}>
                <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                  Error Details
                </summary>
                <pre style={{ 
                  backgroundColor: '#f1f3f4', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '8px'
                }}>
                  {error?.message || 'Unknown error'}
                  {error?.stack && `\n\nStack trace:\n${error.stack}`}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;