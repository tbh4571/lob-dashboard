import { describe, it, expect, beforeEach } from 'vitest';
import { createCaller, mockUser } from '../test/helpers.js';
import { mockRuns } from '../mocks/data.js';

const COMPONENT_ID = 'comp-1';

describe('actions router', () => {
  beforeEach(() => {
    mockRuns.splice(5);
  });

  describe('rebase', () => {
    it('allows developer to trigger rebase', async () => {
      const caller = createCaller(mockUser('developer'));
      const run = await caller.actions.rebase({ componentId: COMPONENT_ID });
      expect(run.type).toBe('ci');
      expect(run.label).toContain('Rebase');
      expect(run.status).toBe('running');
      expect(run.trigger).toBe('on-demand');
      expect(run.triggeredBy).toBe('u-developer-test');
      expect(run.steps.length).toBeGreaterThan(0);
    });

    it('allows operations to trigger rebase', async () => {
      const caller = createCaller(mockUser('operations'));
      const run = await caller.actions.rebase({ componentId: COMPONENT_ID });
      expect(run.type).toBe('ci');
    });

    it('forbids executive from rebase', async () => {
      const caller = createCaller(mockUser('executive'));
      await expect(
        caller.actions.rebase({ componentId: COMPONENT_ID }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('forbids unauthenticated rebase', async () => {
      const caller = createCaller(null);
      await expect(
        caller.actions.rebase({ componentId: COMPONENT_ID }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('returns NOT_FOUND for unknown component', async () => {
      const caller = createCaller(mockUser('developer'));
      await expect(
        caller.actions.rebase({ componentId: 'does-not-exist' }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('repave', () => {
    it('allows developer to repave nonprod', async () => {
      const caller = createCaller(mockUser('developer'));
      const run = await caller.actions.repave({
        componentId: COMPONENT_ID,
        environments: ['nonprod'],
      });
      expect(run.type).toBe('cd');
      expect(run.label).toContain('nonprod');
      expect(run.environments).toEqual(['nonprod']);
      expect(run.status).toBe('running');
    });

    it('forbids developer from production repave', async () => {
      const caller = createCaller(mockUser('developer'));
      await expect(
        caller.actions.repave({
          componentId: COMPONENT_ID,
          environments: ['production'],
        }),
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'Only Operations can deploy to production',
      });
    });

    it('allows operations to repave production', async () => {
      const caller = createCaller(mockUser('operations'));
      const run = await caller.actions.repave({
        componentId: COMPONENT_ID,
        environments: ['production'],
      });
      expect(run.type).toBe('cd');
      expect(run.environments).toEqual(['production']);
      expect(run.triggeredBy).toBe('u-operations-test');
    });

    it('forbids executive from any repave', async () => {
      const caller = createCaller(mockUser('executive'));
      await expect(
        caller.actions.repave({
          componentId: COMPONENT_ID,
          environments: ['nonprod'],
        }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });
});
