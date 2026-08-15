import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { developerProcedure, operationsProcedure, router } from '../lib/trpc.js';
import { mockComponents, mockRuns } from '../mocks/data.js';
import type { Environment, PipelineRun } from '@lob/shared';

/**
 * Rebase = trigger GitHub Actions workflow to rebuild the container image (CI)
 * Repave = trigger Harness pipeline to deploy to selected environments (CD)
 */

export const actionsRouter = router({
  /** Trigger image rebuild via GitHub Actions */
  rebase: developerProcedure
    .input(z.object({ componentId: z.string() }))
    .mutation(({ input, ctx }) => {
      const component = mockComponents.find((c) => c.id === input.componentId);
      if (!component) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Component not found' });
      }

      // In production: call GitHub Actions workflow_dispatch API
      const run: PipelineRun = {
        id: `run-${Date.now()}`,
        componentId: component.id,
        applicationId: component.applicationId,
        type: 'ci',
        label: 'Rebase (image rebuild)',
        status: 'running',
        trigger: 'on-demand',
        triggeredBy: ctx.user.id,
        startTime: new Date().toISOString(),
        externalUrl: `https://github.com/lob/${component.name}/actions`,
        steps: [
          { id: 's1', name: 'Checkout', status: 'pending', order: 1 },
          { id: 's2', name: 'Build', status: 'pending', order: 2 },
          { id: 's3', name: 'Unit Tests', status: 'pending', order: 3 },
          { id: 's4', name: 'Scan', status: 'pending', order: 4 },
          { id: 's5', name: 'Push Image', status: 'pending', order: 5 },
        ],
        createdAt: new Date().toISOString(),
      };

      mockRuns.unshift(run);
      return run;
    }),

  /** Trigger deployment via Harness */
  repave: developerProcedure
    .input(
      z.object({
        componentId: z.string(),
        environments: z.array(z.enum(['nonprod', 'preprod', 'production'])).min(1),
      }),
    )
    .mutation(({ input, ctx }) => {
      const component = mockComponents.find((c) => c.id === input.componentId);
      if (!component) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Component not found' });
      }

      const wantsProduction = input.environments.includes('production');
      if (wantsProduction && ctx.user.role !== 'operations') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only Operations can deploy to production',
        });
      }

      // In production: call Harness pipeline trigger API
      const envLabel = input.environments.join(', ');
      const run: PipelineRun = {
        id: `run-${Date.now()}`,
        componentId: component.id,
        applicationId: component.applicationId,
        type: 'cd',
        label: `Repave → ${envLabel}`,
        status: 'running',
        trigger: 'on-demand',
        triggeredBy: ctx.user.id,
        environments: input.environments as Environment[],
        startTime: new Date().toISOString(),
        externalUrl: 'https://app.harness.io/...',
        steps: [
          { id: 's1', name: 'Approve', status: 'pending', order: 1 },
          { id: 's2', name: 'Fetch Artifact', status: 'pending', order: 2 },
          { id: 's3', name: 'Deploy OpenShift', status: 'pending', order: 3 },
          { id: 's4', name: 'Smoke Tests', status: 'pending', order: 4 },
          { id: 's5', name: 'Notify', status: 'pending', order: 5 },
        ],
        createdAt: new Date().toISOString(),
      };

      mockRuns.unshift(run);
      return run;
    }),
});
