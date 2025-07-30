// Framework components
import PageHeader from './PageHeader';
export { PageHeader };

// Placeholder PageLayout component
export const PageLayout = ({ children, pageName, showHeader = true }) => {
  return (
    <div className={`page-layout ${pageName}`}>
      {showHeader && <PageHeader />}
      <main className="page-content">
        {children}
      </main>
    </div>
  );
};