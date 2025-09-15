/**
 * Performance Optimization Service
 * 
 * Tracks and manages performance optimizations including lazy loading,
 * bundle analysis, and runtime performance monitoring.
 */

import LibraryLoaderService from './libraryLoaderService';
import { lazyServiceFactory } from './lazyServices';
import { lazyModalFactory } from '../components/lazyModals';
import { lazyFrameworkFactory } from '../components/lazyFramework';

class PerformanceOptimizationService {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      initialLoad: null,
      timeToInteractive: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      cumulativeLayoutShift: null
    };
    this.lazyLoadStats = {
      services: 0,
      modals: 0,
      components: 0,
      libraries: 0
    };
    
    this.initializePerformanceTracking();
  }

  /**
   * Initialize performance tracking
   */
  initializePerformanceTracking() {
    if (typeof window === 'undefined') return;
    
    // Track initial load completion
    if (document.readyState === 'complete') {
      this.recordInitialLoad();
    } else {
      window.addEventListener('load', () => this.recordInitialLoad());
    }
    
    // Track Time to Interactive (TTI)
    this.trackTimeToInteractive();
    
    // Track Web Vitals if available
    this.trackWebVitals();
  }

  /**
   * Record initial load metrics
   */
  recordInitialLoad() {
    this.metrics.initialLoad = Date.now() - this.startTime;
    console.log(`🚀 SGEX Initial Load: ${this.metrics.initialLoad}ms`);
  }

  /**
   * Track Time to Interactive (TTI)
   */
  trackTimeToInteractive() {
    // Simple TTI estimation - when main thread is idle
    const checkTTI = () => {
      if (document.readyState === 'complete' && !this.metrics.timeToInteractive) {
        this.metrics.timeToInteractive = Date.now() - this.startTime;
        console.log(`⚡ SGEX Time to Interactive: ${this.metrics.timeToInteractive}ms`);
      }
    };
    
    // Check TTI after a delay to ensure JS execution is complete
    setTimeout(checkTTI, 100);
    
    // Also check on user interaction
    const events = ['click', 'keydown', 'touchstart'];
    const recordTTI = () => {
      if (!this.metrics.timeToInteractive) {
        this.metrics.timeToInteractive = Date.now() - this.startTime;
        events.forEach(event => {
          document.removeEventListener(event, recordTTI);
        });
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, recordTTI, { once: true });
    });
  }

  /**
   * Track Web Vitals using the web-vitals library
   */
  async trackWebVitals() {
    try {
      const webVitals = await LibraryLoaderService.lazyLoadWebVitals();
      
      // Core Web Vitals
      webVitals.getCLS((metric) => {
        this.metrics.cumulativeLayoutShift = metric.value;
        console.log(`📊 CLS: ${metric.value}`);
      });
      
      webVitals.getFID((metric) => {
        console.log(`⚡ FID: ${metric.value}ms`);
      });
      
      webVitals.getFCP((metric) => {
        this.metrics.firstContentfulPaint = metric.value;
        console.log(`🎨 FCP: ${metric.value}ms`);
      });
      
      webVitals.getLCP((metric) => {
        this.metrics.largestContentfulPaint = metric.value;
        console.log(`🖼️ LCP: ${metric.value}ms`);
      });
      
      webVitals.getTTFB((metric) => {
        console.log(`🌐 TTFB: ${metric.value}ms`);
      });
      
    } catch (error) {
      console.debug('Web Vitals not available:', error);
    }
  }

  /**
   * Record lazy loading statistics
   */
  recordLazyLoad(type, name) {
    this.lazyLoadStats[type]++;
    console.log(`🔄 Lazy loaded ${type}: ${name} (Total ${type}: ${this.lazyLoadStats[type]})`);
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport() {
    const libraries = LibraryLoaderService.getCacheStatus();
    const services = lazyServiceFactory.getCacheStatus();
    
    return {
      // Timing metrics
      timing: {
        initialLoad: this.metrics.initialLoad,
        timeToInteractive: this.metrics.timeToInteractive,
        runtime: Date.now() - this.startTime
      },
      
      // Web Vitals
      webVitals: {
        fcp: this.metrics.firstContentfulPaint,
        lcp: this.metrics.largestContentfulPaint,
        cls: this.metrics.cumulativeLayoutShift
      },
      
      // Lazy loading statistics
      lazyLoading: {
        stats: this.lazyLoadStats,
        cacheStatus: {
          libraries,
          services,
          modalsCache: lazyModalFactory.modalCache.size,
          frameworkCache: lazyFrameworkFactory.componentCache.size
        }
      },
      
      // Memory usage estimation
      memoryEstimate: {
        librariesKB: libraries.memoryUsage || 0,
        servicesKB: services.total * 30, // Rough estimate
        totalEstimateKB: (libraries.memoryUsage || 0) + (services.total * 30)
      },
      
      // Performance score estimation
      performanceScore: this.calculatePerformanceScore()
    };
  }

  /**
   * Calculate a performance score based on metrics
   */
  calculatePerformanceScore() {
    let score = 100;
    
    // Penalize slow initial load
    if (this.metrics.initialLoad > 3000) score -= 20;
    else if (this.metrics.initialLoad > 2000) score -= 10;
    else if (this.metrics.initialLoad > 1000) score -= 5;
    
    // Penalize slow TTI
    if (this.metrics.timeToInteractive > 5000) score -= 20;
    else if (this.metrics.timeToInteractive > 3500) score -= 10;
    else if (this.metrics.timeToInteractive > 2500) score -= 5;
    
    // Bonus for effective lazy loading
    const totalLazyLoaded = Object.values(this.lazyLoadStats).reduce((sum, count) => sum + count, 0);
    if (totalLazyLoaded > 10) score += 5;
    if (totalLazyLoaded > 20) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    
    if (this.metrics.initialLoad > 2000) {
      recommendations.push({
        type: 'critical',
        message: 'Initial load time is slow. Consider additional code splitting.',
        metric: 'initialLoad',
        value: this.metrics.initialLoad
      });
    }
    
    if (this.metrics.timeToInteractive > 3500) {
      recommendations.push({
        type: 'warning',
        message: 'Time to Interactive is high. Consider lazy loading more components.',
        metric: 'timeToInteractive', 
        value: this.metrics.timeToInteractive
      });
    }
    
    if (this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push({
        type: 'warning',
        message: 'Cumulative Layout Shift is high. Check for layout stability.',
        metric: 'cls',
        value: this.metrics.cumulativeLayoutShift
      });
    }
    
    const libraries = LibraryLoaderService.getCacheStatus();
    if (libraries.size < 5) {
      recommendations.push({
        type: 'info',
        message: 'Consider preloading more commonly used libraries.',
        metric: 'libraries',
        value: libraries.size
      });
    }
    
    return recommendations;
  }

  /**
   * Print performance summary to console
   */
  printPerformanceSummary() {
    const report = this.getPerformanceReport();
    
    console.group('🚀 SGEX Performance Summary');
    console.log(`⏱️ Initial Load: ${report.timing.initialLoad}ms`);
    console.log(`⚡ Time to Interactive: ${report.timing.timeToInteractive}ms`);
    console.log(`📊 Performance Score: ${report.performanceScore}/100`);
    console.log(`🔄 Lazy Loaded: ${Object.values(report.lazyLoading.stats).reduce((a, b) => a + b, 0)} items`);
    console.log(`💾 Estimated Memory Saved: ${report.memoryEstimate.totalEstimateKB}KB`);
    
    if (report.webVitals.fcp) {
      console.log(`🎨 First Contentful Paint: ${report.webVitals.fcp}ms`);
    }
    if (report.webVitals.lcp) {
      console.log(`🖼️ Largest Contentful Paint: ${report.webVitals.lcp}ms`);
    }
    
    const recommendations = this.getOptimizationRecommendations();
    if (recommendations.length > 0) {
      console.group('💡 Optimization Recommendations');
      recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🔴' : rec.type === 'warning' ? '🟡' : '🔵';
        console.log(`${icon} ${rec.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * Monitor bundle size reduction from lazy loading
   */
  estimateBundleSizeReduction() {
    const libraries = LibraryLoaderService.getCacheStatus();
    const services = lazyServiceFactory.getCacheStatus();
    
    // Rough estimates based on typical library sizes
    const libraryEstimates = {
      'octokit': 150, // KB
      'bpmn-modeler': 200,
      'bpmn-viewer': 100,
      'react-markdown': 50,
      'syntax-highlighter': 80,
      'html2canvas': 120,
      'js-yaml': 40,
      'ajv': 60
    };
    
    let estimatedSavings = 0;
    libraries.cached.forEach(lib => {
      estimatedSavings += libraryEstimates[lib] || 30; // Default 30KB
    });
    
    // Add service savings (estimated)
    estimatedSavings += services.total * 25; // 25KB average per service
    
    return {
      estimatedInitialBundleReduction: estimatedSavings,
      librariesDeferred: libraries.cached.length,
      servicesDeferred: services.total,
      totalComponentsDeferred: lazyModalFactory.modalCache.size + lazyFrameworkFactory.componentCache.size
    };
  }
}

// Create singleton instance
const performanceOptimizationService = new PerformanceOptimizationService();

// Print performance summary after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceOptimizationService.printPerformanceSummary();
    }, 2000);
  });
  
  // Make it globally available for debugging
  window.sgexPerformance = performanceOptimizationService;
}

export default performanceOptimizationService;