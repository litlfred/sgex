import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';

describe('Repository Compatibility Cache', () => {
  beforeEach(() => {
    repositoryCompatibilityCache.clear();
  });

  afterEach(() => {
    repositoryCompatibilityCache.clear();
  });

  it('should cache and retrieve compatibility results', () => {
    const owner = 'testowner';
    const repo = 'testrepo';
    
    // Initially should return null
    expect(repositoryCompatibilityCache.get(owner, repo)).toBeNull();
    
    // Set a value
    repositoryCompatibilityCache.set(owner, repo, true);
    
    // Should retrieve the cached value
    expect(repositoryCompatibilityCache.get(owner, repo)).toBe(true);
  });

  it('should handle different owner/repo combinations', () => {
    repositoryCompatibilityCache.set('owner1', 'repo1', true);
    repositoryCompatibilityCache.set('owner1', 'repo2', false);
    repositoryCompatibilityCache.set('owner2', 'repo1', true);
    
    expect(repositoryCompatibilityCache.get('owner1', 'repo1')).toBe(true);
    expect(repositoryCompatibilityCache.get('owner1', 'repo2')).toBe(false);
    expect(repositoryCompatibilityCache.get('owner2', 'repo1')).toBe(true);
    expect(repositoryCompatibilityCache.get('owner2', 'repo2')).toBeNull();
  });

  it('should handle TTL expiration', (done) => {
    // Create a cache with very short TTL
    const shortTtlCache = new (require('../utils/repositoryCompatibilityCache').default.constructor)(0.01); // 0.01 minutes = 0.6 seconds
    
    shortTtlCache.set('owner', 'repo', true);
    expect(shortTtlCache.get('owner', 'repo')).toBe(true);
    
    // Wait for expiration
    setTimeout(() => {
      expect(shortTtlCache.get('owner', 'repo')).toBeNull();
      done();
    }, 700); // Wait longer than TTL
  });

  it('should provide cache statistics', () => {
    repositoryCompatibilityCache.set('owner1', 'repo1', true);
    repositoryCompatibilityCache.set('owner2', 'repo2', false);
    
    const stats = repositoryCompatibilityCache.getStats();
    
    expect(stats.size).toBe(2);
    expect(stats.ttlMinutes).toBe(30);
    expect(stats.entries).toHaveLength(2);
    expect(stats.entries[0]).toHaveProperty('repository');
    expect(stats.entries[0]).toHaveProperty('compatible');
    expect(stats.entries[0]).toHaveProperty('ageMinutes');
  });

  it('should clear all cached entries', () => {
    repositoryCompatibilityCache.set('owner1', 'repo1', true);
    repositoryCompatibilityCache.set('owner2', 'repo2', false);
    
    expect(repositoryCompatibilityCache.getStats().size).toBe(2);
    
    repositoryCompatibilityCache.clear();
    
    expect(repositoryCompatibilityCache.getStats().size).toBe(0);
    expect(repositoryCompatibilityCache.get('owner1', 'repo1')).toBeNull();
  });

  it('should clean up expired entries', (done) => {
    // Create a cache with very short TTL
    const shortTtlCache = new (require('../utils/repositoryCompatibilityCache').default.constructor)(0.01);
    
    shortTtlCache.set('owner1', 'repo1', true);
    shortTtlCache.set('owner2', 'repo2', false);
    
    expect(shortTtlCache.getStats().size).toBe(2);
    
    setTimeout(() => {
      // Cleanup should remove expired entries
      shortTtlCache.cleanup();
      expect(shortTtlCache.getStats().size).toBe(0);
      done();
    }, 700);
  });
});