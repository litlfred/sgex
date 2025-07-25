/**
 * Integration test for DAK Selection with caching improvements
 */

describe('DAK Selection Caching Integration', () => {
  it('should demonstrate that cache service is properly integrated', () => {
    // This test verifies that the cache service exports are working
    const repositoryCacheService = require('./repositoryCacheService').default;
    
    expect(repositoryCacheService).toBeDefined();
    expect(typeof repositoryCacheService.getCachedRepositories).toBe('function');
    expect(typeof repositoryCacheService.setCachedRepositories).toBe('function');
    expect(typeof repositoryCacheService.clearCache).toBe('function');
    expect(typeof repositoryCacheService.isStale).toBe('function');
    
    // Test basic stale detection logic
    const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    const recentTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago
    
    expect(repositoryCacheService.isStale(oldTimestamp)).toBe(true);
    expect(repositoryCacheService.isStale(recentTimestamp)).toBe(false);
    
    console.log('✅ Repository cache service integration verified');
  });

  it('should validate cache key generation', () => {
    const repositoryCacheService = require('./repositoryCacheService').default;
    
    const userKey = repositoryCacheService.getCacheKey('testuser', 'user');
    const orgKey = repositoryCacheService.getCacheKey('testorg', 'org');
    
    expect(userKey).toBe('sgex_repo_cache_user_testuser');
    expect(orgKey).toBe('sgex_repo_cache_org_testorg');
    expect(userKey).not.toBe(orgKey);
    
    console.log('✅ Cache key generation working correctly');
  });
});