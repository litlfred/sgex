import React from 'react';
import { PageProvider, usePage } from './PageProvider';
import PageHeader from './PageHeader';
import PageContext from './PageContext';
import PageBreadcrumbs from './PageBreadcrumbs';
import ErrorHandler from './ErrorHandler';
import ContextualHelpMascot from '../ContextualHelpMascot';
import './PageLayout.css';

/**
 * Error boundary wrapper for catching React errors
 */
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PageLayout caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-layout-error">
          <ErrorHandler 
            error={this.state.error}
            onRetry={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Inner layout component that uses page context
 */
const PageLayoutInner = ({ 
  children, 
  showHeader = true, 
  showMascot = true, 
  showBreadcrumbs = true, 
  customBreadcrumbs 
}) => {
  const { loading, error, pageName } = usePage();

  // Show loading state
  if (loading) {
    return (
      <div className="page-layout">
        {showHeader && <PageHeader />}
        <main className="page-main">
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </main>
        {showMascot && (
          <ContextualHelpMascot 
            pageId={`${pageName}-loading`}
            position="bottom-right"
          />
        )}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="page-layout">
        {showHeader && <PageHeader />}
        <main className="page-main">
          <ErrorHandler 
            error={error}
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    );
  }

  // Show normal page content
  return (
    <div className="page-layout">
      {showHeader && <PageHeader />}
      <PageContext />
      {showBreadcrumbs && <PageBreadcrumbs customBreadcrumbs={customBreadcrumbs} />}
      <main className="page-main">
        {children}
        {showMascot && (
          <ContextualHelpMascot 
            pageId={pageName}
            position="bottom-right"
            contextData={{}}
          />
        )}
      </main>
    </div>
  );
};

/**
 * Main page layout component with framework integration
 */
const PageLayout = ({ 
  children, 
  pageName, 
  showHeader = true, 
  showMascot = true,
  showBreadcrumbs = true,
  customBreadcrumbs
}) => {
  return (
    <PageErrorBoundary>
      <PageProvider pageName={pageName}>
        <PageLayoutInner 
          showHeader={showHeader} 
          showMascot={showMascot}
          showBreadcrumbs={showBreadcrumbs}
          customBreadcrumbs={customBreadcrumbs}
        >
          {children}
        </PageLayoutInner>
      </PageProvider>
    </PageErrorBoundary>
  );
};

export default PageLayout;