import type { RunStatus } from '../types';

/** Capitalizes the first letter only, e.g. "on-demand" → "On-demand". Used for
 * chip/text labels sourced from lowercase enum values (status, trigger, env). */
export function capitalize(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function runStatusColor(status: RunStatus): 'success' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'error';
    case 'running':
      return 'info';
    default:
      return 'default';
  }
}

export function envStatusColor(
  status: 'healthy' | 'degraded' | 'unknown' | 'deploying' | undefined,
): 'success' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'deploying':
      return 'info';
    default:
      return 'default';
  }
}
