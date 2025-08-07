/**
 * WebAssembly Loader Utility
 * 
 * Provides utilities for loading and managing WebAssembly modules
 * with proper error handling and browser compatibility.
 */

export class WasmLoader {
  constructor() {
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Load a WebAssembly module with caching
   * @param {string} moduleName - Name of the module for caching
   * @param {string|ArrayBuffer} source - URL to WASM file or ArrayBuffer
   * @param {Object} imports - WebAssembly imports object
   * @returns {Promise<WebAssembly.Instance>}
   */
  async loadModule(moduleName, source, imports = {}) {
    // Check if already loaded
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    // Check if currently loading
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }

    // Start loading
    const loadingPromise = this._loadModuleInternal(source, imports);
    this.loadingPromises.set(moduleName, loadingPromise);

    try {
      const instance = await loadingPromise;
      this.loadedModules.set(moduleName, instance);
      this.loadingPromises.delete(moduleName);
      return instance;
    } catch (error) {
      this.loadingPromises.delete(moduleName);
      throw error;
    }
  }

  async _loadModuleInternal(source, imports) {
    let wasmBytes;

    if (source instanceof ArrayBuffer) {
      wasmBytes = source;
    } else if (typeof source === 'string') {
      // Load from URL
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM module: ${response.statusText}`);
      }
      wasmBytes = await response.arrayBuffer();
    } else {
      throw new Error('Invalid WASM source: must be URL string or ArrayBuffer');
    }

    // Compile and instantiate
    const module = await WebAssembly.compile(wasmBytes);
    const instance = await WebAssembly.instantiate(module, imports);

    return instance;
  }

  /**
   * Check if WebAssembly is supported in this browser
   * @returns {boolean}
   */
  static isSupported() {
    return typeof WebAssembly === 'object' &&
           typeof WebAssembly.instantiate === 'function';
  }

  /**
   * Get information about WebAssembly support
   * @returns {Object}
   */
  static getSupportInfo() {
    const support = {
      basic: typeof WebAssembly === 'object',
      streaming: typeof WebAssembly.instantiateStreaming === 'function',
      threads: typeof SharedArrayBuffer !== 'undefined',
      simd: false // SIMD detection is more complex
    };

    // Check for SIMD support (simplified check)
    try {
      support.simd = typeof WebAssembly.v128 !== 'undefined';
    } catch (e) {
      support.simd = false;
    }

    return support;
  }

  /**
   * Clear the module cache
   */
  clearCache() {
    this.loadedModules.clear();
    this.loadingPromises.clear();
  }

  /**
   * Remove a specific module from cache
   * @param {string} moduleName 
   */
  unloadModule(moduleName) {
    this.loadedModules.delete(moduleName);
    this.loadingPromises.delete(moduleName);
  }
}

/**
 * Performance monitor for comparing JavaScript vs WebAssembly execution
 */
export class WasmPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Start timing an operation
   * @param {string} operationName 
   * @param {string} implementation - 'js' or 'wasm'
   */
  startTiming(operationName, implementation = 'unknown') {
    const key = `${operationName}-${implementation}`;
    this.metrics.set(key, {
      startTime: performance.now(),
      implementation,
      operationName
    });
  }

  /**
   * End timing an operation
   * @param {string} operationName 
   * @param {string} implementation 
   * @returns {number} Duration in milliseconds
   */
  endTiming(operationName, implementation = 'unknown') {
    const key = `${operationName}-${implementation}`;
    const metric = this.metrics.get(key);
    
    if (!metric) {
      console.warn(`No timing started for ${key}`);
      return 0;
    }

    const duration = performance.now() - metric.startTime;
    metric.duration = duration;
    metric.endTime = performance.now();

    return duration;
  }

  /**
   * Get performance comparison between implementations
   * @param {string} operationName 
   * @returns {Object}
   */
  getComparison(operationName) {
    const jsKey = `${operationName}-js`;
    const wasmKey = `${operationName}-wasm`;
    
    const jsMetric = this.metrics.get(jsKey);
    const wasmMetric = this.metrics.get(wasmKey);

    if (!jsMetric || !wasmMetric) {
      return null;
    }

    const speedup = jsMetric.duration / wasmMetric.duration;
    
    return {
      javascript: {
        duration: jsMetric.duration,
        implementation: 'JavaScript'
      },
      webassembly: {
        duration: wasmMetric.duration,
        implementation: 'WebAssembly'
      },
      speedup: speedup,
      winner: speedup > 1 ? 'WebAssembly' : 'JavaScript',
      improvement: speedup > 1 ? 
        `${((speedup - 1) * 100).toFixed(1)}% faster` :
        `${((1 - speedup) * 100).toFixed(1)}% slower`
    };
  }

  /**
   * Get all performance metrics
   * @returns {Array}
   */
  getAllMetrics() {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }
}

// Singleton instances
export const wasmLoader = new WasmLoader();
export const performanceMonitor = new WasmPerformanceMonitor();