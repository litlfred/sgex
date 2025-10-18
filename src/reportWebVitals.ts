/**
 * Web Vitals Performance Monitoring
 * 
 * Reports web vitals metrics for performance monitoring
 * Uses web-vitals library to track Core Web Vitals
 * 
 * @module reportWebVitals
 */

import type { Metric } from 'web-vitals';

/**
 * Callback function type for performance entry
 * @example (metric: Metric) => console.log(metric)
 */
export type ReportHandler = (metric: Metric) => void;

/**
 * Report web vitals metrics to a provided callback
 * Dynamically imports web-vitals library to track Core Web Vitals:
 * - CLS (Cumulative Layout Shift)
 * - INP (Interaction to Next Paint) - replaces FID in web-vitals v3+
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * @param onPerfEntry - Callback function to receive performance metrics
 * 
 * @example
 * reportWebVitals((metric) => {
 *   console.log(metric.name, metric.value);
 *   // Send to analytics endpoint
 *   analytics.send(metric);
 * });
 */
const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
