import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../lib/trpc.js';
import { mockComponents, mockApplications } from '../mocks/data.js';

export const componentsRouter = router({
  list: protectedProcedure
    .input(z.object({ applicationId: z.string().optional() }).optional())
    .query(({ input }) => {
      if (input?.applicationId) {
        return mockComponents.filter((c) => c.applicationId === input.applicationId);
      }
      return mockComponents;
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const component = mockComponents.find((c) => c.id === input.id);
      if (!component) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Component not found' });
      }
      const application = mockApplications.find((a) => a.id === component.applicationId);
      return { ...component, application };
    }),
});
