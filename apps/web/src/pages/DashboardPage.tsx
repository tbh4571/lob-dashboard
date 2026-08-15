import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Skeleton,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { trpc } from '../lib/trpc';
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

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Line of Business applications, components, and pipeline visibility
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AppsIcon color="primary" />
                <Typography variant="h5" fontWeight={700}>
                  {appsLoading ? '\u2014' : apps?.length ?? 0}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircleIcon color="success" />
                <Typography variant="h5" fontWeight={700}>
                  {successCount}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Successful runs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ErrorIcon color="error" />
                <Typography variant="h5" fontWeight={700}>
                  {failedCount}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Failed runs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TimelineIcon color="info" />
                <Typography variant="h5" fontWeight={700}>
                  {runningCount}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Running now
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!overviewReady ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : user.role === 'executive' ? (
        <ExecutiveOverview applications={apps} components={components} runs={runs} />
      ) : user.role === 'operations' ? (
        <OperationsOverview components={components} runs={runs} schedules={schedules} />
      ) : (
        <DeveloperOverview runs={runs} schedules={schedules} components={components} user={user} />
      )}
    </Box>
  );
}
