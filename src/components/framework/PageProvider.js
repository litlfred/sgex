import React, { createContext, useContext } from 'react';

const PageContext = createContext({});

export const PAGE_TYPES = {
  LANDING: 'landing',
  DASHBOARD: 'dashboard',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

export const PageProvider = ({ children, value = {} }) => {
  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  return useContext(PageContext);
};

// Alias for usePage
export const usePage = usePageContext;

export default PageProvider;