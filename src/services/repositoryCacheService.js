// Repository cache service stub
class RepositoryCacheService {
  getCachedRepositories(owner, type) {
    // Return null to indicate no cached data
    return null;
  }

  setCachedRepositories(owner, type, repositories) {
    // Stub implementation
    console.log(`Caching ${repositories.length} repositories for ${owner} (${type})`);
  }

  clearCache() {
    // Stub implementation
    console.log('Cache cleared');
  }
}

const repositoryCacheService = new RepositoryCacheService();
export default repositoryCacheService;