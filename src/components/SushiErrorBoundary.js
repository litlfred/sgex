import React from 'react';
import './SushiErrorBoundary.css';

class SushiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      memoryInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capture memory information if available
    const memoryInfo = performance.memory ? {
      used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1),
      total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1),
      limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)
    } : null;

    this.setState({
      error: error,
      errorInfo: errorInfo,
      memoryInfo: memoryInfo
    });

    // Log the error for debugging
    console.error('SUSHI Error Boundary caught an error:', error, errorInfo);
    
    // Attempt memory cleanup
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc();
      } catch (e) {
        console.warn('Manual garbage collection failed:', e);
      }
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      memoryInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="sushi-error-boundary">
          <div className="error-content">
            <h3>🍣 SUSHI Processing Error</h3>
            <p>
              Something went wrong during FHIR Shorthand compilation. This may be due to:
            </p>
            <ul>
              <li>Large FSH files causing memory issues</li>
              <li>Complex FSH syntax that exceeded processing limits</li>
              <li>Browser memory constraints</li>
              <li>Incompatible FSH definitions</li>
            </ul>

            {this.state.memoryInfo && (
              <div className="memory-info">
                <h4>💾 Memory Usage</h4>
                <p>
                  Used: {this.state.memoryInfo.used} MB / 
                  Total: {this.state.memoryInfo.total} MB / 
                  Limit: {this.state.memoryInfo.limit} MB
                </p>
              </div>
            )}

            <div className="error-suggestions">
              <h4>💡 Suggestions to Resolve</h4>
              <ul>
                <li>Try processing fewer FSH files at once</li>
                <li>Split large FSH files into smaller ones</li>
                <li>Refresh the page to clear memory</li>
                <li>Use a browser with more available memory</li>
                <li>Close other browser tabs to free up memory</li>
              </ul>
            </div>

            <div className="error-actions">
              <button 
                onClick={this.handleReset}
                className="reset-btn"
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="reload-btn"
              >
                🚀 Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>🔍 Technical Details (Development)</summary>
                <div className="error-stack">
                  <h5>Error:</h5>
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  
                  <h5>Component Stack:</h5>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                  
                  <h5>Error Stack:</h5>
                  <pre>{this.state.error && this.state.error.stack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SushiErrorBoundary;