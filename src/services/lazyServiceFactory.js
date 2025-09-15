/**
 * Lazy Service Factory
 * 
 * Provides lazy loading for heavy services to improve initial page load performance.
 * This factory delays service initialization until they are actually needed.
 * 
 * Benefits:
 * - Reduces initial bundle size
 * - Faster Time to Interactive (TTI)
 * - Better memory management
 * - Improved code splitting
 */

class LazyServiceFactory {
  constructor() {
    this.serviceCache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Create a lazy service loader
   * @param {string} serviceName - Name of the service for debugging
   * @param {Function} importFunction - Function that returns import() promise
   * @returns {Object} Proxy object that loads service on first access
   */
  createLazyService(serviceName, importFunction) {
    return new Proxy({}, {
      get: (target, prop) => {
        // Return loading promise if service is currently loading
        if (this.loadingPromises.has(serviceName)) {
          return this.loadingPromises.get(serviceName).then(service => service[prop]);
        }

        // Return cached service if already loaded
        if (this.serviceCache.has(serviceName)) {
          const service = this.serviceCache.get(serviceName);
          return typeof service[prop] === 'function' ? service[prop].bind(service) : service[prop];
        }

        // Start loading the service
        const loadingPromise = importFunction()
          .then(module => {
            const service = module.default || module;
            this.serviceCache.set(serviceName, service);
            this.loadingPromises.delete(serviceName);
            return service;
          })
          .catch(error => {
            console.error(`Failed to load service ${serviceName}:`, error);
            this.loadingPromises.delete(serviceName);
            throw error;
          });

        this.loadingPromises.set(serviceName, loadingPromise);

        // For immediate method calls, return a promise that resolves with the method result
        return loadingPromise.then(service => {
          const value = service[prop];
          return typeof value === 'function' ? value.bind(service) : value;
        });
      }
    });
  }

  /**
   * Create a lazy service with immediate synchronous access after first load
   * @param {string} serviceName - Name of the service
   * @param {Function} importFunction - Import function
   * @returns {Object} Service proxy
   */
  createEagerLazyService(serviceName, importFunction) {
    let serviceInstance = null;
    let loadingPromise = null;

    // Pre-load the service
    const preload = () => {
      if (!loadingPromise) {
        loadingPromise = importFunction()
          .then(module => {
            serviceInstance = module.default || module;
            return serviceInstance;
          })
          .catch(error => {
            console.error(`Failed to preload service ${serviceName}:`, error);
            throw error;
          });
      }
      return loadingPromise;
    };

    return new Proxy({}, {
      get: (target, prop) => {
        if (prop === '_preload') {
          return preload;
        }

        // If service is already loaded, return immediately
        if (serviceInstance) {
          const value = serviceInstance[prop];
          return typeof value === 'function' ? value.bind(serviceInstance) : value;
        }

        // Start preloading if not already started
        if (!loadingPromise) {
          preload();
        }

        // Return promise for async access
        return loadingPromise.then(service => {
          const value = service[prop];
          return typeof value === 'function' ? value.bind(service) : value;
        });
      }
    });
  }

  /**
   * Clear all cached services (useful for testing)
   */
  clearCache() {
    this.serviceCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus() {
    return {
      cached: Array.from(this.serviceCache.keys()),
      loading: Array.from(this.loadingPromises.keys()),
      total: this.serviceCache.size + this.loadingPromises.size
    };
  }
}

// Create and export singleton instance
const lazyServiceFactory = new LazyServiceFactory();

export default lazyServiceFactory;