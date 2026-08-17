import type { Schedule } from '../types';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DAY_OPTIONS = DAY_NAMES.map((label, value) => ({ value, label }));

export function formatHour(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({ value: hour, label: formatHour(hour) }));

/** Standard cron only expresses weekly recurrence; biweekly is noted separately since cron can't express "every other week". */
export function cronExpression(schedule: Pick<Schedule, 'hour' | 'dayOfWeek'>): string {
  return `0 ${schedule.hour} * * ${schedule.dayOfWeek}`;
}

export function describeSchedule(schedule: Pick<Schedule, 'frequency' | 'dayOfWeek' | 'hour'>): string {
  const day = DAY_NAMES[schedule.dayOfWeek];
  const time = formatHour(schedule.hour);
  return schedule.frequency === 'biweekly' ? `Every other ${day} at ${time}` : `Every ${day} at ${time}`;
}

export function describeMode(mode: Schedule['mode']): string {
  return mode === 'automated' ? 'Automated (Rebase + Repave)' : 'Manual (Rebase only)';
}

/**
 * Standard cron can't express "every other week" on its own, so biweekly
 * cadence is anchored to the schedule's createdAt: the first occurrence on/near
 * that date fixes which weeks are "on" weeks, then occurrences repeat every
 * 7 (weekly) or 14 (biweekly) days from there. Returns the next one at/after `from`.
 */
export function nextRunDate(
  schedule: Pick<Schedule, 'frequency' | 'dayOfWeek' | 'hour' | 'createdAt'>,
  from: Date = new Date(),
): Date {
  const intervalDays = schedule.frequency === 'biweekly' ? 14 : 7;
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

  const anchor = new Date(schedule.createdAt);
  const dayDiff = (schedule.dayOfWeek - anchor.getDay() + 7) % 7;
  anchor.setDate(anchor.getDate() + dayDiff);
  anchor.setHours(schedule.hour, 0, 0, 0);

  const steps = Math.max(0, Math.ceil((from.getTime() - anchor.getTime()) / intervalMs));
  return new Date(anchor.getTime() + steps * intervalMs);
}

export function describeNextRun(
  schedule: Pick<Schedule, 'frequency' | 'dayOfWeek' | 'hour' | 'createdAt' | 'enabled'>,
  from: Date = new Date(),
): string {
  if (!schedule.enabled) return '—';

  const next = nextRunDate(schedule, from);
  const time = formatHour(schedule.hour);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(next) - startOfDay(from)) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return `Today at ${time}`;
  if (diffDays === 1) return `Tomorrow at ${time}`;
  const weekday = next.toLocaleDateString(undefined, { weekday: 'short' });
  const monthDay = next.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${weekday}, ${monthDay} at ${time}`;
}
