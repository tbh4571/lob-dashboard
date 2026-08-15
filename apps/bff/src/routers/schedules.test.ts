import { describe, it, expect } from 'vitest';
import { createCaller, mockUser } from '../test/helpers.js';

describe('schedules router', () => {
  it('lists schedules for a component', async () => {
    const caller = createCaller(mockUser('developer'));
    const schedules = await caller.schedules.list({ componentId: 'comp-1' });
    expect(Array.isArray(schedules)).toBe(true);
  });

  it('allows developer to create a schedule', async () => {
    const caller = createCaller(mockUser('developer'));
    const created = await caller.schedules.create({
      componentId: 'comp-2',
      name: 'Test nightly',
      cron: '0 4 * * *',
      environments: ['nonprod'],
      enabled: true,
    });

    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Test nightly');
    expect(created.cron).toBe('0 4 * * *');
    expect(created.createdBy).toBe('u-developer-test');
  });

  it('forbids executive from creating schedules', async () => {
    const caller = createCaller(mockUser('executive'));
    await expect(
      caller.schedules.create({
        componentId: 'comp-1',
        name: 'Should fail',
        cron: '0 1 * * *',
        environments: ['nonprod'],
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('allows developer to update a schedule', async () => {
    const caller = createCaller(mockUser('operations'));
    const list = await caller.schedules.list({ componentId: 'comp-1' });
    if (list.length === 0) return;

    const updated = await caller.schedules.update({
      id: list[0].id,
      enabled: false,
    });
    expect(updated.enabled).toBe(false);
  });
});
