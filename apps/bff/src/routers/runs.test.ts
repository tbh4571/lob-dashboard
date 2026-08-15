import { describe, it, expect } from 'vitest';
import { createCaller, mockUser } from '../test/helpers.js';

describe('runs router', () => {
  const caller = () => createCaller(mockUser('executive'));

  it('lists runs ordered by newest first', async () => {
    const runs = await caller().runs.list();
    expect(runs.length).toBeGreaterThan(0);
    for (let i = 1; i < runs.length; i++) {
      expect(new Date(runs[i - 1].startTime).getTime()).toBeGreaterThanOrEqual(
        new Date(runs[i].startTime).getTime(),
      );
    }
  });

  it('filters by type ci', async () => {
    const runs = await caller().runs.list({ type: 'ci' });
    expect(runs.every((r) => r.type === 'ci')).toBe(true);
  });

  it('filters by type cd', async () => {
    const runs = await caller().runs.list({ type: 'cd' });
    expect(runs.every((r) => r.type === 'cd')).toBe(true);
  });

  it('filters by status', async () => {
    const runs = await caller().runs.list({ status: 'success' });
    expect(runs.every((r) => r.status === 'success')).toBe(true);
  });

  it('filters by componentId', async () => {
    const runs = await caller().runs.list({ componentId: 'comp-1' });
    expect(runs.every((r) => r.componentId === 'comp-1')).toBe(true);
  });

  it('returns a single run by id with steps', async () => {
    const list = await caller().runs.list({ limit: 1 });
    const id = list[0].id;
    const run = await caller().runs.byId({ id });
    expect(run.id).toBe(id);
    expect(Array.isArray(run.steps)).toBe(true);
    expect(run.steps.length).toBeGreaterThan(0);
  });

  it('throws NOT_FOUND for unknown run', async () => {
    await expect(caller().runs.byId({ id: 'missing-run' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('requires authentication', async () => {
    const unauth = createCaller(null);
    await expect(unauth.runs.list()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
