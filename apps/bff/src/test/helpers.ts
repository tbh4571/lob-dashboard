import type { User, UserRole } from '@lob/shared';
import type { Context } from '../lib/context.js';
import { appRouter } from '../routers/index.js';

export function mockUser(role: UserRole, overrides: Partial<User> = {}): User {
  return {
    id: `u-${role}-test`,
    email: `${role}@test.example.com`,
    name: `Test ${role}`,
    role,
    ...overrides,
  };
}

export function createTestContext(user: User | null = null): Context {
  return {
    user,
    req: {} as Context['req'],
  };
}

/** Typed tRPC caller for unit tests (no HTTP) */
export function createCaller(user: User | null = null) {
  return appRouter.createCaller(createTestContext(user));
}
