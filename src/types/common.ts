/**
 * Common type definitions for the SGEX application
 */

import React from 'react';

// GitHub-related types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  description?: string;
  private: boolean;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  name?: string;
  email?: string;
  avatar_url: string;
  type: string;
}

// DAK-related types
export interface DAKComponent {
  id: string;
  title: string;
  description: string;
  path?: string;
  assetTypes?: string[];
  requiresAuth?: boolean;
}

export interface SushiConfig {
  id: string;
  canonical?: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  version?: string;
  fhirVersion?: string;
  dependencies?: Record<string, string>;
  parameters?: Record<string, any>;
}

// Application state types
export interface AppContext {
  user?: GitHubUser;
  githubToken?: string;
  selectedRepo?: GitHubRepository;
  selectedBranch?: string;
  isAuthenticated: boolean;
}

// Component props types
export interface RouteParams {
  user?: string;
  repo?: string;
  branch?: string;
  asset?: string;
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  loading: boolean;
}

// Theme types
export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  images: {
    mascot: string;
    logo: string;
  };
}