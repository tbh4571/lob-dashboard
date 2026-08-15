import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { developerProcedure, protectedProcedure, router } from '../lib/trpc.js';
import { mockSchedules } from '../mocks/data.js';
import type { Schedule } from '@lob/shared';

// In-memory store for demo mutations
const schedules: Schedule[] = [...mockSchedules];

export const schedulesRouter = router({
  list: protectedProcedure
    .input(z.object({ componentId: z.string().optional() }).optional())
    .query(({ input }) => {
      if (input?.componentId) {
        return schedules.filter((s) => s.componentId === input.componentId);
      }
      return schedules;
    }),

  create: developerProcedure
    .input(
      z.object({
        componentId: z.string(),
        name: z.string().min(1),
        cron: z.string().min(1),
        environments: z.array(z.enum(['nonprod', 'preprod', 'production'])).min(1),
        enabled: z.boolean().optional().default(true),
      }),
    )
    .mutation(({ input, ctx }) => {
      const schedule: Schedule = {
        id: `sch-${Date.now()}`,
        componentId: input.componentId,
        name: input.name,
        cron: input.cron,
        environments: input.environments,
        enabled: input.enabled ?? true,
        createdBy: ctx.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      schedules.push(schedule);
      return schedule;
    }),

  update: developerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        cron: z.string().min(1).optional(),
        environments: z.array(z.enum(['nonprod', 'preprod', 'production'])).min(1).optional(),
        enabled: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => {
      const idx = schedules.findIndex((s) => s.id === input.id);
      if (idx === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
      }
      const updated = {
        ...schedules[idx],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      schedules[idx] = updated;
      return updated;
    }),

  delete: developerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const idx = schedules.findIndex((s) => s.id === input.id);
      if (idx === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
      }
      schedules.splice(idx, 1);
      return { success: true };
    }),
});
