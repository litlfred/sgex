// GitHub OAuth configuration for SGEX Workbench
export const GITHUB_CONFIG = {
  // This is a public GitHub OAuth app client ID for SGEX Workbench
  // It's safe to include in the client-side code as it's designed to be public
  CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || 'Ov23liAfEK9eDPXV4vBj',
  
  // Default scopes for initial authentication
  DEFAULT_SCOPES: ['public_repo', 'workflow'],
  
  // Scope definitions and descriptions
  SCOPE_DESCRIPTIONS: {
    'public_repo': 'Access to public repositories (for commenting and basic interactions)',
    'repo': 'Access to private repositories',
    'workflow': 'Manage GitHub Actions workflows (view logs, restart runs)',
    'read:org': 'Read organization membership and team information',
    'read:user': 'Read user profile information'
  },
  
  // Action requirements mapping
  ACTION_SCOPES: {
    'comment': ['public_repo'], // Can also use 'repo' for private repos
    'workflow': ['workflow'],
    'write': ['public_repo'], // Can also use 'repo' for private repos
    'read': [] // No authentication required for public read access
  }
};

export default GITHUB_CONFIG;