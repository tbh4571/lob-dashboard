import type {
  Application,
  Component,
  PipelineRun,
  Schedule,
  User,
} from '@lob/shared';

export const mockUsers: User[] = [
  { id: 'u-exec-1', email: 'exec@example.com', name: 'Alex Executive', role: 'executive' },
  { id: 'u-dev-1', email: 'dev@example.com', name: 'Jordan Developer', role: 'developer' },
  { id: 'u-ops-1', email: 'ops@example.com', name: 'Sam Operations', role: 'operations' },
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    name: 'Customer Portal',
    description: 'External facing customer self-service portal',
    owner: 'Digital Experience',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2026-08-01T14:30:00Z',
  },
  {
    id: 'app-2',
    name: 'Claims Processing',
    description: 'Core claims intake and adjudication system',
    owner: 'Claims Ops',
    createdAt: '2024-11-05T09:00:00Z',
    updatedAt: '2026-07-28T11:15:00Z',
  },
  {
    id: 'app-3',
    name: 'Policy Admin',
    description: 'Policy lifecycle management',
    owner: 'Underwriting',
    createdAt: '2025-03-20T08:00:00Z',
    updatedAt: '2026-08-10T16:00:00Z',
  },
];

export const mockComponents: Component[] = [
  {
    id: 'comp-1',
    applicationId: 'app-1',
    name: 'portal-ui',
    description: 'React frontend for customer portal',
    imageRepository: 'ghcr.io/lob/portal-ui',
    currentImageTag: '1.4.2',
    environments: {
      nonprod: { status: 'healthy', version: '1.4.2', lastDeployedAt: '2026-08-12T09:00:00Z', replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '1.4.1', lastDeployedAt: '2026-08-10T14:00:00Z', replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '1.4.0', lastDeployedAt: '2026-08-05T11:00:00Z', replicas: 4, readyReplicas: 4 },
    },
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2026-08-12T09:00:00Z',
  },
  {
    id: 'comp-2',
    applicationId: 'app-1',
    name: 'portal-api',
    description: 'Backend API for customer portal',
    imageRepository: 'ghcr.io/lob/portal-api',
    currentImageTag: '2.1.0',
    environments: {
      nonprod: { status: 'healthy', version: '2.1.0', lastDeployedAt: '2026-08-13T08:30:00Z', replicas: 3, readyReplicas: 3 },
      preprod: { status: 'degraded', version: '2.0.8', lastDeployedAt: '2026-08-09T16:00:00Z', replicas: 3, readyReplicas: 2 },
      production: { status: 'healthy', version: '2.0.5', lastDeployedAt: '2026-08-01T10:00:00Z', replicas: 6, readyReplicas: 6 },
    },
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2026-08-13T08:30:00Z',
  },
  {
    id: 'comp-3',
    applicationId: 'app-2',
    name: 'claims-worker',
    description: 'Async claims processing worker',
    imageRepository: 'ghcr.io/lob/claims-worker',
    currentImageTag: '3.0.1',
    environments: {
      nonprod: { status: 'healthy', version: '3.0.1', lastDeployedAt: '2026-08-14T07:00:00Z', replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '3.0.0', lastDeployedAt: '2026-08-11T12:00:00Z', replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '2.9.4', lastDeployedAt: '2026-07-30T09:00:00Z', replicas: 5, readyReplicas: 5 },
    },
    createdAt: '2024-11-08T10:00:00Z',
    updatedAt: '2026-08-14T07:00:00Z',
  },
  {
    id: 'comp-4',
    applicationId: 'app-3',
    name: 'policy-service',
    description: 'Policy CRUD and lifecycle service',
    imageRepository: 'ghcr.io/lob/policy-service',
    currentImageTag: '1.8.3',
    environments: {
      nonprod: { status: 'healthy', version: '1.8.3', lastDeployedAt: '2026-08-14T10:00:00Z', replicas: 2, readyReplicas: 2 },
      preprod: { status: 'unknown', version: '1.8.1', lastDeployedAt: '2026-08-08T15:00:00Z', replicas: 2, readyReplicas: 0 },
      production: { status: 'healthy', version: '1.7.9', lastDeployedAt: '2026-07-25T11:00:00Z', replicas: 4, readyReplicas: 4 },
    },
    createdAt: '2025-03-22T10:00:00Z',
    updatedAt: '2026-08-14T10:00:00Z',
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: 'sch-1',
    componentId: 'comp-1',
    name: 'Weekly nonprod repave',
    cron: '0 2 * * 1',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'u-ops-1',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'sch-2',
    componentId: 'comp-2',
    name: 'Nightly nonprod + preprod',
    cron: '0 3 * * *',
    environments: ['nonprod', 'preprod'],
    enabled: true,
    createdBy: 'u-dev-1',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
];

function makeSteps(
  names: string[],
  finalStatus: 'success' | 'failed' = 'success',
): PipelineRun['steps'] {
  const now = Date.now();
  return names.map((name, i) => {
    const isLast = i === names.length - 1;
    const status = isLast && finalStatus === 'failed' ? 'failed' : 'success';
    const start = new Date(now - (names.length - i) * 45_000).toISOString();
    const end = new Date(now - (names.length - i - 1) * 45_000).toISOString();
    return {
      id: `step-${i + 1}`,
      name,
      status,
      order: i + 1,
      startTime: start,
      endTime: end,
      durationMs: 45_000,
      logsUrl: '#',
      message: status === 'failed' ? 'Step failed – see logs' : undefined,
    };
  });
}

export const mockRuns: PipelineRun[] = [
  {
    id: 'run-1',
    componentId: 'comp-1',
    applicationId: 'app-1',
    type: 'ci',
    label: 'Rebase (image rebuild)',
    status: 'success',
    trigger: 'on-demand',
    triggeredBy: 'u-dev-1',
    startTime: '2026-08-14T08:00:00Z',
    endTime: '2026-08-14T08:12:30Z',
    durationMs: 750_000,
    externalUrl: 'https://github.com/lob/portal-ui/actions/runs/12345',
    steps: makeSteps(['Checkout', 'Build', 'Unit Tests', 'Scan', 'Push Image']),
    createdAt: '2026-08-14T08:00:00Z',
  },
  {
    id: 'run-2',
    componentId: 'comp-1',
    applicationId: 'app-1',
    type: 'cd',
    label: 'Repave → nonprod',
    status: 'success',
    trigger: 'scheduled',
    triggeredBy: 'system',
    environments: ['nonprod'],
    startTime: '2026-08-12T02:00:00Z',
    endTime: '2026-08-12T02:08:15Z',
    durationMs: 495_000,
    externalUrl: 'https://app.harness.io/.../executions/67890',
    steps: makeSteps(['Approve', 'Fetch Artifact', 'Deploy OpenShift', 'Smoke Tests', 'Notify']),
    createdAt: '2026-08-12T02:00:00Z',
  },
  {
    id: 'run-3',
    componentId: 'comp-2',
    applicationId: 'app-1',
    type: 'cd',
    label: 'Repave → preprod',
    status: 'failed',
    trigger: 'on-demand',
    triggeredBy: 'u-ops-1',
    environments: ['preprod'],
    startTime: '2026-08-13T15:20:00Z',
    endTime: '2026-08-13T15:27:40Z',
    durationMs: 460_000,
    externalUrl: 'https://app.harness.io/.../executions/67891',
    steps: makeSteps(
      ['Approve', 'Fetch Artifact', 'Deploy OpenShift', 'Smoke Tests', 'Notify'],
      'failed',
    ),
    createdAt: '2026-08-13T15:20:00Z',
  },
  {
    id: 'run-4',
    componentId: 'comp-3',
    applicationId: 'app-2',
    type: 'ci',
    label: 'Rebase (image rebuild)',
    status: 'running',
    trigger: 'on-demand',
    triggeredBy: 'u-dev-1',
    startTime: '2026-08-15T11:45:00Z',
    externalUrl: 'https://github.com/lob/claims-worker/actions/runs/12399',
    steps: [
      { id: 's1', name: 'Checkout', status: 'success', order: 1, startTime: '2026-08-15T11:45:00Z', endTime: '2026-08-15T11:45:20Z', durationMs: 20_000 },
      { id: 's2', name: 'Build', status: 'success', order: 2, startTime: '2026-08-15T11:45:20Z', endTime: '2026-08-15T11:48:00Z', durationMs: 160_000 },
      { id: 's3', name: 'Unit Tests', status: 'running', order: 3, startTime: '2026-08-15T11:48:00Z' },
      { id: 's4', name: 'Scan', status: 'pending', order: 4 },
      { id: 's5', name: 'Push Image', status: 'pending', order: 5 },
    ],
    createdAt: '2026-08-15T11:45:00Z',
  },
  {
    id: 'run-5',
    componentId: 'comp-4',
    applicationId: 'app-3',
    type: 'cd',
    label: 'Repave → production',
    status: 'success',
    trigger: 'on-demand',
    triggeredBy: 'u-ops-1',
    environments: ['production'],
    startTime: '2026-07-25T11:00:00Z',
    endTime: '2026-07-25T11:18:00Z',
    durationMs: 1_080_000,
    externalUrl: 'https://app.harness.io/.../executions/55001',
    steps: makeSteps(['Change Approval', 'Fetch Artifact', 'Canary Deploy', 'Full Rollout', 'Health Checks', 'Notify']),
    createdAt: '2026-07-25T11:00:00Z',
  },
];
