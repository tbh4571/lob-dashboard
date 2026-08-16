// Client-only mutable data store layered on top of ../lib/mockData's static seed.
// Stands in for the backend: schedule CRUD/pause-resume and Rebase/Repave actions
// mutate state here instead of calling an API, and newly triggered runs animate
// through their steps on a timer to give the subway map something to show.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Environment, PipelineRun, PipelineStep, Schedule, ScheduleFrequency, ScheduleMode } from '../types';
import { filterRuns, getComponentById, runs as seedRuns, schedules as seedSchedules, type RunFilter } from './mockData';
import { makeRunName } from './id';

const CI_STEP_NAMES = ['Checkout', 'Build', 'Unit Tests', 'Scan', 'Push Image'];
const CD_STEP_NAMES = ['Approve', 'Fetch Artifact', 'Deploy OpenShift', 'Smoke Tests', 'Notify'];
const STEP_DELAY_MS = 1400;

let scheduleIdCounter = 1000;
function nextScheduleId(): string {
  scheduleIdCounter += 1;
  return `sch-${scheduleIdCounter}`;
}

/** Generates a `<rebase|repave>-<applicationId>-<componentId>-<randomToken>` name,
 * retrying on the (astronomically unlikely) chance of a collision with an existing run. */
function uniqueRunName(type: 'rebase' | 'repave', applicationId: string, componentId: string, existingRuns: PipelineRun[]): string {
  let name = makeRunName(type, applicationId, componentId);
  while (existingRuns.some((r) => r.id === name)) {
    name = makeRunName(type, applicationId, componentId);
  }
  return name;
}

function buildSteps(names: string[]): PipelineStep[] {
  const now = new Date().toISOString();
  return names.map((name, i) => ({
    id: `step-${i + 1}`,
    name,
    status: i === 0 ? 'running' : 'pending',
    order: i + 1,
    startTime: i === 0 ? now : undefined,
  }));
}

export interface ScheduleFormInput {
  frequency: ScheduleFrequency;
  dayOfWeek: number;
  hour: number;
  mode: ScheduleMode;
  environments: Environment[];
}

interface DataStoreValue {
  schedules: Schedule[];
  runs: PipelineRun[];
  createSchedule: (componentId: string, createdBy: string, input: ScheduleFormInput) => void;
  updateSchedule: (id: string, input: ScheduleFormInput) => void;
  toggleSchedule: (id: string) => void;
  triggerRebase: (componentId: string, triggeredBy: string) => PipelineRun;
  triggerRepave: (componentId: string, environments: Environment[], triggeredBy: string) => PipelineRun;
  listRuns: (filter?: RunFilter) => PipelineRun[];
  getRunById: (id: string) => PipelineRun | undefined;
  listSchedulesByComponent: (componentId: string) => Schedule[];
  listSchedulesByCreator: (createdBy: string) => Schedule[];
}

const DataStoreContext = createContext<DataStoreValue | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>(seedSchedules);
  const [runs, setRuns] = useState<PipelineRun[]>(seedRuns);

  const createSchedule = useCallback((componentId: string, createdBy: string, input: ScheduleFormInput) => {
    const now = new Date().toISOString();
    const schedule: Schedule = {
      id: nextScheduleId(),
      componentId,
      frequency: input.frequency,
      dayOfWeek: input.dayOfWeek,
      hour: input.hour,
      mode: input.mode,
      environments: input.mode === 'manual' ? [] : input.environments,
      enabled: true,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    setSchedules((prev) => [...prev, schedule]);
  }, []);

  const updateSchedule = useCallback((id: string, input: ScheduleFormInput) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              frequency: input.frequency,
              dayOfWeek: input.dayOfWeek,
              hour: input.hour,
              mode: input.mode,
              environments: input.mode === 'manual' ? [] : input.environments,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  }, []);

  const toggleSchedule = useCallback((id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled, updatedAt: new Date().toISOString() } : s)),
    );
  }, []);

  const simulateProgress = useCallback((runId: string, totalSteps: number, stepIndex: number) => {
    setTimeout(() => {
      setRuns((prev) =>
        prev.map((r) => {
          if (r.id !== runId) return r;
          const now = new Date().toISOString();
          const steps = r.steps.map((s, i) => {
            if (i === stepIndex) return { ...s, status: 'success' as const, endTime: now };
            if (i === stepIndex + 1) return { ...s, status: 'running' as const, startTime: now };
            return s;
          });
          const isDone = stepIndex === totalSteps - 1;
          return {
            ...r,
            steps,
            status: isDone ? 'success' : r.status,
            endTime: isDone ? now : r.endTime,
            durationMs: isDone ? Date.now() - new Date(r.startTime).getTime() : r.durationMs,
          };
        }),
      );
      if (stepIndex + 1 < totalSteps) simulateProgress(runId, totalSteps, stepIndex + 1);
    }, STEP_DELAY_MS);
  }, []);

  const triggerRebase = useCallback(
    (componentId: string, triggeredBy: string): PipelineRun => {
      const component = getComponentById(componentId);
      const applicationId = component?.applicationId ?? '';
      const now = new Date().toISOString();
      const name = uniqueRunName('rebase', applicationId, componentId, runs);
      const run: PipelineRun = {
        id: name,
        componentId,
        applicationId,
        type: 'ci',
        label: name,
        status: 'running',
        trigger: 'on-demand',
        triggeredBy,
        startTime: now,
        steps: buildSteps(CI_STEP_NAMES),
        createdAt: now,
      };
      setRuns((prev) => [run, ...prev]);
      simulateProgress(run.id, CI_STEP_NAMES.length, 0);
      return run;
    },
    [runs, simulateProgress],
  );

  const triggerRepave = useCallback(
    (componentId: string, environments: Environment[], triggeredBy: string): PipelineRun => {
      const component = getComponentById(componentId);
      const applicationId = component?.applicationId ?? '';
      const now = new Date().toISOString();
      const name = uniqueRunName('repave', applicationId, componentId, runs);
      const run: PipelineRun = {
        id: name,
        componentId,
        applicationId,
        type: 'cd',
        label: name,
        status: 'running',
        trigger: 'on-demand',
        triggeredBy,
        environments,
        startTime: now,
        steps: buildSteps(CD_STEP_NAMES),
        createdAt: now,
      };
      setRuns((prev) => [run, ...prev]);
      simulateProgress(run.id, CD_STEP_NAMES.length, 0);
      return run;
    },
    [runs, simulateProgress],
  );

  const listRuns = useCallback((filter: RunFilter = {}) => filterRuns(runs, filter), [runs]);
  const getRunById = useCallback((id: string) => runs.find((r) => r.id === id), [runs]);
  const listSchedulesByComponent = useCallback(
    (componentId: string) => schedules.filter((s) => s.componentId === componentId),
    [schedules],
  );
  const listSchedulesByCreator = useCallback(
    (createdBy: string) => schedules.filter((s) => s.createdBy === createdBy),
    [schedules],
  );

  const value = useMemo<DataStoreValue>(
    () => ({
      schedules,
      runs,
      createSchedule,
      updateSchedule,
      toggleSchedule,
      triggerRebase,
      triggerRepave,
      listRuns,
      getRunById,
      listSchedulesByComponent,
      listSchedulesByCreator,
    }),
    [
      schedules,
      runs,
      createSchedule,
      updateSchedule,
      toggleSchedule,
      triggerRebase,
      triggerRepave,
      listRuns,
      getRunById,
      listSchedulesByComponent,
      listSchedulesByCreator,
    ],
  );

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
}

export function useDataStore(): DataStoreValue {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within a DataStoreProvider');
  return ctx;
}
