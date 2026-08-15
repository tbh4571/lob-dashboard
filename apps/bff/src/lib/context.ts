import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { User, UserRole } from '@lob/shared';

/**
 * PingFederate integration placeholder.
 * In production you would:
 * 1. Validate the access token / JWT from the Authorization header (or session cookie)
 * 2. Call PingFed userinfo or introspect endpoint
 * 3. Map claims (groups / roles) to our UserRole
 */
export async function createContext({ req }: CreateExpressContextOptions) {
  const authHeader = req.headers.authorization;
  let user: User | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // TODO: real PingFed JWT validation + role mapping
    // For now we accept a simple mock token pattern: "mock-<role>-<userid>"
    user = mockUserFromToken(token);
  }

  // Dev convenience: allow ?role= query for testing without token
  if (!user && process.env.NODE_ENV !== 'production') {
    const role = (req.query.role as UserRole) || 'developer';
    user = {
      id: 'dev-user-1',
      email: `${role}@example.com`,
      name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
    };
  }

  return { user, req };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

function mockUserFromToken(token: string): User | null {
  // Format: mock-executive | mock-developer | mock-operations
  if (token === 'mock-executive') {
    return { id: 'u-exec-1', email: 'exec@example.com', name: 'Alex Executive', role: 'executive' };
  }
  if (token === 'mock-developer') {
    return { id: 'u-dev-1', email: 'dev@example.com', name: 'Jordan Developer', role: 'developer' };
  }
  if (token === 'mock-operations') {
    return { id: 'u-ops-1', email: 'ops@example.com', name: 'Sam Operations', role: 'operations' };
  }
  return null;
}
