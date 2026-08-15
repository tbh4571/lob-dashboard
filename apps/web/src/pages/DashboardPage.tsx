import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Skeleton,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { trpc } from '../lib/trpc';

export function DashboardPage() {
  const { data: apps, isLoading: appsLoading } = trpc.applications.list.useQuery();
  const { data: runs, isLoading: runsLoading } = trpc.runs.list.useQuery({ limit: 8 });
  const { data: user } = trpc.auth.me.useQuery();

  const successCount = runs?.filter((r) => r.status === 'success').length ?? 0;
  const failedCount = runs?.filter((r) => r.status === 'failed').length ?? 0;
  const runningCount = runs?.filter((r) => r.status === 'running').length ?? 0;

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

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Pipeline Runs
      </Typography>

      {runsLoading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : (
        <Stack spacing={1}>
          {runs?.map((run) => (
            <Card key={run.id} variant="outlined">
              <CardActionArea component={RouterLink} to={`/runs/${run.id}`}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography fontWeight={600}>{run.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(run.startTime).toLocaleString()} · {run.trigger}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={run.type === 'ci' ? 'CI / Rebase' : 'CD / Repave'}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={run.status}
                        color={
                          run.status === 'success'
                            ? 'success'
                            : run.status === 'failed'
                              ? 'error'
                              : run.status === 'running'
                                ? 'info'
                                : 'default'
                        }
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
