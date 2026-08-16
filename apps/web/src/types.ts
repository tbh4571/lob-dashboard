// Domain types for the LOB Dashboard UI.
// Previously shared with a BFF via packages/shared; the BFF has been removed
// and these are kept as the shape the UI expects once a backend is reconnected.

export type Environment = 'nonprod' | 'preprod' | 'production';

export type RunType = 'ci' | 'cd'; // ci = Rebase (GitHub Actions), cd = Repave (Harness)

export type RunStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export type TriggerType = 'scheduled' | 'on-demand';

export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface Application {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Component {
  id: string;
  applicationId: string;
  name: string;
  description?: string;
  imageRepository?: string;
  currentImageTag?: string;
  environments: Partial<Record<Environment, ComponentEnvironmentStatus>>;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentEnvironmentStatus {
  status: 'healthy' | 'degraded' | 'unknown' | 'deploying';
  version?: string;
  lastDeployedAt?: string;
  replicas?: number;
  readyReplicas?: number;
}

export type ScheduleFrequency = 'weekly' | 'biweekly';

/** automated = Rebase + Repave on the schedule; manual = Rebase only. */
export type ScheduleMode = 'automated' | 'manual';

export interface Schedule {
  id: string;
  componentId: string;
  frequency: ScheduleFrequency;
  /** 0 = Sunday .. 6 = Saturday */
  dayOfWeek: number;
  /** 0-23, on the hour */
  hour: number;
  mode: ScheduleMode;
  /** Repave targets. Empty when mode is 'manual'. */
  environments: Environment[];
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: StepStatus;
  order: number;
  startTime?: string;
  endTime?: string;
  durationMs?: number;
  logsUrl?: string;
  message?: string;
}

export interface PipelineRun {
  id: string;
  componentId: string;
  applicationId: string;
  type: RunType;
  /** Human friendly label, e.g. "Rebase" or "Repave to production" */
  label: string;
  status: RunStatus;
  trigger: TriggerType;
  triggeredBy?: string; // user id or "system"
  environments?: Environment[]; // for CD/Repave
  startTime: string;
  endTime?: string;
  durationMs?: number;
  externalUrl?: string; // link to GitHub Actions run or Harness execution
  steps: PipelineStep[];
  createdAt: string;
}
