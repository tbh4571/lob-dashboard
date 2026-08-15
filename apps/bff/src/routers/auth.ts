import { protectedProcedure, publicProcedure, router } from '../lib/trpc.js';

export const authRouter = router({
  /** Returns the currently authenticated user (or null) */
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  /** Simple health / session check */
  session: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      authenticated: true,
    };
  }),
});
