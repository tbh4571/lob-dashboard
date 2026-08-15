import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import type { Component, PipelineRun, Schedule, User } from '@lob/shared';
import { runStatusColor } from '../../lib/status';
import { StatCardRow, type StatCardDef } from '../../components/StatCard';

interface Props {
  baseStats: StatCardDef[];
  runs: PipelineRun[];
  schedules: Schedule[];
  components: Component[];
  user: User;
}

export function DeveloperOverview({ baseStats, runs, schedules, components, user }: Props) {
  const ciRuns = runs.filter((r) => r.type === 'ci').slice(0, 6);
  const ciCompleted = runs.filter(
    (r) => r.type === 'ci' && (r.status === 'success' || r.status === 'failed'),
  );
  const ciSuccessRate =
    ciCompleted.length > 0
      ? Math.round((ciCompleted.filter((r) => r.status === 'success').length / ciCompleted.length) * 100)
      : 100;

  const mySchedules = schedules.filter((s) => s.createdBy === user.id);
  const componentName = (id: string) => components.find((c) => c.id === id)?.name ?? id;

  const stats: StatCardDef[] = [
    ...baseStats,
    {
      icon: <BuildIcon color={ciSuccessRate >= 90 ? 'success' : 'warning'} />,
      value: `${ciSuccessRate}%`,
      label: 'CI / Rebase success rate',
    },
  ];

  return (
    <Box>
      <StatCardRow stats={stats} />

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Builds (CI / Rebase)
      </Typography>
      <Stack spacing={1} sx={{ mb: 4 }}>
        {ciRuns.map((run) => (
          <Card key={run.id} variant="outlined">
            <CardActionArea component={RouterLink} to={`/runs/${run.id}`}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography fontWeight={600}>{run.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(run.startTime).toLocaleString()} · {componentName(run.componentId)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {run.triggeredBy === user.id && (
                      <Chip size="small" label="You" variant="outlined" />
                    )}
                    <Chip size="small" label={run.status} color={runStatusColor(run.status)} />
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
        {ciRuns.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            No CI builds yet.
          </Typography>
        )}
      </Stack>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        My Schedules
      </Typography>
      {mySchedules.length > 0 ? (
        <Card variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Cron</TableCell>
                <TableCell>Environments</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mySchedules.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    <Link component={RouterLink} to={`/components/${s.componentId}`} underline="hover">
                      {componentName(s.componentId)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code>{s.cron}</code>
                  </TableCell>
                  <TableCell>{s.environments.join(', ')}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.enabled ? 'Enabled' : 'Disabled'} color={s.enabled ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary">
          You haven't created any schedules yet.
        </Typography>
      )}
    </Box>
  );
}
