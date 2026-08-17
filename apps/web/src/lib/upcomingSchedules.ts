import type { Component, Schedule } from '../types';
import { nextRunDate } from './scheduleFormat';

const UPCOMING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface UpcomingRow {
  schedule: Schedule;
  component: Component;
  next: Date;
}

function upcomingWithin(schedules: Schedule[], components: Component[], predicate: (s: Schedule) => boolean): UpcomingRow[] {
  const now = new Date();
  const horizon = new Date(now.getTime() + UPCOMING_WINDOW_MS);
  const rows: UpcomingRow[] = [];

  for (const schedule of schedules) {
    if (!schedule.enabled || !predicate(schedule)) continue;
    const component = components.find((c) => c.id === schedule.componentId);
    if (!component) continue;
    const next = nextRunDate(schedule, now);
    if (next <= horizon) rows.push({ schedule, component, next });
  }

  return rows.sort((a, b) => a.next.getTime() - b.next.getTime());
}

/** Every enabled schedule's next occurrence within the coming week — rebase always
 * runs regardless of mode, so manual-only schedules show up here even though they
 * never appear in Upcoming Repaves. */
export function computeUpcomingRebases(schedules: Schedule[], components: Component[]): UpcomingRow[] {
  return upcomingWithin(schedules, components, () => true);
}

/** Only automated schedules' next occurrence — manual schedules rebase but never
 * repave, so they're excluded here even though they show up in Upcoming Rebases. */
export function computeUpcomingRepaves(schedules: Schedule[], components: Component[]): UpcomingRow[] {
  return upcomingWithin(schedules, components, (s) => s.mode === 'automated');
}
