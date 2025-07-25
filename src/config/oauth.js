// OAuth configuration
// This client ID needs to be registered with GitHub for OAuth to work
// See .env.example for setup instructions

export const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || "Iv1.b507a08c87ecfe98";
export const PLACEHOLDER_CLIENT_ID = "Iv1.b507a08c87ecfe98";

// Required OAuth scopes for SGEX functionality
export const DEFAULT_SCOPES = ["repo", "read:org"];

// Check if we're using the placeholder client ID
export const isUsingPlaceholderClientId = () => {
  return GITHUB_CLIENT_ID === PLACEHOLDER_CLIENT_ID;
};

// OAuth configuration object
export const OAUTH_CONFIG = {
  clientId: GITHUB_CLIENT_ID,
  scopes: DEFAULT_SCOPES
};