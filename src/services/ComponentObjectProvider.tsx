/**
 * Component Object Provider
 * 
 * React context provider for DAK Component Objects.
 * Provides access to DAK object and all 9 component objects to child components.
 * 
 * @module ComponentObjectProvider
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import editorIntegrationService from './editorIntegrationService';

/**
 * DAK Component Object interface
 */
export interface DakComponentObject {
  retrieveAll: () => Promise<any[]>;
  retrieveById: (id: string) => Promise<any | null>;
  save: (data: any, options?: any) => Promise<any>;
  validate: (data: any) => Promise<{ isValid: boolean; errors: any[]; warnings: any[] }>;
  getSources: () => any[];
  addSource: (source: any) => void;
}

/**
 * DAK Object interface with all 9 components
 */
export interface DakObject {
  healthInterventions?: DakComponentObject;
  personas?: DakComponentObject;
  userScenarios?: DakComponentObject;
  businessProcesses?: DakComponentObject;
  dataElements?: DakComponentObject;
  decisionLogic?: DakComponentObject;
  indicators?: DakComponentObject;
  requirements?: DakComponentObject;
  testScenarios?: DakComponentObject;
}

/**
 * Component Object Context value interface
 */
export interface ComponentObjectContextValue {
  dakObject: DakObject | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  // Component accessors
  healthInterventions?: DakComponentObject;
  personas?: DakComponentObject;
  userScenarios?: DakComponentObject;
  businessProcesses?: DakComponentObject;
  dataElements?: DakComponentObject;
  decisionLogic?: DakComponentObject;
  indicators?: DakComponentObject;
  requirements?: DakComponentObject;
  testScenarios?: DakComponentObject;
  // Context
  repository: string;
  branch: string;
  profile: any;
}

/**
 * Props for ComponentObjectProvider
 */
export interface ComponentObjectProviderProps {
  children: ReactNode;
  repository: string;
  branch?: string;
  profile?: any;
}

const ComponentObjectContext = createContext<ComponentObjectContextValue | null>(null);

/**
 * Provider component that initializes and provides DAK object
 */
export const ComponentObjectProvider: React.FC<ComponentObjectProviderProps> = ({ 
  children, 
  repository, 
  branch, 
  profile 
}) => {
  const [dakObject, setDakObject] = useState<DakObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize DAK object when repository changes
  useEffect(() => {
    const initializeDakObject = async () => {
      if (!repository) {
        setLoading(false);
        setDakObject(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Initialize through integration service
        const dak = await editorIntegrationService.initializeForRepository(
          repository,
          branch || 'main'
        );
        
        setDakObject(dak);
      } catch (err) {
        console.error('Failed to initialize DAK object:', err);
        setError(err as Error);
        setDakObject(null);
      } finally {
        setLoading(false);
      }
    };

    initializeDakObject();
  }, [repository, branch]);

  // Refresh DAK object (e.g., after external changes)
  const refresh = useCallback(async () => {
    if (!repository) return;
    
    try {
      setLoading(true);
      const dak = await editorIntegrationService.initializeForRepository(
        repository,
        branch || 'main'
      );
      setDakObject(dak);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh DAK object:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [repository, branch]);

  const value: ComponentObjectContextValue = {
    dakObject,
    loading,
    error,
    refresh,
    // Convenience accessors for all 9 components
    healthInterventions: dakObject?.healthInterventions,
    personas: dakObject?.personas,
    userScenarios: dakObject?.userScenarios,
    businessProcesses: dakObject?.businessProcesses,
    dataElements: dakObject?.dataElements,
    decisionLogic: dakObject?.decisionLogic,
    indicators: dakObject?.indicators,
    requirements: dakObject?.requirements,
    testScenarios: dakObject?.testScenarios,
    // Repository context
    repository,
    branch: branch || 'main',
    profile
  };

  return (
    <ComponentObjectContext.Provider value={value}>
      {children}
    </ComponentObjectContext.Provider>
  );
};

/**
 * Hook to access DAK object and component objects
 */
export const useDakObject = (): ComponentObjectContextValue => {
  const context = useContext(ComponentObjectContext);
  if (!context) {
    throw new Error('useDakObject must be used within ComponentObjectProvider');
  }
  return context;
};

/**
 * Component-specific methods interface
 */
export interface DakComponentMethods {
  component?: DakComponentObject;
  dakObject: DakObject | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  retrieveAll: () => Promise<any[]>;
  retrieveById: (id: string) => Promise<any | null>;
  save: (data: any, options?: any) => Promise<any>;
  validate: (data: any) => Promise<{ isValid: boolean; errors: any[]; warnings: any[] }>;
  getSources: () => any[];
  addSource: (source: any) => void;
}

/**
 * Hook to access a specific component object
 * 
 * @param componentType - One of: healthInterventions, personas, userScenarios,
 *   businessProcesses, dataElements, decisionLogic, indicators, requirements, testScenarios
 * @returns Component object with convenience methods
 */
export const useDakComponent = (componentType: keyof DakObject): DakComponentMethods => {
  const context = useDakObject();
  const { dakObject, loading, error, refresh } = context;
  const component = context[componentType];

  if (!component && !loading && dakObject) {
    console.warn(`Component type '${componentType}' not found in DAK object`);
  }

  return {
    component,
    dakObject,
    loading,
    error,
    refresh,
    // Convenience methods that handle null component gracefully
    retrieveAll: useCallback(async () => {
      if (!component) {
        console.warn(`Cannot retrieve from null component: ${componentType}`);
        return [];
      }
      return await component.retrieveAll();
    }, [component, componentType]),
    
    retrieveById: useCallback(async (id: string) => {
      if (!component) {
        console.warn(`Cannot retrieve by id from null component: ${componentType}`);
        return null;
      }
      return await component.retrieveById(id);
    }, [component, componentType]),
    
    save: useCallback(async (data: any, options?: any) => {
      if (!component) {
        throw new Error(`Cannot save to null component: ${componentType}`);
      }
      return await component.save(data, options);
    }, [component, componentType]),
    
    validate: useCallback(async (data: any) => {
      if (!component) {
        console.warn(`Cannot validate with null component: ${componentType}`);
        return { isValid: true, errors: [], warnings: [] };
      }
      return await component.validate(data);
    }, [component, componentType]),
    
    getSources: useCallback(() => {
      if (!component) {
        console.warn(`Cannot get sources from null component: ${componentType}`);
        return [];
      }
      return component.getSources();
    }, [component, componentType]),
    
    addSource: useCallback((source: any) => {
      if (!component) {
        throw new Error(`Cannot add source to null component: ${componentType}`);
      }
      return component.addSource(source);
    }, [component, componentType])
  };
};
