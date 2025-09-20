export interface GitHubAuthResult {
    success: boolean;
    tokenType?: 'classic' | 'fine-grained' | 'oauth';
    user?: any;
    error?: string;
}
export interface TokenPermissions {
    type: string;
    user: any;
}
export interface SecureTokenStorage {
    storeToken: (token: string) => boolean;
    retrieveToken: () => {
        token: string;
        type: string;
        expires: number;
    } | null;
    hasValidToken: () => boolean;
    getTokenInfo: () => any;
    clearToken: () => void;
    migrateLegacyToken: () => boolean;
    validateTokenFormat: (token: string) => {
        isValid: boolean;
        token?: string;
        type?: string;
        reason?: string;
    };
    maskToken: (token: string) => string;
}
/**
 * GitHub Authentication Service
 *
 * Handles GitHub token authentication, permissions, and session management.
 * Supports both Personal Access Tokens (classic/fine-grained) and OAuth tokens.
 */
export declare class GitHubAuthenticationService {
    private octokit;
    private isAuthenticated;
    private permissions;
    private tokenType;
    private secureTokenStorage;
    constructor(secureTokenStorage: SecureTokenStorage);
    /**
     * Create Octokit instance with lazy loading
     */
    createOctokitInstance(auth?: string | null): Promise<any>;
    /**
     * Authenticate with GitHub token
     */
    authenticate(token: string): Promise<GitHubAuthResult>;
    /**
     * Authenticate with existing Octokit instance (OAuth)
     */
    authenticateWithOctokit(octokitInstance: any): GitHubAuthResult;
    /**
     * Initialize from stored token
     */
    initializeFromStoredToken(): Promise<boolean>;
    /**
     * Check if authenticated
     */
    isAuth(): boolean;
    /**
     * Get Octokit instance
     */
    getOctokit(): any;
    /**
     * Check token permissions
     */
    checkTokenPermissions(): Promise<TokenPermissions>;
    /**
     * Check if there's a valid stored token
     */
    hasStoredToken(): boolean;
    /**
     * Get stored token information
     */
    getStoredTokenInfo(): any;
    /**
     * Get current user
     */
    getCurrentUser(): Promise<any>;
    /**
     * Logout and clear authentication
     */
    logout(): void;
    /**
     * Get token type
     */
    getTokenType(): string | null;
    /**
     * Get permissions
     */
    getPermissions(): TokenPermissions | null;
}
//# sourceMappingURL=github-auth.d.ts.map