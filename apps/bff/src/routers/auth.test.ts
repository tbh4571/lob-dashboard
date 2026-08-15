import { describe, it, expect } from 'vitest';
import { createCaller, mockUser } from '../test/helpers.js';

describe('auth router', () => {
  it('me returns null when unauthenticated', async () => {
    const caller = createCaller(null);
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });

  it('me returns the current user when authenticated', async () => {
    const user = mockUser('developer');
    const caller = createCaller(user);
    const me = await caller.auth.me();
    expect(me).toEqual(user);
  });

  it('session requires authentication', async () => {
    const caller = createCaller(null);
    await expect(caller.auth.session()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('session returns user when authenticated', async () => {
    const user = mockUser('operations');
    const caller = createCaller(user);
    const session = await caller.auth.session();
    expect(session.authenticated).toBe(true);
    expect(session.user.role).toBe('operations');
  });
});
