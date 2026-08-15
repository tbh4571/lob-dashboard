import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../lib/trpc.js';
import { mockRuns } from '../mocks/data.js';

export const runsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          applicationId: z.string().optional(),
          componentId: z.string().optional(),
          type: z.enum(['ci', 'cd']).optional(),
          status: z.enum(['pending', 'running', 'success', 'failed', 'cancelled']).optional(),
          limit: z.number().min(1).max(100).optional().default(50),
        })
        .optional(),
    )
    .query(({ input }) => {
      let results = [...mockRuns];

      if (input?.applicationId) {
        results = results.filter((r) => r.applicationId === input.applicationId);
      }
      if (input?.componentId) {
        results = results.filter((r) => r.componentId === input.componentId);
      }
      if (input?.type) {
        results = results.filter((r) => r.type === input.type);
      }
      if (input?.status) {
        results = results.filter((r) => r.status === input.status);
      }

      // newest first
      results.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      return results.slice(0, input?.limit ?? 50);
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const run = mockRuns.find((r) => r.id === input.id);
      if (!run) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found' });
      }
      return run;
    }),
});
