import { describe, it, expect } from 'vitest';
import { createCaller, mockUser } from '../test/helpers.js';

describe('applications router', () => {
  const caller = () => createCaller(mockUser('developer'));

  it('lists applications', async () => {
    const apps = await caller().applications.list();
    expect(apps.length).toBeGreaterThan(0);
    expect(apps[0]).toHaveProperty('id');
    expect(apps[0]).toHaveProperty('name');
  });

  it('gets application by id', async () => {
    const apps = await caller().applications.list();
    const app = await caller().applications.byId({ id: apps[0].id });
    expect(app.id).toBe(apps[0].id);
  });

  it('lists components for an application', async () => {
    const components = await caller().applications.components({ applicationId: 'app-1' });
    expect(components.length).toBeGreaterThan(0);
    expect(components.every((c) => c.applicationId === 'app-1')).toBe(true);
  });
});

describe('components router', () => {
  it('returns component with nested application', async () => {
    const caller = createCaller(mockUser('executive'));
    const result = await caller.components.byId({ id: 'comp-1' });
    expect(result.id).toBe('comp-1');
    expect(result.application).toBeDefined();
    expect(result.application?.id).toBe('app-1');
    expect(result.environments).toBeDefined();
  });
});
