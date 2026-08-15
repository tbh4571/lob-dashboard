import { Box, Typography, Stack, Skeleton } from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { trpc } from '../lib/trpc';
import type { StatCardDef } from '../components/StatCard';
import { ExecutiveOverview } from './dashboard/ExecutiveOverview';
import { DeveloperOverview } from './dashboard/DeveloperOverview';
import { OperationsOverview } from './dashboard/OperationsOverview';

export function DashboardPage() {
  const { data: apps, isLoading: appsLoading } = trpc.applications.list.useQuery();
  const { data: components } = trpc.components.list.useQuery();
  const { data: schedules } = trpc.schedules.list.useQuery();
  const { data: runs, isLoading: runsLoading } = trpc.runs.list.useQuery({ limit: 20 });
  const { data: user } = trpc.auth.me.useQuery();

  const successCount = runs?.filter((r) => r.status === 'success').length ?? 0;
  const failedCount = runs?.filter((r) => r.status === 'failed').length ?? 0;
  const runningCount = runs?.filter((r) => r.status === 'running').length ?? 0;

  const overviewReady = !appsLoading && !runsLoading && apps && runs && components && schedules && user;

  const baseStats: StatCardDef[] = [
    { icon: <AppsIcon color="primary" />, value: apps?.length ?? 0, label: 'Applications' },
    { icon: <CheckCircleIcon color="success" />, value: successCount, label: 'Successful runs' },
    { icon: <ErrorIcon color="error" />, value: failedCount, label: 'Failed runs' },
    { icon: <TimelineIcon color="info" />, value: runningCount, label: 'Running now' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Line of Business applications, components, and pipeline visibility
      </Typography>

      {!overviewReady ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : user.role === 'executive' ? (
        <ExecutiveOverview baseStats={baseStats} applications={apps} components={components} runs={runs} />
      ) : user.role === 'operations' ? (
        <OperationsOverview baseStats={baseStats} components={components} runs={runs} schedules={schedules} />
      ) : (
        <DeveloperOverview baseStats={baseStats} runs={runs} schedules={schedules} components={components} user={user} />
      )}
    </Box>
  );
}
