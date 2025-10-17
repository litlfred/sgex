/**
 * Component Object Provider
 * 
 * React context provider for DAK Component Objects.
 * Provides access to DAK object and all 9 component objects to child components.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import editorIntegrationService from './editorIntegrationService';

const ComponentObjectContext = createContext(null);

/**
 * Provider component that initializes and provides DAK object
 */
export const ComponentObjectProvider = ({ children, repository, branch, profile }) => {
  const [dakObject, setDakObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err);
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
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [repository, branch]);

  const value = {
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
    branch,
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
export const useDakObject = () => {
  const context = useContext(ComponentObjectContext);
  if (!context) {
    throw new Error('useDakObject must be used within ComponentObjectProvider');
  }
  return context;
};

/**
 * Hook to access a specific component object
 * 
 * @param {string} componentType - One of: healthInterventions, personas, userScenarios,
 *   businessProcesses, dataElements, decisionLogic, indicators, requirements, testScenarios
 * @returns {object} Component object with convenience methods
 */
export const useDakComponent = (componentType) => {
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
    
    retrieveById: useCallback(async (id) => {
      if (!component) {
        console.warn(`Cannot retrieve by id from null component: ${componentType}`);
        return null;
      }
      return await component.retrieveById(id);
    }, [component, componentType]),
    
    save: useCallback(async (data, options) => {
      if (!component) {
        throw new Error(`Cannot save to null component: ${componentType}`);
      }
      return await component.save(data, options);
    }, [component, componentType]),
    
    validate: useCallback(async (data) => {
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
    
    addSource: useCallback((source) => {
      if (!component) {
        throw new Error(`Cannot add source to null component: ${componentType}`);
      }
      return component.addSource(source);
    }, [component, componentType])
  };
};
