import { useEffect } from 'react';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export const measureWebVitals = (onMetrics: (metrics: PerformanceMetrics) => void) => {
  useEffect(() => {
    const metrics: Partial<PerformanceMetrics> = {};

    const reportWebVitals = () => {
      if (Object.keys(metrics).length === 5) {
        onMetrics(metrics as PerformanceMetrics);
      }
    };

    // Measure First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        metrics.fcp = entries[0].startTime;
        reportWebVitals();
      }
    }).observe({ entryTypes: ['paint'] });

    // Measure Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        metrics.lcp = entries[entries.length - 1].startTime;
        reportWebVitals();
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        metrics.fid = entries[0].processingStart - entries[0].startTime;
        reportWebVitals();
      }
    }).observe({ entryTypes: ['first-input'] });

    // Measure Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let cls = 0;
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += (entry as any).value;
        }
      }
      metrics.cls = cls;
      reportWebVitals();
    }).observe({ entryTypes: ['layout-shift'] });

    // Measure Time to First Byte
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      reportWebVitals();
    }

    return () => {
      // Cleanup observers if component unmounts
      PerformanceObserver.disconnect();
    };
  }, [onMetrics]);
};

export const isPerformanceGood = (metrics: PerformanceMetrics): boolean => {
  return (
    metrics.fcp < 2000 && // FCP should be under 2s
    metrics.lcp < 2500 && // LCP should be under 2.5s
    metrics.fid < 100 && // FID should be under 100ms
    metrics.cls < 0.1 && // CLS should be under 0.1
    metrics.ttfb < 600 // TTFB should be under 600ms
  );
};

export const getPerformanceReport = (metrics: PerformanceMetrics): string => {
  const issues: string[] = [];
  
  if (metrics.fcp >= 2000) issues.push('First Contentful Paint is too slow');
  if (metrics.lcp >= 2500) issues.push('Largest Contentful Paint needs improvement');
  if (metrics.fid >= 100) issues.push('First Input Delay is high');
  if (metrics.cls >= 0.1) issues.push('Layout shifts are affecting user experience');
  if (metrics.ttfb >= 600) issues.push('Server response time is high');

  return issues.length > 0
    ? `Performance issues found:\n${issues.join('\n')}`
    : 'Performance metrics are within acceptable ranges';
};