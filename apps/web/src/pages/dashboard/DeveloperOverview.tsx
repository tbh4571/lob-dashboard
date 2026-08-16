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
import type { Component, PipelineRun, Schedule } from '../../types';
import type { Persona } from '../../lib/persona';
import { capitalize, runStatusColor } from '../../lib/status';
import { cronExpression, describeNextRun, describeSchedule } from '../../lib/scheduleFormat';
import type { StatTile } from '../../components/StatGrid';
import { useDataStore } from '../../lib/store';

interface Props {
  runs: PipelineRun[];
  schedules: Schedule[];
  components: Component[];
  persona: Persona;
}

interface FlakyRow {
  component: Component;
  total: number;
  failed: number;
  failureRate: number;
  lastFailedAt: string;
}

/** Components with at least one success and one failure among their recent runs —
 * a quality signal distinct from the Attention Queue, which only shows the latest
 * failures. A component can drop off the queue once it's rerun successfully and
 * still belong here if it keeps flipping between passing and failing. */
function computeFlakyComponents(allRuns: PipelineRun[], components: Component[]): FlakyRow[] {
  const byComponent = new Map<string, PipelineRun[]>();
  for (const run of allRuns) {
    if (run.status !== 'success' && run.status !== 'failed') continue;
    const list = byComponent.get(run.componentId) ?? [];
    list.push(run);
    byComponent.set(run.componentId, list);
  }

  const rows: FlakyRow[] = [];
  for (const [componentId, componentRuns] of byComponent) {
    const failed = componentRuns.filter((r) => r.status === 'failed');
    if (failed.length === 0 || failed.length === componentRuns.length) continue;
    const component = components.find((c) => c.id === componentId);
    if (!component) continue;
    const lastFailedAt = failed.map((r) => r.startTime).sort().at(-1)!;
    rows.push({ component, total: componentRuns.length, failed: failed.length, failureRate: failed.length / componentRuns.length, lastFailedAt });
  }

  return rows.sort((a, b) => b.failureRate - a.failureRate || b.failed - a.failed).slice(0, 5);
}

export function developerStats(runs: PipelineRun[]): StatTile[] {
  const ciCompleted = runs.filter(
    (r) => r.type === 'ci' && (r.status === 'success' || r.status === 'failed'),
  );
  const ciSuccessRate =
    ciCompleted.length > 0
      ? Math.round((ciCompleted.filter((r) => r.status === 'success').length / ciCompleted.length) * 100)
      : 100;

  return [
    {
      key: 'ci-success-rate',
      icon: <BuildIcon color={ciSuccessRate >= 90 ? 'success' : 'warning'} />,
      value: `${ciSuccessRate}%`,
      label: 'CI / Rebase success rate',
    },
  ];
}

export function DeveloperOverview({ runs, schedules, components, persona }: Props) {
  const { runs: allRuns } = useDataStore();
  const ciRuns = runs.filter((r) => r.type === 'ci').slice(0, 6);
  const mySchedules = schedules.filter((s) => s.createdBy === persona.id);
  const flakyComponents = computeFlakyComponents(allRuns, components);
  const componentName = (id: string) => components.find((c) => c.id === id)?.name ?? id;
  const componentImage = (id: string) => {
    const c = components.find((c) => c.id === id);
    return c?.currentImageTag ? `${c.imageRepository}:${c.currentImageTag}` : '—';
  };

  return (
    <Box>
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
                    {run.triggeredBy === persona.id && (
                      <Chip size="small" label="You" variant="outlined" />
                    )}
                    <Chip size="small" label={capitalize(run.status)} color={runStatusColor(run.status)} />
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
                <TableCell>Component</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Next run</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mySchedules.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`/components/${s.componentId}`} underline="hover">
                      {componentName(s.componentId)}
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
                  <TableCell>
                    <Chip size="small" label={s.enabled ? 'Enabled' : 'Paused'} color={s.enabled ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary">You haven't created any schedules yet.</Typography>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 4 }}>
        Flaky Components
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Components that have both passed and failed recently — a quality signal, not just the latest failure.
      </Typography>
      {flakyComponents.length > 0 ? (
        <Card variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell align="right">Failure rate</TableCell>
                <TableCell align="right">Failed / Total runs</TableCell>
                <TableCell>Last failure</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flakyComponents.map(({ component, total, failed, failureRate, lastFailedAt }) => (
                <TableRow key={component.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`/components/${component.id}`} underline="hover">
                      {component.name}
                    </Link>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={`${Math.round(failureRate * 100)}%`}
                      color={failureRate >= 0.5 ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {failed} / {total}
                  </TableCell>
                  <TableCell>{new Date(lastFailedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary">No flaky components right now.</Typography>
      )}
    </Box>
  );
}
