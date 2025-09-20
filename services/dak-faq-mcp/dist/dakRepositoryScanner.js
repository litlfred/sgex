/**
 * DAK Repository Scanner Service
 * Scans GitHub profiles for SMART Guidelines DAK repositories
 */
import fetch from 'node-fetch';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
export class DAKRepositoryScanner {
    cacheDir;
    cacheFile;
    cacheExpiryHours = 24;
    githubToken;
    defaultProfiles = ['WorldHealthOrganization'];
    logger;
    constructor(logger, githubToken) {
        this.logger = logger;
        this.githubToken = githubToken;
        this.cacheDir = join(process.cwd(), '.dak-scanner-cache');
        this.cacheFile = join(this.cacheDir, 'scan-cache.json');
        // Ensure cache directory exists
        if (!existsSync(this.cacheDir)) {
            mkdirSync(this.cacheDir, { recursive: true });
        }
    }
    /**
     * Get current cache or create empty cache
     */
    getCache() {
        if (!existsSync(this.cacheFile)) {
            return {
                profiles: this.defaultProfiles.map(login => ({ login })),
                repositories: [],
                lastScan: '',
                cacheExpiry: ''
            };
        }
        try {
            const cacheData = readFileSync(this.cacheFile, 'utf-8');
            const cache = JSON.parse(cacheData);
            // Ensure default profiles are included
            const existingLogins = cache.profiles.map((p) => p.login);
            for (const defaultProfile of this.defaultProfiles) {
                if (!existingLogins.includes(defaultProfile)) {
                    cache.profiles.push({ login: defaultProfile });
                }
            }
            return cache;
        }
        catch (error) {
            this.logger.warn('CACHE_READ', `Failed to read cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                profiles: this.defaultProfiles.map(login => ({ login })),
                repositories: [],
                lastScan: '',
                cacheExpiry: ''
            };
        }
    }
    /**
     * Save cache to file
     */
    saveCache(cache) {
        try {
            writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
            this.logger.debug('CACHE_SAVE', 'Cache saved successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('CACHE_SAVE', `Failed to save cache: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Check if cache is still valid (not expired)
     */
    isCacheValid(cache) {
        if (!cache.cacheExpiry)
            return false;
        const expiryTime = new Date(cache.cacheExpiry);
        return new Date() < expiryTime;
    }
    /**
     * Make GitHub API request with authentication if available
     */
    async githubRequest(url) {
        const headers = {
            'User-Agent': 'SGEX-DAK-Scanner/1.0',
            'Accept': 'application/vnd.github.v3+json'
        };
        if (this.githubToken) {
            headers['Authorization'] = `Bearer ${this.githubToken}`;
        }
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Check if a repository is a SMART Guidelines DAK
     */
    async isDakRepository(owner, repo) {
        try {
            // Try to fetch sushi-config.yaml
            const configUrl = `https://api.github.com/repos/${owner}/${repo}/contents/sushi-config.yaml`;
            const configResponse = await this.githubRequest(configUrl);
            if (configResponse.content) {
                // Decode base64 content
                const configContent = Buffer.from(configResponse.content, 'base64').toString();
                // Parse YAML (simple parsing for key detection)
                const lines = configContent.split('\n');
                let hasDependencies = false;
                let hasSmartBase = false;
                let version = '';
                const dependencies = [];
                let inDependencies = false;
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('version:')) {
                        version = trimmed.split(':')[1]?.trim().replace(/['"]/g, '') || '';
                    }
                    if (trimmed === 'dependencies:') {
                        inDependencies = true;
                        hasDependencies = true;
                        continue;
                    }
                    if (inDependencies) {
                        if (trimmed.startsWith('smart.who.int.base:')) {
                            hasSmartBase = true;
                            dependencies.push('smart.who.int.base');
                        }
                        else if (trimmed.includes(':') && !trimmed.startsWith(' ')) {
                            // End of dependencies section
                            inDependencies = false;
                        }
                        else if (trimmed.includes(':')) {
                            // Another dependency
                            const dep = trimmed.split(':')[0]?.trim();
                            if (dep)
                                dependencies.push(dep);
                        }
                    }
                }
                const isDAK = hasDependencies && hasSmartBase;
                return {
                    isDAK,
                    dakVersion: version || undefined,
                    dependencies: dependencies.length > 0 ? dependencies : undefined
                };
            }
        }
        catch (error) {
            // Repository might not have sushi-config.yaml or might be private
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.debug('DAK_CHECK', `Cannot access sushi-config.yaml for ${owner}/${repo}: ${errorMessage}`);
        }
        return { isDAK: false };
    }
    /**
     * Scan repositories for a GitHub profile
     */
    async scanProfile(profile) {
        this.logger.info('PROFILE_SCAN', `Scanning profile: ${profile}`);
        try {
            // Get user's public repositories
            const reposUrl = `https://api.github.com/users/${profile}/repos?per_page=100&type=public`;
            const repositories = await this.githubRequest(reposUrl);
            const dakRepos = [];
            // Check each repository for DAK compliance
            for (const repo of repositories) {
                this.logger.debug('REPO_CHECK', `Checking repository: ${repo.full_name}`);
                const dakCheck = await this.isDakRepository(repo.owner.login, repo.name);
                const dakRepo = {
                    owner: repo.owner.login,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    htmlUrl: repo.html_url,
                    cloneUrl: repo.clone_url,
                    lastUpdated: repo.updated_at,
                    starCount: repo.stargazers_count,
                    forkCount: repo.forks_count,
                    isDAK: dakCheck.isDAK,
                    dakVersion: dakCheck.dakVersion,
                    dependencies: dakCheck.dependencies,
                    scannedAt: new Date().toISOString()
                };
                if (dakCheck.isDAK) {
                    this.logger.info('DAK_FOUND', `Found DAK repository: ${repo.full_name}`);
                }
                dakRepos.push(dakRepo);
                // Rate limiting: small delay between requests
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            this.logger.info('PROFILE_SCAN_COMPLETE', `Completed scanning ${profile}: found ${dakRepos.filter(r => r.isDAK).length} DAK repositories out of ${dakRepos.length} total`);
            return dakRepos;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('PROFILE_SCAN_ERROR', `Failed to scan profile ${profile}: ${errorMessage}`, error instanceof Error ? error : undefined);
            return [];
        }
    }
    /**
     * Scan all configured profiles for DAK repositories
     */
    async scanAllProfiles(forceRescan = false) {
        const cache = this.getCache();
        // Check if we should use cached data
        if (!forceRescan && this.isCacheValid(cache)) {
            this.logger.info('CACHE_VALID', `Using cached DAK repository data (expires: ${cache.cacheExpiry})`);
            return cache.repositories.filter(r => r.isDAK);
        }
        this.logger.info('SCAN_START', `Starting DAK repository scan for ${cache.profiles.length} profiles`);
        const allRepositories = [];
        // Scan each profile
        for (const profile of cache.profiles) {
            const repos = await this.scanProfile(profile.login);
            allRepositories.push(...repos);
            // Update profile scan info
            profile.lastScanned = new Date().toISOString();
            profile.repositoryCount = repos.length;
            profile.dakCount = repos.filter(r => r.isDAK).length;
        }
        // Update cache
        const newCache = {
            profiles: cache.profiles,
            repositories: allRepositories,
            lastScan: new Date().toISOString(),
            cacheExpiry: new Date(Date.now() + this.cacheExpiryHours * 60 * 60 * 1000).toISOString()
        };
        this.saveCache(newCache);
        const dakCount = allRepositories.filter(r => r.isDAK).length;
        this.logger.info('SCAN_COMPLETE', `Scan completed: found ${dakCount} DAK repositories out of ${allRepositories.length} total repositories`);
        return allRepositories.filter(r => r.isDAK);
    }
    /**
     * Get all known DAK repositories (from cache)
     */
    getKnownDAKs() {
        const cache = this.getCache();
        return cache.repositories.filter(r => r.isDAK);
    }
    /**
     * Get all repositories (including non-DAKs)
     */
    getAllRepositories() {
        const cache = this.getCache();
        return cache.repositories;
    }
    /**
     * Add a new GitHub profile to scan
     */
    addProfile(profile) {
        const cache = this.getCache();
        const existingProfile = cache.profiles.find(p => p.login === profile);
        if (!existingProfile) {
            cache.profiles.push({ login: profile });
            this.saveCache(cache);
            this.logger.info('PROFILE_ADDED', `Added new profile to scan: ${profile}`);
        }
        else {
            this.logger.warn('PROFILE_EXISTS', `Profile already exists: ${profile}`);
        }
    }
    /**
     * Add a specific repository to the known DAKs list
     */
    addRepository(owner, repo) {
        const cache = this.getCache();
        const fullName = `${owner}/${repo}`;
        const existingRepo = cache.repositories.find(r => r.fullName === fullName);
        if (!existingRepo) {
            // Create a basic repository entry (will be properly scanned on next full scan)
            const newRepo = {
                owner,
                name: repo,
                fullName,
                htmlUrl: `https://github.com/${fullName}`,
                cloneUrl: `https://github.com/${fullName}.git`,
                lastUpdated: new Date().toISOString(),
                starCount: 0,
                forkCount: 0,
                isDAK: true, // Assume it's a DAK since user is adding it manually
                scannedAt: new Date().toISOString()
            };
            cache.repositories.push(newRepo);
            this.saveCache(cache);
            this.logger.info('REPO_ADDED', `Added repository: ${fullName}`);
        }
        else {
            this.logger.warn('REPO_EXISTS', `Repository already exists: ${fullName}`);
        }
    }
    /**
     * Get scan status and statistics
     */
    getScanStatus() {
        const cache = this.getCache();
        const dakRepos = cache.repositories.filter(r => r.isDAK);
        return {
            lastScan: cache.lastScan,
            cacheExpiry: cache.cacheExpiry,
            cacheValid: this.isCacheValid(cache),
            profiles: cache.profiles,
            totalRepositories: cache.repositories.length,
            dakRepositories: dakRepos.length,
            topDAKs: dakRepos
                .sort((a, b) => b.starCount - a.starCount)
                .slice(0, 10)
                .map(r => ({
                fullName: r.fullName,
                description: r.description,
                stars: r.starCount,
                version: r.dakVersion
            }))
        };
    }
}
//# sourceMappingURL=dakRepositoryScanner.js.map