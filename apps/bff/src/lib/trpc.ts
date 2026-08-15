import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? (error.cause as any).flatten?.()
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

/** Requires authenticated user */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/** Developer or Operations */
export const developerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'developer' && ctx.user.role !== 'operations') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Requires developer or operations role',
    });
  }
  return next({ ctx });
});

/** Operations only */
export const operationsProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'operations') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Requires operations role',
    });
  }
  return next({ ctx });
});
