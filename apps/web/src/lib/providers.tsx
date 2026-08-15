import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { trpc } from './trpc';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#E5525A', dark: '#A31621', light: '#F08088', contrastText: '#ffffff' },
    secondary: { main: '#FFC72C', dark: '#CC9E1F', light: '#FFD966', contrastText: '#1A1A1A' },
    background: { default: '#141010', paper: '#1e1817' },
    divider: 'rgba(255, 255, 255, 0.12)',
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
          url: 'http://localhost:4000/trpc',
          transformer: superjson,
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
