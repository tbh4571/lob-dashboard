// Lightweight, client-only stand-in for the auth/role system the BFF used to serve.
// Lets the dashboard demo its persona-specific views without a real backend.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type PersonaRole = 'executive' | 'developer' | 'operations';

export interface Persona {
  id: string;
  name: string;
  email: string;
  role: PersonaRole;
}

const PERSONAS: Record<PersonaRole, Persona> = {
  executive: { id: 'persona-exec', name: 'Alex Executive', email: 'exec@example.com', role: 'executive' },
  developer: { id: 'persona-dev', name: 'Jordan Developer', email: 'dev@example.com', role: 'developer' },
  operations: { id: 'persona-ops', name: 'Sam Operations', email: 'ops@example.com', role: 'operations' },
};

const STORAGE_KEY = 'lob-dashboard-persona';

function isPersonaRole(value: string | null): value is PersonaRole {
  return value === 'executive' || value === 'developer' || value === 'operations';
}

function readStoredRole(): PersonaRole {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isPersonaRole(stored) ? stored : 'developer';
}

interface PersonaContextValue {
  persona: Persona;
  setRole: (role: PersonaRole) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<PersonaRole>(readStoredRole);

  const value = useMemo<PersonaContextValue>(
    () => ({
      persona: PERSONAS[role],
      setRole: (next) => {
        localStorage.setItem(STORAGE_KEY, next);
        setRoleState(next);
      },
    }),
    [role],
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within a PersonaProvider');
  return ctx;
}
