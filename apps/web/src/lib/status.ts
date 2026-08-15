import type { RunStatus } from '@lob/shared';

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

/** Display label for an environment status. "healthy" reads as "Completed" in the UI. */
export function envStatusLabel(
  status: 'healthy' | 'degraded' | 'unknown' | 'deploying' | undefined,
): string {
  switch (status) {
    case 'healthy':
      return 'Completed';
    case 'degraded':
      return 'Degraded';
    case 'deploying':
      return 'Deploying';
    default:
      return 'Unknown';
  }
}
