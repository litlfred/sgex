/**
 * Core SGEX Workbench Type Definitions
 * 
 * This file contains the main type definitions for the SGEX Workbench application.
 * These types are used throughout the application for type safety and will be used
 * to generate JSON schemas for runtime validation.
 */

// ============================================================================
// UI COMPONENT TYPES  
// ============================================================================

/**
 * Language and Translation Types
 */
export interface Language {
  code: string;
  name: string;
  englishName?: string;
  flag: string;
}

export interface LanguageSelectorProps {
  className?: string;
}

/**
 * Page and Navigation Types
 */
export interface PageLayoutProps {
  pageName: string;
  children: React.ReactNode;
  className?: string;
}

export interface NavigationState {
  user?: string;
  repo?: string;
  branch?: string;
  component?: string;
  warningMessage?: string;
}

export interface DAKUrlInfo {
  isValid: boolean;
  component?: string;
  user?: string;
  repo?: string;
  branch?: string;
  assetPath: string[];
}

// ====================
// GitHub API Types
// ====================

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id?: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  bio?: string;
  twitter_username?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description?: string;
  fork: boolean;
  url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  clone_url: string;
  mirror_url?: string;
  hooks_url: string;
  svn_url: string;
  homepage?: string;
  language?: string;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template?: boolean;
  topics?: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  visibility?: string;
  pushed_at?: string;
  created_at: string;
  updated_at: string;
  permissions?: {
    admin: boolean;
    maintain?: boolean;
    push: boolean;
    triage?: boolean;
    pull: boolean;
  };
  allow_rebase_merge?: boolean;
  template_repository?: GitHubRepository;
  temp_clone_token?: string;
  allow_squash_merge?: boolean;
  allow_auto_merge?: boolean;
  delete_branch_on_merge?: boolean;
  allow_merge_commit?: boolean;
  subscribers_count?: number;
  network_count?: number;
  license?: {
    key: string;
    name: string;
    spdx_id?: string;
    url?: string;
    node_id?: string;
  };
  forks?: number;
  open_issues?: number;
  watchers?: number;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection?: {
    enabled: boolean;
    required_status_checks: {
      enforcement_level: string;
      contexts: string[];
    };
  };
  protection_url?: string;
}

// ====================
// DAK (Digital Adaptation Kit) Types
// ====================

export interface SushiConfig {
  id?: string;
  canonical?: string;
  version?: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  license?: string;
  date?: string;
  publisher?: {
    name?: string;
    url?: string;
  };
  contact?: Array<{
    name?: string;
    telecom?: Array<{
      system?: string;
      value?: string;
    }>;
  }>;
  dependencies?: Record<string, string>;
  fhirVersion?: string[];
  FSHOnly?: boolean;
  applyExtensionMetadataToRoot?: boolean;
  parameters?: Array<{
    code?: string;
    value?: string;
  }>;
  copyrightYear?: string;
  releaseLabel?: string;
}

export interface DAKRepository extends GitHubRepository {
  sushiConfig: SushiConfig;
  isDak: true;
}

export interface DAKValidationResult {
  isValid: boolean;
  hasSushiConfig: boolean;
  hasWhoBaseDependency: boolean;
  sushiConfig?: SushiConfig;
  errors: string[];
  warnings: string[];
}

// ====================
// Profile Subscription Types
// ====================

export interface ProfileSubscription {
  login: string;
  name?: string;
  avatar_url?: string;
  html_url?: string;
  isPermanent: boolean;
  subscribedAt: string;
  lastUsed?: string;
  repositoryCount?: number;
}

export interface ProfileSubscriptionExport {
  version: string;
  exportedAt: string;
  userLogin: string;
  subscriptions: ProfileSubscription[];
}

// ====================
// Authentication Types
// ====================

export interface AuthenticationState {
  isAuthenticated: boolean;
  token?: string;
  user?: GitHubUser;
  tokenType: 'classic' | 'fine-grained' | 'oauth' | null;
  scopes?: string[];
  lastValidated?: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  user?: GitHubUser;
  scopes?: string[];
  tokenType: 'classic' | 'fine-grained' | 'oauth';
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

export interface GitHubPermissions {
  contents: 'read' | 'write' | null;
  metadata: 'read' | null;
  pullRequests: 'read' | 'write' | null;
  [key: string]: string | null;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}

export interface GitHubApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  url: string;
}

export interface TokenFormatValidation {
  isValid: boolean;
  type: 'classic' | 'fine-grained' | 'oauth' | 'legacy' | 'invalid';
  token?: string;
  reason?: string;
}

// ====================
// Cache Types
// ====================

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

export interface CacheStatistics {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  oldestEntry?: string;
  newestEntry?: string;
}

export interface RepositoryCacheData {
  repositories: GitHubRepository[];
  timestamp: number;
  owner: string;
  type: 'user' | 'org';
}

export interface CacheResult<T> {
  data: T | null;
  isHit: boolean;
  age?: number;
}

// ====================
// Validation Framework Types
// ====================

export interface ValidationRule<T = any> {
  name: string;
  description: string;
  validator: (data: T) => ValidationResult;
  schema?: any; // JSON Schema
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  value?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  value?: any;
}

// ====================
// Runtime Validation Service Types
// ====================

export interface RuntimeValidationConfig {
  strict: boolean;
  throwOnError: boolean;
  coerceTypes: boolean;
  removeAdditional: boolean;
}

export interface ValidatedData<T> {
  data: T;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// ====================
// Logging Types
// ====================

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface Logger {
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  
  // Specialized logging methods
  apiCall: (method: string, url: string, data?: any) => void;
  apiResponse: (method: string, url: string, status: number, responseTime: number) => void;
  apiError: (method: string, url: string, error: any) => void;
  
  componentMount: (props?: any) => void;
  componentUnmount: () => void;
  stateChange: (oldState: any, newState: any) => void;
  
  userAction: (action: string, details?: any) => void;
  
  performance: (operation: string, duration: number) => void;
  
  auth: (event: string, details?: any) => void;
  
  navigation: (from: string, to: string) => void;
  
  cache: (operation: string, key: string, details?: any) => void;
}

// ====================
// Utility Types
// ====================

export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}>;

export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

export type PaginatedResponse<T> = ServiceResponse<{
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}>;