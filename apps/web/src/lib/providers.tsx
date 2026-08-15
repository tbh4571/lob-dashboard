import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { trpc } from './trpc';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e40af' },
    secondary: { main: '#0f766e' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // Relative URL works with Vite proxy (dev) and same-origin Docker/production.
          // Override with VITE_TRPC_URL if the BFF is on a different host.
          url: import.meta.env.VITE_TRPC_URL || '/trpc',
          transformer: superjson,
          // Dev: send a mock role via header. For real PingFed, put the access token here.
          headers() {
            const role = localStorage.getItem('dev-role') || 'developer';
            return {
              Authorization: `Bearer mock-${role}`,
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
