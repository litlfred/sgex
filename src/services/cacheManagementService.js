// Cache management service stub
class CacheManagementService {
  clearAllCaches() {
    console.log('All caches cleared');
  }

  getCacheSize() {
    return 0;
  }

  getCacheInfo() {
    return {
      repositories: 0,
      branches: 0,
      files: 0
    };
  }
}

const cacheManagementService = new CacheManagementService();
export default cacheManagementService;