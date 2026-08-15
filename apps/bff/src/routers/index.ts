import { router } from '../lib/trpc.js';
import { authRouter } from './auth.js';
import { applicationsRouter } from './applications.js';
import { componentsRouter } from './components.js';
import { schedulesRouter } from './schedules.js';
import { runsRouter } from './runs.js';
import { actionsRouter } from './actions.js';

export const appRouter = router({
  auth: authRouter,
  applications: applicationsRouter,
  components: componentsRouter,
  schedules: schedulesRouter,
  runs: runsRouter,
  actions: actionsRouter,
});

export type AppRouter = typeof appRouter;
