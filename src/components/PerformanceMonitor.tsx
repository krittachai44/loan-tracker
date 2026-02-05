import * as React from 'react';

/**
 * Performance monitoring wrapper using React Profiler
 * 
 * Wrap components to track render performance:
 * <PerformanceMonitor id="PaymentList">
 *   <PaymentList logs={logs} />
 * </PerformanceMonitor>
 */

interface PerformanceData {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

const performanceLog: PerformanceData[] = [];
const MAX_LOG_SIZE = 100;

// Aggregate statistics
const stats = new Map<string, {
  totalDuration: number;
  renderCount: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}>();

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  // Log the render
  const data: PerformanceData = {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  };

  performanceLog.push(data);
  if (performanceLog.length > MAX_LOG_SIZE) {
    performanceLog.shift();
  }

  // Update statistics
  const current = stats.get(id) || {
    totalDuration: 0,
    renderCount: 0,
    avgDuration: 0,
    maxDuration: 0,
    minDuration: Infinity
  };

  current.totalDuration += actualDuration;
  current.renderCount += 1;
  current.avgDuration = current.totalDuration / current.renderCount;
  current.maxDuration = Math.max(current.maxDuration, actualDuration);
  current.minDuration = Math.min(current.minDuration, actualDuration);

  stats.set(id, current);

  // Log slow renders (> 16ms = missed frame)
  if (actualDuration > 16) {
    console.warn(`[Performance] Slow render detected in "${id}":`, {
      phase,
      duration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`
    });
  }
}

interface PerformanceMonitorProps {
  id: string;
  children: React.ReactNode;
  enabled?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  id,
  children,
  enabled = import.meta.env.DEV
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <React.Profiler id={id} onRender={onRenderCallback}>
      {children}
    </React.Profiler>
  );
};

/**
 * Get performance statistics for a component
 */
export function getComponentStats(id: string) {
  return stats.get(id);
}

/**
 * Get all performance statistics
 */
export function getAllStats() {
  return Array.from(stats.entries()).map(([id, stat]) => ({
    component: id,
    ...stat
  }));
}

/**
 * Get recent performance log
 */
export function getPerformanceLog() {
  return [...performanceLog];
}

/**
 * Clear all performance data
 */
export function clearPerformanceData() {
  performanceLog.length = 0;
  stats.clear();
}

/**
 * Export performance report
 */
export function exportPerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: getAllStats(),
    recentRenders: getPerformanceLog()
  };

  console.table(report.summary);
  return report;
}

// Expose utilities in development
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__performanceMonitor = {
    getStats: getComponentStats,
    getAllStats,
    getLog: getPerformanceLog,
    clear: clearPerformanceData,
    export: exportPerformanceReport
  };
}
