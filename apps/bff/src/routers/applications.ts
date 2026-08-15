import { z } from 'zod';
import { protectedProcedure, router } from '../lib/trpc.js';
import { mockApplications, mockComponents } from '../mocks/data.js';

export const applicationsRouter = router({
  list: protectedProcedure.query(() => {
    return mockApplications;
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const app = mockApplications.find((a) => a.id === input.id);
      if (!app) {
        throw new Error('Application not found');
      }
      return app;
    }),

  components: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(({ input }) => {
      return mockComponents.filter((c) => c.applicationId === input.applicationId);
    }),
});
