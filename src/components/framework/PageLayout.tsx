/**
 * Page Layout Component
 * 
 * Main page layout component with framework integration
 * Provides consistent page structure with header, breadcrumbs, error boundaries, and help mascot
 * 
 * @module PageLayout
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { PageProvider, usePage } from './PageProvider';
import PageHeader from './PageHeader';
import PageContext from './PageContext';
import ErrorHandler from './ErrorHandler';
import ContextualHelpMascot from '../ContextualHelpMascot';

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
}

/**
 * Page layout inner component props
 * @example { children: <div>Content</div>, showHeader: true, showMascot: true, showBreadcrumbs: true }
 */
export interface PageLayoutInnerProps {
  /** Child components to render */
  children: ReactNode;
  /** Whether to show page header */
  showHeader?: boolean;
  /** Whether to show help mascot */
  showMascot?: boolean;
  /** Whether to show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Custom breadcrumb items */
  customBreadcrumbs?: Array<{ label: string; path: string }>;
}

/**
 * Page layout component props
 * @example { children: <div>Content</div>, pageName: "Business Processes", showHeader: true }
 */
export interface PageLayoutProps {
  /** Child components to render */
  children: ReactNode;
  /** Name of the page */
  pageName: string;
  /** Whether to show page header */
  showHeader?: boolean;
  /** Whether to show help mascot */
  showMascot?: boolean;
  /** Whether to show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Custom breadcrumb items */
  customBreadcrumbs?: Array<{ label: string; path: string }>;
}

/**
 * Error boundary wrapper for catching React errors
 * Provides fallback UI when component errors occur
 */
class PageErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('PageLayout caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="page-layout-error">
          <ErrorHandler 
            error={this.state.error || 'An unexpected error occurred'}
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
 * Handles loading states, errors, and renders page structure
 * 
 * @param props - Component properties
 * @returns Page layout inner component
 */
const PageLayoutInner: React.FC<PageLayoutInnerProps> = ({ 
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
            helpContent={[]}
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
      <PageContext customBreadcrumbs={showBreadcrumbs ? customBreadcrumbs : []} />
      <main className="page-main">
        {children}
        {showMascot && (
          <ContextualHelpMascot 
            pageId={pageName}
            helpContent={[]}
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
 * Provides consistent page structure with error boundaries, context providers, and layout
 * 
 * Features:
 * - Error boundary for React errors
 * - Page context provider
 * - Consistent header
 * - Breadcrumb navigation
 * - Loading and error states
 * - Contextual help mascot
 * 
 * @param props - Component properties
 * @returns Page layout component
 * 
 * @example
 * <PageLayout pageName="Business Processes" showHeader={true} showMascot={true}>
 *   <div>Page content goes here</div>
 * </PageLayout>
 */
const PageLayout: React.FC<PageLayoutProps> = ({ 
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
