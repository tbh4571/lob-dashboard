import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import type { Component, Environment, PipelineRun, Schedule } from '@lob/shared';
import { envStatusColor, runStatusColor } from '../../lib/status';

interface Props {
  components: Component[];
  runs: PipelineRun[];
  schedules: Schedule[];
}

const ENVS: Environment[] = ['nonprod', 'preprod', 'production'];

export function OperationsOverview({ components, runs, schedules }: Props) {
  const atRiskComponents = components.filter((c) =>
    ENVS.some((env) => {
      const status = c.environments[env]?.status;
      return status === 'degraded' || status === 'unknown';
    }),
  );

  const cdRuns = runs.filter((r) => r.type === 'cd').slice(0, 6);
  const enabledSchedules = schedules.filter((s) => s.enabled);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningAmberIcon color={atRiskComponents.length > 0 ? 'warning' : 'success'} />
                <Typography variant="h5" fontWeight={700}>
                  {atRiskComponents.length}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Components degraded or unknown
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <RocketLaunchIcon color="info" />
                <Typography variant="h5" fontWeight={700}>
                  {enabledSchedules.length}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Active repave schedules
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                      <Chip
                        size="small"
                        label={st?.status ?? 'unknown'}
                        color={envStatusColor(st?.status)}
                      />
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
                      {new Date(run.startTime).toLocaleString()} · {run.trigger}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {run.environments?.includes('production') && (
                      <Chip size="small" label="production" color="secondary" variant="outlined" />
                    )}
                    <Chip size="small" label={run.status} color={runStatusColor(run.status)} />
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
                <TableCell>Name</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Cron</TableCell>
                <TableCell>Environments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enabledSchedules.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    <Link component={RouterLink} to={`/components/${s.componentId}`} underline="hover">
                      {components.find((c) => c.id === s.componentId)?.name ?? s.componentId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code>{s.cron}</code>
                  </TableCell>
                  <TableCell>{s.environments.join(', ')}</TableCell>
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
