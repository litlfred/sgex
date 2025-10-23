/**
 * React hooks for DAK validation operations
 * Provides state management and validation triggers for validation framework
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  DAKValidationReport, 
  FileValidationResult,
  ComponentValidationOptions 
} from '../../services/validation/types';

// Lazy load validation service to prevent module initialization issues
let validationServicePromise: Promise<any> | null = null;
async function getValidationService() {
  if (!validationServicePromise) {
    validationServicePromise = import('../../services/validation').then(module => ({
      service: module.dakArtifactValidationService,
      ensureRulesRegistered: module.ensureRulesRegistered
    }));
  }
  return validationServicePromise;
}

/**
 * Hook options for validation
 */
export interface UseValidationOptions {
  /** Repository owner */
  owner?: string;
  /** Repository name */
  repo?: string;
  /** Branch name */
  branch?: string;
  /** Auto-validate on mount */
  autoValidate?: boolean;
  /** Debounce delay in ms */
  debounceMs?: number;
}

/**
 * Hook return type for validation operations
 */
export interface UseValidationReturn {
  /** Current validation report */
  report: DAKValidationReport | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Trigger validation */
  validate: () => Promise<void>;
  /** Clear current report */
  clear: () => void;
}

/**
 * Main validation hook for repository validation
 */
export function useValidation(options: UseValidationOptions = {}): UseValidationReturn {
  const { owner, repo, branch = 'main', autoValidate = false, debounceMs = 500 } = options;
  
  const [report, setReport] = useState<DAKValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const validate = useCallback(async () => {
    if (!owner || !repo) {
      setError(new Error('Repository owner and name required'));
      return;
    }
    
    // Clear previous error
    setError(null);
    setLoading(true);
    
    try {
      // Lazy load validation service and ensure rules are registered
      const { service, ensureRulesRegistered } = await getValidationService();
      await ensureRulesRegistered();
      
      const validationReport = await service.validateRepository(
        owner,
        repo,
        branch
      );
      setReport(validationReport);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Validation failed'));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, branch]);
  
  const clear = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);
  
  // Auto-validate on mount if enabled
  useEffect(() => {
    if (autoValidate && owner && repo) {
      // Debounce auto-validation
      debounceTimer.current = setTimeout(() => {
        validate();
      }, debounceMs);
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [autoValidate, owner, repo, branch, debounceMs, validate]);
  
  return { report, loading, error, validate, clear };
}

/**
 * Hook for single file validation
 */
export interface UseFileValidationReturn {
  /** Current validation result */
  result: FileValidationResult | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Validate a file */
  validate: (
    filePath: string,
    content: string,
    fileType: string,
    component?: string
  ) => Promise<void>;
  /** Clear current result */
  clear: () => void;
}

export function useFileValidation(): UseFileValidationReturn {
  const [result, setResult] = useState<FileValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const validate = useCallback(async (
    filePath: string,
    content: string,
    fileType: string,
    component?: string
  ) => {
    setError(null);
    setLoading(true);
    
    try {
      // Lazy load validation service and ensure rules are registered
      const { service, ensureRulesRegistered } = await getValidationService();
      await ensureRulesRegistered();
      
      const fileResult = await service.validateFile(
        filePath,
        content,
        fileType,
        component || 'unknown'
      );
      setResult(fileResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('File validation failed'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);
  
  return { result, loading, error, validate, clear };
}

/**
 * Hook for repository validation with component filtering
 */
export interface UseRepositoryValidationOptions {
  /** Component validation options */
  options?: ComponentValidationOptions;
  /** Debounce delay in ms */
  debounceMs?: number;
}

export interface UseRepositoryValidationReturn {
  /** Current validation report */
  report: DAKValidationReport | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Validate repository */
  validate: (owner: string, repo: string, branch?: string) => Promise<void>;
  /** Clear current report */
  clear: () => void;
}

export function useRepositoryValidation(
  config: UseRepositoryValidationOptions = {}
): UseRepositoryValidationReturn {
  const { options, debounceMs = 500 } = config;
  
  const [report, setReport] = useState<DAKValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const validate = useCallback(async (
    owner: string,
    repo: string,
    branch: string = 'main'
  ) => {
    setError(null);
    
    // Debounce validation
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      
      try {
        // Lazy load validation service and ensure rules are registered
        const { service, ensureRulesRegistered } = await getValidationService();
        await ensureRulesRegistered();
        
        const validationReport = await service.validateRepository(
          owner,
          repo,
          branch,
          options
        );
        setReport(validationReport);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Repository validation failed'));
        setReport(null);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [options, debounceMs]);
  
  const clear = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
  
  return { report, loading, error, validate, clear };
}

/**
 * Hook for component-specific validation
 */
export interface UseComponentValidationReturn {
  /** Current validation results */
  report: FileValidationResult[] | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Validate component */
  validate: (
    owner: string,
    repo: string,
    branch: string,
    component: string
  ) => Promise<void>;
  /** Clear current report */
  clear: () => void;
}

export function useComponentValidation(): UseComponentValidationReturn {
  const [report, setReport] = useState<FileValidationResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const validate = useCallback(async (
    owner: string,
    repo: string,
    branch: string,
    component: string
  ) => {
    setError(null);
    setLoading(true);
    
    try {
      // Lazy load validation service and ensure rules are registered
      const { service, ensureRulesRegistered } = await getValidationService();
      await ensureRulesRegistered();
      
      const validationReport = await service.validateComponent(
        owner,
        repo,
        branch,
        component
      );
      setReport(validationReport);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Component validation failed'));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const clear = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);
  
  return { report, loading, error, validate, clear };
}
