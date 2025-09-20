/**
 * DAK Repository Scanner Service
 * Scans GitHub profiles for SMART Guidelines DAK repositories
 */
interface DAKRepository {
    owner: string;
    name: string;
    fullName: string;
    description?: string;
    htmlUrl: string;
    cloneUrl: string;
    lastUpdated: string;
    starCount: number;
    forkCount: number;
    isDAK: boolean;
    dakVersion?: string;
    dependencies?: string[];
    scannedAt: string;
}
export declare class DAKRepositoryScanner {
    private cacheDir;
    private cacheFile;
    private cacheExpiryHours;
    private githubToken?;
    private defaultProfiles;
    private logger;
    constructor(logger: any, githubToken?: string);
    /**
     * Get current cache or create empty cache
     */
    private getCache;
    /**
     * Save cache to file
     */
    private saveCache;
    /**
     * Check if cache is still valid (not expired)
     */
    private isCacheValid;
    /**
     * Make GitHub API request with authentication if available
     */
    private githubRequest;
    /**
     * Check if a repository is a SMART Guidelines DAK
     */
    private isDakRepository;
    /**
     * Scan repositories for a GitHub profile
     */
    private scanProfile;
    /**
     * Scan all configured profiles for DAK repositories
     */
    scanAllProfiles(forceRescan?: boolean): Promise<DAKRepository[]>;
    /**
     * Get all known DAK repositories (from cache)
     */
    getKnownDAKs(): DAKRepository[];
    /**
     * Get all repositories (including non-DAKs)
     */
    getAllRepositories(): DAKRepository[];
    /**
     * Add a new GitHub profile to scan
     */
    addProfile(profile: string): void;
    /**
     * Add a specific repository to the known DAKs list
     */
    addRepository(owner: string, repo: string): void;
    /**
     * Get scan status and statistics
     */
    getScanStatus(): any;
}
export {};
//# sourceMappingURL=dakRepositoryScanner.d.ts.map