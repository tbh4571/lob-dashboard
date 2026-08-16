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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import type { Component, Environment, PipelineRun, Schedule } from '../../types';
import { capitalize, envStatusColor, runStatusColor } from '../../lib/status';
import { cronExpression, describeNextRun, describeSchedule, nextRunDate } from '../../lib/scheduleFormat';
import type { StatTile } from '../../components/StatGrid';

interface Props {
  components: Component[];
  runs: PipelineRun[];
  schedules: Schedule[];
}

const ENVS: Environment[] = ['nonprod', 'preprod', 'production'];
const UPCOMING_WINDOW_MS = 48 * 60 * 60 * 1000;

interface UpcomingRow {
  schedule: Schedule;
  component: Component;
  next: Date;
}

/** Enabled automated schedules whose next occurrence falls within the next 48
 * hours — proactive "what's about to deploy" visibility, distinct from Active
 * Schedules below which lists everything regardless of timing. */
function computeUpcomingRepaves(schedules: Schedule[], components: Component[]): UpcomingRow[] {
  const now = new Date();
  const horizon = new Date(now.getTime() + UPCOMING_WINDOW_MS);
  const rows: UpcomingRow[] = [];

  for (const schedule of schedules) {
    if (!schedule.enabled || schedule.mode !== 'automated') continue;
    const component = components.find((c) => c.id === schedule.componentId);
    if (!component) continue;
    const next = nextRunDate(schedule, now);
    if (next <= horizon) rows.push({ schedule, component, next });
  }

  return rows.sort((a, b) => a.next.getTime() - b.next.getTime());
}

export function operationsStats(schedules: Schedule[]): StatTile[] {
  const enabledCount = schedules.filter((s) => s.enabled).length;

  return [
    {
      key: 'active-schedules',
      icon: <RocketLaunchIcon color="info" />,
      value: enabledCount,
      label: 'Active repave schedules',
    },
  ];
}

export function OperationsOverview({ components, runs, schedules }: Props) {
  const cdRuns = runs.filter((r) => r.type === 'cd').slice(0, 6);
  const enabledSchedules = schedules.filter((s) => s.enabled);
  const upcomingRepaves = computeUpcomingRepaves(schedules, components);
  const componentImage = (id: string) => {
    const c = components.find((c) => c.id === id);
    return c?.currentImageTag ? `${c.imageRepository}:${c.currentImageTag}` : '—';
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Upcoming Repaves (Next 48 Hours)
      </Typography>
      {upcomingRepaves.length > 0 ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Environments</TableCell>
                <TableCell>Runs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingRepaves.map(({ schedule, component }) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`/components/${component.id}`} underline="hover">
                      {component.name}
                    </Link>
                  </TableCell>
                  <TableCell>{schedule.environments.map(capitalize).join(', ') || '—'}</TableCell>
                  <TableCell>{describeNextRun(schedule)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          No repaves scheduled in the next 48 hours.
        </Typography>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Environment Health
      </Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Component</TableCell>
              {ENVS.map((env) => (
                <TableCell key={env} sx={{ textTransform: 'capitalize' }}>
                  {env}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {components.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/components/${c.id}`} underline="hover">
                    {c.name}
                  </Link>
                </TableCell>
                {ENVS.map((env) => {
                  const st = c.environments[env];
                  return (
                    <TableCell key={env}>
                      <Chip size="small" label={capitalize(st?.status ?? 'unknown')} color={envStatusColor(st?.status)} />
                      {st?.replicas != null && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {st.readyReplicas}/{st.replicas} ready
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {components.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary" align="center">
                    No components yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Deployments (CD / Repave)
      </Typography>
      <Stack spacing={1} sx={{ mb: 4 }}>
        {cdRuns.map((run) => (
          <Card key={run.id} variant="outlined">
            <CardActionArea component={RouterLink} to={`/runs/${run.id}`}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography fontWeight={600}>{run.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(run.startTime).toLocaleString()} · {capitalize(run.trigger)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {run.environments?.includes('production') && (
                      <Chip size="small" label="Production" color="secondary" variant="outlined" />
                    )}
                    <Chip size="small" label={capitalize(run.status)} color={runStatusColor(run.status)} />
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
        {cdRuns.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            No deployments yet.
          </Typography>
        )}
      </Stack>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Active Schedules
      </Typography>
      {enabledSchedules.length > 0 ? (
        <Card variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Next run</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enabledSchedules.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`/components/${s.componentId}`} underline="hover">
                      {components.find((c) => c.id === s.componentId)?.name ?? s.componentId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{describeSchedule(s)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      <code>{cronExpression(s)}</code>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <code>{componentImage(s.componentId)}</code>
                  </TableCell>
                  <TableCell>{describeNextRun(s)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary">No active schedules.</Typography>
      )}
    </Box>
  );
}
